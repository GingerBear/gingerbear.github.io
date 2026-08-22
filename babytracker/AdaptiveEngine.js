/**
 * pwa/AdaptiveEngine.js
 * 
 * Core adaptive schedule engine for baby wake windows, nap durations, 
 * bridge catnaps, and bedtime projections.
 */

// Universal Global Declaration
(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.AdaptiveEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const ROUTINE_CONFIG = {
        stage: "3–4 Months (Adaptive Routine)",

        // --- MORNING & NIGHT BOUNDARIES ---
        wake: {
            desiredWakeTime: "08:00",          // Target DWT (8:00 AM)
            nightSleepCutoffBeforeDwtMins: 60  // Sleeps < 1h before DWT (before 7:00 AM) count as night sleep continuation
        },

        // --- BEDTIME & EVENING RULES ---
        bedtime: {
            targetTime: "20:00",               // 8:00 PM Bedtime target
            window: ["19:30", "20:30"],        // Bedtime window range (flexible 7:30 PM - 8:30 PM)
            minWakeWindowBeforeBedMins: 90,    // Minimum 1.5h awake before bedtime
            maxWakeWindowBeforeBedMins: 120,   // Max 2h awake before bedtime (strict 2h cap)
            eveningPrepStartHour: 16,          // Wake-ups after 4:00 PM transition towards bedtime prep
            nightCutoffHour: 19                // Sleeps after 7:00 PM count as bedtime
        },

        // --- DYNAMIC WAKE WINDOW RULES ---
        wakeWindows: {
            morningBaseMins: 75,              // Morning wake window (< 11:30 AM)
            middayBaseMins: 90,               // Midday wake window (11:30 AM - 15:00)
            afternoonBaseMins: 105,           // Afternoon wake window (15:00 - 17:30)
            bridgeCatnapPreWwMins: 75,        // Target wake window before a bridge catnap (75m)
            bridgeCatnapMinPreWwMins: 45,     // Minimum wake window before a bridge catnap (can flex down to 45m)
            bridgeCatnapAbsoluteMinWwMins: 40,// Absolute floor with short nap reduction (40m)
            preBedtimeBaseMins: 120,          // Before bedtime wake window (target 2h max)
            minWakeWindowMins: 50,            // General daytime wake window floor (50m)
            shortNapThresholdMins: 45,        // Naps < 45m considered short
            shortNapWwReductionMins: 15,      // Reduce next WW by 15m after a short nap
            overdueThresholdMins: 30,         // WW stretched by >= 30m considered overdue
            overdueWwReductionMins: 15,       // Reduce next WW by 15m if previous WW was overdue
            middayTransitionTime: "11:30",    // Transition time to midday wake windows (690m)
            afternoonTransitionTime: "15:00"  // Transition time to afternoon wake windows (900m)
        },

        // --- DYNAMIC NAP DURATIONS ---
        naps: {
            morningTargetDurMins: 105,        // Long morning nap (1h 45m)
            middayTargetDurMins: 90,          // Moderate midday nap (1h 30m)
            afternoonTargetDurMins: 60,       // Late afternoon nap (1h)
            bridgeCatnapMinDurMins: 30,       // Minimum bridge catnap duration (30m)
            bridgeCatnapMaxDurMins: 45,       // Maximum bridge catnap duration (45m)
            morningNapCutoffTime: "12:00",    // Naps before 12:00 PM get morningTargetDurMins
            middayNapCutoffTime: "15:30",     // Naps before 3:30 PM get middayTargetDurMins
            hardStop: "18:00"                 // All daytime naps must end by 6:00 PM
        },

        // --- FEEDING SCHEDULE ---
        feeds: {
            daytimeTargetIntervalMins: 210,    // 3.5 hours between feeds during the day
            bedtimeCutoff: "20:00",            // Daytime feeds stop at bedtime
            overnightFeeds: [
                { time: "00:00", label: "Est. Feed (Midnight)" }
            ]
        }
    };

    // =========================================================================
    // 1. TIME & FORMATTING UTILITIES
    // =========================================================================

    function parseTimeToMinutes(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        if (!timeStr) return 0;
        const parts = String(timeStr).split(':');
        return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }

    function formatMinutesToTime(mins) {
        if (mins === null || mins === undefined) return '--:--';
        mins = Math.round(mins);
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    function formatMinsToHhMm(mins) {
        if (!mins || isNaN(mins)) return '0m';
        mins = Math.round(mins);
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        if (h > 0 && m > 0) return `${h}h ${m}m`;
        if (h > 0) return `${h}h`;
        return `${m}m`;
    }

    const formatDuration = formatMinsToHhMm;

    function getElapsedAcrossMidnight(startMins, endMins) {
        if (endMins >= startMins) return endMins - startMins;
        return (1440 - startMins) + endMins;
    }

    // =========================================================================
    // 2. CORE WAKE WINDOW & NAP CALCULATIONS
    // =========================================================================

    function getAdaptiveWakeWindow(wakeMins, prevNapDurMins, prevWWStretched, isPreBed, isBridge) {
        if (isPreBed) {
            return Math.min(ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins, ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins);
        }
        if (isBridge) {
            const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
            const minCatnapDur = ROUTINE_CONFIG.naps.bridgeCatnapMinDurMins;
            const minPreWw = ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;
            const targetPreWw = ROUTINE_CONFIG.wakeWindows.bridgeCatnapPreWwMins;
            const absoluteFloor = ROUTINE_CONFIG.wakeWindows.bridgeCatnapAbsoluteMinWwMins;

            const maxPreWwToFitHardStop = Math.max(minPreWw, (hardStopMins - minCatnapDur) - wakeMins);
            let base = Math.min(targetPreWw, maxPreWwToFitHardStop);
            
            if (prevNapDurMins !== null && prevNapDurMins !== undefined && prevNapDurMins > 0 && prevNapDurMins < ROUTINE_CONFIG.wakeWindows.shortNapThresholdMins) {
                base = Math.max(absoluteFloor, base - ROUTINE_CONFIG.wakeWindows.shortNapWwReductionMins);
            }
            return Math.max(absoluteFloor, base);
        }

        const middayStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.middayTransitionTime);
        const afternoonStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.afternoonTransitionTime);
        const minWwFloor = ROUTINE_CONFIG.wakeWindows.minWakeWindowMins;

        let base = ROUTINE_CONFIG.wakeWindows.morningBaseMins;
        if (wakeMins >= middayStartMins && wakeMins < afternoonStartMins) {
            base = ROUTINE_CONFIG.wakeWindows.middayBaseMins;
        } else if (wakeMins >= afternoonStartMins) {
            base = ROUTINE_CONFIG.wakeWindows.afternoonBaseMins;
        }

        if (prevNapDurMins !== null && prevNapDurMins !== undefined && prevNapDurMins > 0 && prevNapDurMins < ROUTINE_CONFIG.wakeWindows.shortNapThresholdMins) {
            base = Math.max(minWwFloor, base - ROUTINE_CONFIG.wakeWindows.shortNapWwReductionMins);
        }
        if (prevWWStretched) {
            base = Math.max(minWwFloor, base - ROUTINE_CONFIG.wakeWindows.overdueWwReductionMins);
        }
        return base;
    }

    function getAdaptiveNapDuration(sleepStartMins, isBridge) {
        if (isBridge) {
            const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
            const minDur = ROUTINE_CONFIG.naps.bridgeCatnapMinDurMins;
            const maxDur = ROUTINE_CONFIG.naps.bridgeCatnapMaxDurMins;
            const availableMins = hardStopMins - sleepStartMins;
            return Math.max(minDur, Math.min(maxDur, availableMins));
        }

        const morningCutoffMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.morningNapCutoffTime);
        const middayCutoffMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.middayNapCutoffTime);

        if (sleepStartMins < morningCutoffMins) return ROUTINE_CONFIG.naps.morningTargetDurMins;
        if (sleepStartMins < middayCutoffMins) return ROUTINE_CONFIG.naps.middayTargetDurMins;
        return ROUTINE_CONFIG.naps.afternoonTargetDurMins;
    }

    function shouldScheduleBridgeCatnap(wakeMins, bedtimeTargetMins, hardStopMins) {
        const BEDTIME_START_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[0]);
        const timeToEarliestBed = BEDTIME_START_MINS - wakeMins;
        const minPreWw = ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;
        const minCatnapDur = ROUTINE_CONFIG.naps.bridgeCatnapMinDurMins;
        const afternoonStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.afternoonTransitionTime);
        
        const minNapStart = wakeMins + minPreWw;
        const canFitCatnapBeforeHardStop = (minNapStart <= hardStopMins - minCatnapDur);

        return (wakeMins >= afternoonStartMins && timeToEarliestBed > ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins && canFitCatnapBeforeHardStop);
    }

    function normalizeNaps(naps = []) {
        return naps.map(n => ({
            startMinutes: n.startMinutes !== undefined ? n.startMinutes : parseTimeToMinutes(n.start || n.startTime),
            endMinutes: n.endMinutes !== undefined ? n.endMinutes : parseTimeToMinutes(n.end || n.endTime),
            note: n.note || ''
        })).filter(n => n.startMinutes < n.endMinutes);
    }

    // =========================================================================
    // 3. THREE-PHASE ADAPTIVE SCHEDULE SIMULATION
    // =========================================================================

    function simulateDaySchedule(params = {}) {
        const bedtimeTargetMins = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.targetTime);
        const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
        const BEDTIME_START_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[0]); // 19:30
        const BEDTIME_END_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[1]);   // 20:30
        const morningStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wake.desiredWakeTime) - ROUTINE_CONFIG.wake.nightSleepCutoffBeforeDwtMins; // 07:00
        const nightCutoffMins = ROUTINE_CONFIG.bedtime.nightCutoffHour * 60; // 19:00
        const afternoonTransitionMins = parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.afternoonTransitionTime);

        const morningWakeMins = parseTimeToMinutes(params.morningWake || params.morningWakeMins || ROUTINE_CONFIG.wake.desiredWakeTime);
        const currentTimeMins = (params.currentTime !== undefined || params.currentTimeMins !== undefined)
            ? parseTimeToMinutes(params.currentTime !== undefined ? params.currentTime : params.currentTimeMins)
            : morningWakeMins;

        const rawCompletedNaps = normalizeNaps(params.completedNaps || []);
        let activeSleep = null;
        if (params.activeSleep) {
            activeSleep = {
                startMinutes: parseTimeToMinutes(params.activeSleep.start || params.activeSleep.startTime || params.activeSleep.startMinutes),
                isNightSleep: !!params.activeSleep.isNightSleep
            };
        }

        // --- STEP 1: Process Completed History ---
        const completedToday = [
            {
                type: 'morning_wake',
                title: '☀️ Morning Wake',
                time: formatMinutesToTime(morningWakeMins),
                minutes: morningWakeMins
            }
        ];

        let lastWakeMins = morningWakeMins;
        let lastNapDur = null;
        let prevWWStretched = false;

        rawCompletedNaps.forEach((nap, idx) => {
            const actualPrevWW = nap.startMinutes - lastWakeMins;
            const prevPrevNapDur = (idx > 0) ? (rawCompletedNaps[idx - 1].endMinutes - rawCompletedNaps[idx - 1].startMinutes) : null;
            const expectedPrevWW = getAdaptiveWakeWindow(lastWakeMins, prevPrevNapDur, false, false, false);
            const isOverdue = (actualPrevWW >= expectedPrevWW + ROUTINE_CONFIG.wakeWindows.overdueThresholdMins);
            prevWWStretched = isOverdue;

            const napDur = nap.endMinutes - nap.startMinutes;
            const isShort = (napDur < ROUTINE_CONFIG.wakeWindows.shortNapThresholdMins);

            completedToday.push({
                type: 'wake_window',
                title: `☀️ Awake (Pre-Nap ${idx + 1})`,
                startTime: formatMinutesToTime(lastWakeMins),
                endTime: formatMinutesToTime(nap.startMinutes),
                durationMins: actualPrevWW,
                durationStr: formatMinsToHhMm(actualPrevWW),
                details: isOverdue ? `Overdue by ${actualPrevWW - expectedPrevWW}m` : 'On track'
            });

            completedToday.push({
                type: 'nap',
                title: `💤 Nap ${idx + 1}`,
                napNumber: idx + 1,
                startTime: formatMinutesToTime(nap.startMinutes),
                endTime: formatMinutesToTime(nap.endMinutes),
                durationMins: napDur,
                durationStr: formatMinsToHhMm(napDur),
                details: isShort ? 'Short Catnap (<45m)' : 'Good Nap'
            });

            lastWakeMins = nap.endMinutes;
            lastNapDur = napDur;
        });

        // --- STEP 2: Assess Current Live State & Forward Simulation Setup ---
        const remainingDayEstimates = [];

        function appendBedtimeProjection(startCursor, detailsNote) {
            let estBedStart = startCursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
            estBedStart = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, estBedStart));
            if (estBedStart - startCursor > ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins) {
                estBedStart = startCursor + ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins;
            }
            const estWWMins = Math.max(60, estBedStart - startCursor);

            if (startCursor < estBedStart) {
                remainingDayEstimates.push({
                    type: 'wake_window',
                    title: '☀️ Pre-Bed Wake Window',
                    startTime: formatMinutesToTime(startCursor),
                    endTime: formatMinutesToTime(estBedStart),
                    durationMins: estWWMins,
                    durationStr: formatMinsToHhMm(estWWMins),
                    details: detailsNote || `Pre-bed window (${formatMinsToHhMm(estWWMins)}, max 2h)`
                });
            }

            remainingDayEstimates.push({
                type: 'bedtime',
                title: '🌙 Bedtime',
                startTime: formatMinutesToTime(estBedStart),
                endTime: `Tomorrow ${ROUTINE_CONFIG.wake.desiredWakeTime}`,
                durationMins: null,
                durationStr: 'Night Sleep',
                details: `Bedtime window: ${ROUTINE_CONFIG.bedtime.window[0]}–${ROUTINE_CONFIG.bedtime.window[1]}`
            });
        }

        let currentStatus = {};
        let cursor = lastWakeMins;
        let napIndex = rawCompletedNaps.length + 1;

        if (activeSleep) {
            const sleepStartMins = activeSleep.startMinutes;
            const isNight = activeSleep.isNightSleep || sleepStartMins >= nightCutoffMins || sleepStartMins < morningStartMins;
            const elapsedMins = getElapsedAcrossMidnight(sleepStartMins, currentTimeMins);

            if (isNight) {
                // Phase 1: Night Sleep Active
                currentStatus = {
                    state: 'asleep',
                    isNightSleep: true,
                    sleepStartTime: formatMinutesToTime(sleepStartMins),
                    elapsedMins,
                    elapsedStr: formatMinsToHhMm(elapsedMins),
                    projWakeTime: ROUTINE_CONFIG.wake.desiredWakeTime,
                    summary: `💤 Night Sleep (Asleep for ${formatMinsToHhMm(elapsedMins)} · Est. Wake: ${ROUTINE_CONFIG.wake.desiredWakeTime})`
                };
                cursor = morningWakeMins;
            } else {
                // Phase 2: Daytime Nap Active
                const isBridge = (sleepStartMins >= afternoonTransitionMins);
                const typicalNapDur = getAdaptiveNapDuration(sleepStartMins, isBridge);
                let estWakeMins = Math.min(hardStopMins, sleepStartMins + typicalNapDur);
                const targetDurMins = estWakeMins - sleepStartMins;
                const remMins = Math.max(0, estWakeMins - currentTimeMins);
                const isNapOverdue = (currentTimeMins > estWakeMins);

                currentStatus = {
                    state: 'asleep',
                    isNightSleep: false,
                    isBridge,
                    napNumber: napIndex,
                    sleepStartTime: formatMinutesToTime(sleepStartMins),
                    elapsedMins,
                    elapsedStr: formatMinsToHhMm(elapsedMins),
                    targetDurationMins: targetDurMins,
                    targetDurationStr: formatMinsToHhMm(targetDurMins),
                    projWakeTime: formatMinutesToTime(estWakeMins),
                    remainingMins: remMins,
                    remainingStr: formatMinsToHhMm(remMins),
                    summary: isNapOverdue 
                        ? `💤 Asleep for ${formatMinsToHhMm(elapsedMins)} (Target: ${formatMinsToHhMm(targetDurMins)}, Due to wake up now)`
                        : `💤 Asleep for ${formatMinsToHhMm(elapsedMins)} (Est. Wake: ${formatMinutesToTime(estWakeMins)}, ${formatMinsToHhMm(remMins)} left)`
                };

                cursor = Math.max(currentTimeMins, estWakeMins);
                lastNapDur = cursor - sleepStartMins;
                prevWWStretched = false;
                napIndex = rawCompletedNaps.length + 2;
            }
        } else if (currentTimeMins < morningStartMins) {
            // Phase 1: Night Awake / Night Feed
            const nightWakeMins = (params.lastWake || params.lastWakeTime) ? parseTimeToMinutes(params.lastWake || params.lastWakeTime) : currentTimeMins;
            const elapsedAwakeMins = getElapsedAcrossMidnight(nightWakeMins, currentTimeMins);
            const targetWWMins = 30;
            const estSleepTimeMins = (nightWakeMins + targetWWMins) % 1440;

            currentStatus = {
                state: 'awake',
                isNightAwake: true,
                lastWakeTime: formatMinutesToTime(nightWakeMins),
                elapsedMins: elapsedAwakeMins,
                elapsedStr: formatMinsToHhMm(elapsedAwakeMins),
                targetWWMins,
                targetWWStr: `${targetWWMins}m`,
                isOverdue: elapsedAwakeMins >= targetWWMins + 15,
                isDueNow: elapsedAwakeMins >= targetWWMins,
                isPreBed: false,
                isBridge: false,
                nextEventName: 'Night Sleep Resumption',
                targetSleepTime: formatMinutesToTime(estSleepTimeMins),
                summary: `🌙 Night Feed / Waking (Goal: Back to sleep in ~30m · Morning DWT: ${ROUTINE_CONFIG.wake.desiredWakeTime})`
            };

            cursor = morningWakeMins;
        } else {
            // Phase 2 / Phase 3: Daytime Awake
            const elapsedAwakeMins = Math.max(0, currentTimeMins - lastWakeMins);
            const isBridge = shouldScheduleBridgeCatnap(lastWakeMins, bedtimeTargetMins, hardStopMins);
            const timeToEarliestBed = BEDTIME_START_MINS - lastWakeMins;
            const latestCatnapWakeMins = hardStopMins - ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;
            const isPreBed = !isBridge && (timeToEarliestBed <= ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins || lastWakeMins >= latestCatnapWakeMins);

            let targetWW = getAdaptiveWakeWindow(lastWakeMins, lastNapDur, prevWWStretched, isPreBed, isBridge);
            let scheduledSleepStartMins = lastWakeMins + targetWW;
            if (isPreBed) {
                scheduledSleepStartMins = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, scheduledSleepStartMins));
                targetWW = scheduledSleepStartMins - lastWakeMins;
            }

            const isOverdue = (currentTimeMins >= scheduledSleepStartMins + ROUTINE_CONFIG.wakeWindows.overdueThresholdMins);
            const isDueNow = (currentTimeMins >= scheduledSleepStartMins);
            const remAwakeMins = Math.max(0, scheduledSleepStartMins - currentTimeMins);

            currentStatus = {
                state: 'awake',
                isNightAwake: false,
                lastWakeTime: formatMinutesToTime(lastWakeMins),
                elapsedMins: elapsedAwakeMins,
                elapsedStr: formatMinsToHhMm(elapsedAwakeMins),
                targetWWMins: targetWW,
                targetWWStr: formatMinsToHhMm(targetWW),
                isOverdue,
                isDueNow,
                isPreBed,
                isBridge,
                nextEventName: isPreBed ? 'Bedtime' : (isBridge ? 'Bridge Catnap' : `Nap ${napIndex}`),
                targetSleepTime: formatMinutesToTime(scheduledSleepStartMins),
                summary: isOverdue
                    ? `☀️ Awake for ${formatMinsToHhMm(elapsedAwakeMins)} (Target: ${formatMinsToHhMm(targetWW)} -> Overdue by ${elapsedAwakeMins - targetWW}m!)`
                    : (isDueNow 
                        ? `☀️ Awake for ${formatMinsToHhMm(elapsedAwakeMins)} (Target: ${formatMinsToHhMm(targetWW)} -> Due Now)`
                        : `☀️ Awake for ${formatMinsToHhMm(elapsedAwakeMins)} (Next Sleep: ${formatMinutesToTime(scheduledSleepStartMins)}, in ${formatMinsToHhMm(remAwakeMins)})`)
            };

            if (currentTimeMins >= scheduledSleepStartMins) {
                // Baby is currently DUE NOW or OVERDUE for sleep -> Nap starts right NOW
                if (isPreBed) {
                    appendBedtimeProjection(currentTimeMins, 'Bedtime due now');
                    cursor = 1440; // Finished for the day
                } else {
                    let napDur = getAdaptiveNapDuration(currentTimeMins, isBridge);
                    let estSleepEndMins = Math.min(hardStopMins, currentTimeMins + napDur);
                    const napTitle = isBridge ? '💤 Est. Bridge Catnap' : `💤 Est. Nap ${napIndex}`;

                    remainingDayEstimates.push({
                        type: isBridge ? 'catnap' : 'nap',
                        title: napTitle,
                        napNumber: isBridge ? 'Catnap' : napIndex,
                        startTime: formatMinutesToTime(currentTimeMins),
                        endTime: formatMinutesToTime(estSleepEndMins),
                        durationMins: napDur,
                        durationStr: formatMinsToHhMm(napDur),
                        details: isBridge ? `Bridge Catnap to ${ROUTINE_CONFIG.naps.hardStop}` : 'Target daytime nap (Due now)'
                    });

                    cursor = estSleepEndMins;
                    lastNapDur = napDur;
                    prevWWStretched = isOverdue;
                    napIndex++;
                }
            } else {
                cursor = lastWakeMins;
            }
        }

        // --- STEP 3: Forward Day Simulation (Phases 2 & 3) ---
        while (cursor < 1440) {
            const isBridge = shouldScheduleBridgeCatnap(cursor, bedtimeTargetMins, hardStopMins);
            const timeToEarliestBed = BEDTIME_START_MINS - cursor;
            const latestCatnapWakeMins = hardStopMins - ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;

            // Phase 3: Direct Bedtime Transition
            if (!isBridge && (timeToEarliestBed <= ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins || cursor >= latestCatnapWakeMins)) {
                appendBedtimeProjection(cursor, `Pre-bed window (${formatMinsToHhMm(Math.min(120, Math.max(60, BEDTIME_START_MINS - cursor)))}, max 2h)`);
                break;
            }

            // Phase 2: Daytime Nap Projection
            const targetWW = getAdaptiveWakeWindow(cursor, lastNapDur, prevWWStretched, false, isBridge);
            let estSleepStartMins = cursor + targetWW;

            if (estSleepStartMins >= hardStopMins - 15) {
                appendBedtimeProjection(cursor, 'Hard stop reached -> Early Bedtime (max 2h awake)');
                break;
            }

            let napDur = getAdaptiveNapDuration(estSleepStartMins, isBridge);
            let estSleepEndMins = Math.min(hardStopMins, estSleepStartMins + napDur);

            const napTitle = isBridge ? '💤 Est. Bridge Catnap' : `💤 Est. Nap ${napIndex}`;
            const wwTitle = isBridge ? '☀️ Pre-Catnap Wake' : `☀️ Pre-Nap ${napIndex} Wake`;

            const wwDetails = [
                prevWWStretched ? 'Overdue compensation (-15m)' : '',
                (lastNapDur && lastNapDur < ROUTINE_CONFIG.wakeWindows.shortNapThresholdMins) ? 'Short nap compensation (-15m)' : '',
                isBridge ? `Shortened pre-catnap (${targetWW}m)` : ''
            ].filter(Boolean).join(' · ') || 'Normal window';

            remainingDayEstimates.push({
                type: 'wake_window',
                title: wwTitle,
                startTime: formatMinutesToTime(cursor),
                endTime: formatMinutesToTime(estSleepStartMins),
                durationMins: targetWW,
                durationStr: formatMinsToHhMm(targetWW),
                details: wwDetails
            });

            remainingDayEstimates.push({
                type: isBridge ? 'catnap' : 'nap',
                title: napTitle,
                napNumber: isBridge ? 'Catnap' : napIndex,
                startTime: formatMinutesToTime(estSleepStartMins),
                endTime: formatMinutesToTime(estSleepEndMins),
                durationMins: napDur,
                durationStr: formatMinsToHhMm(napDur),
                details: isBridge ? `Bridge Catnap to ${ROUTINE_CONFIG.naps.hardStop}` : 'Target daytime nap'
            });

            cursor = estSleepEndMins;
            lastNapDur = napDur;
            prevWWStretched = false;
            napIndex++;
        }

        // --- STEP 4: Daytime Sleep Summary Aggregation ---
        let completedDaySleepMins = 0;
        completedToday.forEach(e => {
            if (e.type === 'nap' && e.durationMins) completedDaySleepMins += e.durationMins;
        });

        let activeDaySleepMins = 0;
        if (activeSleep && !activeSleep.isNightSleep && activeSleep.startMinutes >= morningStartMins && activeSleep.startMinutes < nightCutoffMins) {
            activeDaySleepMins = Math.max(0, currentTimeMins - activeSleep.startMinutes);
        }

        let estimatedDaySleepMins = 0;
        remainingDayEstimates.forEach(e => {
            if ((e.type === 'nap' || e.type === 'catnap') && e.durationMins) {
                estimatedDaySleepMins += e.durationMins;
            }
        });

        const totalProjectedDaySleepMins = completedDaySleepMins + activeDaySleepMins + estimatedDaySleepMins;

        const daytimeSleepSummary = {
            completedMins: completedDaySleepMins,
            completedStr: formatMinsToHhMm(completedDaySleepMins),
            activeMins: activeDaySleepMins,
            activeStr: formatMinsToHhMm(activeDaySleepMins),
            estimatedMins: estimatedDaySleepMins,
            estimatedStr: formatMinsToHhMm(estimatedDaySleepMins),
            totalProjectedMins: totalProjectedDaySleepMins,
            totalProjectedStr: formatMinsToHhMm(totalProjectedDaySleepMins),
            targetRangeStr: "3.5h – 4.5h",
            statusText: totalProjectedDaySleepMins > 270 
                ? `⚠️ High (${formatMinsToHhMm(totalProjectedDaySleepMins)} > 4.5h max)` 
                : (totalProjectedDaySleepMins < 180 
                    ? `⚠️ Low (${formatMinsToHhMm(totalProjectedDaySleepMins)} < 3.0h min)` 
                    : `✅ Optimal (${formatMinsToHhMm(totalProjectedDaySleepMins)})`)
        };

        return {
            simulatedTime: formatMinutesToTime(currentTimeMins),
            currentStatus,
            completedToday,
            remainingDayEstimates,
            daytimeSleepSummary
        };
    }

    function calculateDaySchedule(params = {}) {
        return simulateDaySchedule(params).remainingDayEstimates;
    }

    function calculateLiveSleepStatus(params = {}) {
        const msToMins = ms => ms ? (new Date(ms).getHours() * 60 + new Date(ms).getMinutes()) : undefined;
        const wakeMins = msToMins(params.lastWakeUpTimeMs);
        const nowMins = msToMins(params.nowMs) || (new Date().getHours() * 60 + new Date().getMinutes());
        const sleepStartMins = msToMins(params.activeSleepStartTimeMs);

        const sim = simulateDaySchedule({
            currentTimeMins: nowMins,
            activeSleep: sleepStartMins ? { startMinutes: sleepStartMins } : null,
            lastWake: (wakeMins !== undefined) ? formatMinutesToTime(wakeMins) : undefined,
            completedNaps: (params.lastCompletedNapDurMins && wakeMins) ? [{
                startMinutes: wakeMins - params.lastCompletedNapDurMins,
                endMinutes: wakeMins
            }] : []
        });

        const status = sim.currentStatus;
        if (status.state === 'asleep') {
            return {
                state: 'asleep',
                isNightSleep: status.isNightSleep,
                targetNapMins: status.targetDurationMins || 90,
                projWakeStr: status.projWakeTime,
                startTimeStr: status.sleepStartTime
            };
        } else {
            return {
                state: 'awake',
                isNightAwake: status.isNightAwake,
                isBedtime: status.isPreBed,
                targetWWMins: status.targetWWMins,
                projSleepStr: status.targetSleepTime,
                wakeUpTimeStr: status.lastWakeTime,
                isBridge: status.isBridge
            };
        }
    }

    return {
        ROUTINE_CONFIG,
        parseTimeToMinutes,
        formatMinutesToTime,
        formatMinsToHhMm,
        formatDuration,
        getAdaptiveWakeWindow,
        getAdaptiveNapDuration,
        shouldScheduleBridgeCatnap,
        simulateDaySchedule,
        calculateDaySchedule,
        calculateLiveSleepStatus
    };
}));