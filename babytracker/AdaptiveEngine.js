/**
 * AdaptiveEngine.html
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

    /**
     * Parses time string "HH:MM" or returns integer minutes if already a number.
     */
    function parseTimeToMinutes(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        if (!timeStr) return 0;
        const parts = String(timeStr).split(':');
        return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }

    /**
     * Formats minutes to clock time string HH:MM (e.g. 540 -> '09:00')
     */
    function formatMinutesToTime(mins) {
        if (mins === null || mins === undefined) return '--:--';
        mins = Math.round(mins);
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    /**
     * Formats minutes to human-readable duration (e.g. 90 -> '1h 30m', 45 -> '45m')
     */
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

    function getAdaptiveWakeWindow(wakeMins, prevNapDurMins, prevWWStretched, isPreBed, isBridge) {
        if (isPreBed) {
            const maxAllowed = ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins;
            const targetPreBed = ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
            return Math.min(maxAllowed, targetPreBed);
        }
        if (isBridge) {
            const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
            const minCatnapDur = ROUTINE_CONFIG.naps.bridgeCatnapMinDurMins;
            const minPreWw = ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;
            const targetPreWw = ROUTINE_CONFIG.wakeWindows.bridgeCatnapPreWwMins;
            const absoluteFloor = ROUTINE_CONFIG.wakeWindows.bridgeCatnapAbsoluteMinWwMins;

            // Flex pre-wake window down (between minPreWw and targetPreWw) so at least minCatnapDur finishes by hardStop
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

        // Short nap compensation (< threshold -> reduce next WW)
        if (prevNapDurMins !== null && prevNapDurMins !== undefined && prevNapDurMins > 0 && prevNapDurMins < ROUTINE_CONFIG.wakeWindows.shortNapThresholdMins) {
            base = Math.max(minWwFloor, base - ROUTINE_CONFIG.wakeWindows.shortNapWwReductionMins);
        }
        // Stretched previous WW compensation (> threshold overdue -> reduce next WW)
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

    /**
     * Determines if a wake time warrants a bridge catnap before bedtime.
     */
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

    /**
     * Normalizes an array of completed nap inputs (accepts {start: '09:00', end: '10:15'} or {startMinutes, endMinutes})
     */
    function normalizeNaps(naps = []) {
        return naps.map(n => ({
            startMinutes: n.startMinutes !== undefined ? n.startMinutes : parseTimeToMinutes(n.start || n.startTime),
            endMinutes: n.endMinutes !== undefined ? n.endMinutes : parseTimeToMinutes(n.end || n.endTime),
            note: n.note || ''
        })).filter(n => n.startMinutes < n.endMinutes);
    }

    /**
     * Simulates the current day state and projects estimates for the rest of the day.
     */
    function simulateDaySchedule(params = {}) {
        const bedtimeTargetMins = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.targetTime);
        const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
        const BEDTIME_START_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[0]); // 19:30 (1170)
        const BEDTIME_END_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[1]);   // 20:30 (1230)
        const morningStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wake.desiredWakeTime) - ROUTINE_CONFIG.wake.nightSleepCutoffBeforeDwtMins;
        const nightCutoffMins = ROUTINE_CONFIG.bedtime.nightCutoffHour * 60;
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

        // 1. Analyze Completed History
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

        // 2. Assess Current Live State at `currentTimeMins`
        let currentStatus = {};
        let cursor = lastWakeMins;
        let napIndex = rawCompletedNaps.length + 1;

        if (activeSleep) {
            const sleepStartMins = activeSleep.startMinutes;
            const isNight = activeSleep.isNightSleep || sleepStartMins >= nightCutoffMins || sleepStartMins < morningStartMins;
            let elapsedMins = 0;
            if (currentTimeMins >= sleepStartMins) {
                elapsedMins = currentTimeMins - sleepStartMins;
            } else {
                // Wrapped across midnight (e.g. 20:00 to 01:00 = 1440 - 1200 + 60 = 300m)
                elapsedMins = (1440 - sleepStartMins) + currentTimeMins;
            }

            if (isNight) {
                currentStatus = {
                    state: 'asleep',
                    isNightSleep: true,
                    sleepStartTime: formatMinutesToTime(sleepStartMins),
                    elapsedMins,
                    elapsedStr: formatMinsToHhMm(elapsedMins),
                    projWakeTime: `Tomorrow ${ROUTINE_CONFIG.wake.desiredWakeTime}`,
                    summary: `💤 Night Sleep (Asleep for ${formatMinsToHhMm(elapsedMins)})`
                };
                return {
                    simulatedTime: formatMinutesToTime(currentTimeMins),
                    currentStatus,
                    completedToday,
                    remainingDayEstimates: []
                };
            } else {
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
            // Baby is awake in the middle of the night (Overnight Awakening / Night Feed)
            const nightWakeMins = (params.lastWake || params.lastWakeTime) ? parseTimeToMinutes(params.lastWake || params.lastWakeTime) : currentTimeMins;
            let elapsedAwakeMins = 0;
            if (currentTimeMins >= nightWakeMins) {
                elapsedAwakeMins = currentTimeMins - nightWakeMins;
            } else {
                elapsedAwakeMins = (1440 - nightWakeMins) + currentTimeMins;
            }
            const targetWWMins = 30; // Night wakings goal: back to sleep within ~30m
            const estSleepTimeMins = (nightWakeMins + targetWWMins) % 1440;
            const remAwakeMins = Math.max(0, targetWWMins - elapsedAwakeMins);

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
            // Baby is currently awake during the day
            const elapsedAwakeMins = Math.max(0, currentTimeMins - lastWakeMins);
            const isBridge = shouldScheduleBridgeCatnap(lastWakeMins, bedtimeTargetMins, hardStopMins);
            const timeToEarliestBed = BEDTIME_START_MINS - lastWakeMins;
            const latestCatnapWakeMins = hardStopMins - ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;
            const isPreBed = !isBridge && (timeToEarliestBed <= ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins || lastWakeMins >= latestCatnapWakeMins);

            let targetWW = getAdaptiveWakeWindow(lastWakeMins, lastNapDur, prevWWStretched, isPreBed, isBridge);
            
            // If in direct bedtime transition, flex bedtime into the 19:30-20:30 window
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

            // If baby is overdue right now, they will sleep at currentTimeMins (or now), and compensate next WW
            if (currentTimeMins > scheduledSleepStartMins) {
                cursor = currentTimeMins;
                if (elapsedAwakeMins >= targetWW + ROUTINE_CONFIG.wakeWindows.overdueThresholdMins) {
                    prevWWStretched = true;
                }
            } else {
                cursor = lastWakeMins;
            }
        }

        // 3. Project Estimates for the Rest of the Day
        const remainingDayEstimates = [];

        function appendBedtimeProjection(startCursor, detailsNote) {
            let estBedStart = startCursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
            estBedStart = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, estBedStart));
            // Strict 2-hour pre-bed awake limit
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

        while (cursor < 1440) {
            const isBridge = shouldScheduleBridgeCatnap(cursor, bedtimeTargetMins, hardStopMins);
            const timeToEarliestBed = BEDTIME_START_MINS - cursor;
            const latestCatnapWakeMins = hardStopMins - ROUTINE_CONFIG.wakeWindows.bridgeCatnapMinPreWwMins;

            // Direct Bedtime Transition Check
            if (!isBridge && (timeToEarliestBed <= ROUTINE_CONFIG.bedtime.maxWakeWindowBeforeBedMins || cursor >= latestCatnapWakeMins)) {
                appendBedtimeProjection(cursor, `Pre-bed window (${formatMinsToHhMm(Math.min(120, Math.max(60, BEDTIME_START_MINS - cursor)))}, max 2h)`);
                break;
            }

            const targetWW = getAdaptiveWakeWindow(cursor, lastNapDur, prevWWStretched, false, isBridge);
            let estSleepStartMins = cursor + targetWW;

            // If nap would start too close to 18:00 hard stop and cannot fit a catnap, transition to bedtime directly
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
                isBridge ? `Shortened pre-catnap (${formatMinsToHhMm(targetWW)})` : ''
            ].filter(Boolean).join(', ') || 'Normal window';

            if (cursor < estSleepStartMins) {
                remainingDayEstimates.push({
                    type: 'wake_window',
                    title: wwTitle,
                    startTime: formatMinutesToTime(cursor),
                    endTime: formatMinutesToTime(estSleepStartMins),
                    durationMins: targetWW,
                    durationStr: formatMinsToHhMm(targetWW),
                    details: wwDetails
                });
            }

            remainingDayEstimates.push({
                type: isBridge ? 'catnap' : 'nap',
                title: napTitle,
                napNumber: isBridge ? 'Catnap' : napIndex++,
                startTime: formatMinutesToTime(estSleepStartMins),
                endTime: formatMinutesToTime(estSleepEndMins),
                durationMins: estSleepEndMins - estSleepStartMins,
                durationStr: formatMinsToHhMm(estSleepEndMins - estSleepStartMins),
                details: isBridge ? 'Bridge Catnap to 18:00' : 'Target daytime nap'
            });

            cursor = estSleepEndMins;
            lastNapDur = estSleepEndMins - estSleepStartMins;
            prevWWStretched = false;
        }

        // 4. Calculate Daytime Sleep Totals
        const completedDaySleepMins = rawCompletedNaps
            .filter(n => n.startMinutes >= morningStartMins && n.startMinutes < nightCutoffMins)
            .reduce((sum, n) => sum + (n.endMinutes - n.startMinutes), 0);

        let activeDaySleepMins = 0;
        if (activeSleep && !activeSleep.isNightSleep && activeSleep.startMinutes >= morningStartMins && activeSleep.startMinutes < nightCutoffMins) {
            activeDaySleepMins = Math.max(0, currentTimeMins - activeSleep.startMinutes);
        }

        const estimatedDaySleepMins = remainingDayEstimates
            .filter(e => e.type === 'nap' || e.type === 'catnap')
            .reduce((sum, e) => sum + (e.durationMins || 0), 0);

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

    /**
     * Backward-compatible helper for Index.html rendering.
     */
    function calculateDaySchedule(params = {}) {
        const result = simulateDaySchedule(params);
        return result.remainingDayEstimates;
    }

    /**
     * Calculates single live status for the quick status cards / action button.
     */
    function calculateLiveSleepStatus(params = {}) {
        const msToMins = ms => ms ? (new Date(ms).getHours() * 60 + new Date(ms).getMinutes()) : undefined;
        const wakeMins = msToMins(params.lastWakeUpTimeMs);
        const nowMins = msToMins(params.nowMs);
        const sleepStartMins = msToMins(params.activeSleepStartTimeMs);

        const sim = simulateDaySchedule({
            currentTimeMins: nowMins,
            activeSleep: sleepStartMins ? { startMinutes: sleepStartMins } : null,
            morningWakeMins: wakeMins,
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
                targetNapMins: status.targetDurationMins,
                projWakeStr: status.projWakeTime,
                startTimeStr: status.sleepStartTime
            };
        } else {
            return {
                state: 'awake',
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