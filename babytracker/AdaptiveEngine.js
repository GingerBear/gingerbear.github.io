/**
 * pwa/AdaptiveEngine.js
 * 
 * Simplified, predictable schedule engine:
 * 1. Daytime rhythm: Standard 1.5h (90m) awake and 1.5h (90m) nap.
 * 2. Bedtime: 8:00 PM (20:00) with flexible ±30m window (7:30 PM – 8:30 PM).
 * 3. Overnight: Bedtime stretches to 8:00 AM (DWT).
 * 4. Pre-bed window: 2.0h (120m) awake before bedtime (using 30m catnap if needed).
 */

// Universal Global Declaration
(function (root, factory) {
    const engine = factory();
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = engine;
    } else if (typeof define === 'function' && define.amd) {
        define([], function () { return engine; });
    }
    if (typeof root !== 'undefined' && root) {
        root.AdaptiveEngine = engine;
    }
    if (typeof globalThis !== 'undefined' && globalThis) {
        globalThis.AdaptiveEngine = engine;
    }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : this)), function () {

    const ROUTINE_CONFIG = {
        stage: "3–4 Months (Standard 1.5h Routine)",

        // --- MORNING & NIGHT BOUNDARIES ---
        wake: {
            desiredWakeTime: "08:00",          // Target DWT (8:00 AM)
            nightSleepCutoffBeforeDwtMins: 60  // Sleeps < 1h before DWT (before 7:00 AM) count as night sleep continuation
        },

        // --- BEDTIME & EVENING RULES ---
        bedtime: {
            targetTime: "20:00",               // 8:00 PM Bedtime target
            window: ["19:30", "20:30"],        // Bedtime window range (7:30 PM - 8:30 PM)
            preBedtimeWakeWindowMins: 120,     // Target 2h awake before bedtime
            nightCutoffHour: 19.5              // Sleeps starting >= 19:30 count as night sleep (bedtime)
        },

        // --- UNIFORM WAKE WINDOWS ---
        wakeWindows: {
            daytimeBaseMins: 90,              // Standard daytime wake window is 1.5h (90 mins)
            preBedtimeBaseMins: 120,          // 2.0h before bedtime
            catnapCutoffWakeTime: "17:15",    // Wakes at or after 17:15 transition directly to bedtime (no catnap)
            overdueThresholdMins: 30          // WW stretched by >= 30m considered overdue
        },

        // --- UNIFORM NAP DURATIONS ---
        naps: {
            standardNapDurMins: 90,           // Standard daytime nap duration is 1.5h (90 mins)
            catnapDurMins: 30,                // 30m power catnap
            catnapEarliestStartTime: "17:00", // Earliest bridge catnap window
            hardStop: "18:30"                 // All daytime sleep must end by 18:30
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
        if (isPreBed) return ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins; // 120m (2.0h)
        if (isBridge) {
            // Target 90m, but clamp to ensure 30m catnap finishes by 18:30
            const maxNapStart = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop) - ROUTINE_CONFIG.naps.catnapDurMins; // 18:30 - 30m = 18:00
            return Math.min(ROUTINE_CONFIG.wakeWindows.daytimeBaseMins, Math.max(60, maxNapStart - wakeMins));
        }
        return ROUTINE_CONFIG.wakeWindows.daytimeBaseMins; // 90m (1.5h)
    }

    function getAdaptiveNapDuration(sleepStartMins, isBridge) {
        if (isBridge || sleepStartMins >= parseTimeToMinutes(ROUTINE_CONFIG.naps.catnapEarliestStartTime)) {
            return ROUTINE_CONFIG.naps.catnapDurMins; // 30m catnap
        }
        return ROUTINE_CONFIG.naps.standardNapDurMins; // 90m (1.5h)
    }

    function shouldScheduleBridgeCatnap(wakeMins) {
        const afternoonPrepStartMins = 16 * 60; // 16:00 (4:00 PM)
        const catnapCutoffMins = parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.catnapCutoffWakeTime); // 17:15 (5:15 PM)
        return (wakeMins >= afternoonPrepStartMins && wakeMins < catnapCutoffMins);
    }

    function normalizeNaps(naps = []) {
        return naps.map(n => ({
            startMinutes: n.startMinutes !== undefined ? n.startMinutes : parseTimeToMinutes(n.start || n.startTime),
            endMinutes: n.endMinutes !== undefined ? n.endMinutes : parseTimeToMinutes(n.end || n.endTime),
            note: n.note || ''
        })).filter(n => n.startMinutes < n.endMinutes);
    }

    // =========================================================================
    // 3. ADAPTIVE SCHEDULE SIMULATION
    // =========================================================================

    function simulateDaySchedule(params = {}) {
        const BEDTIME_START_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[0]); // 19:30
        const BEDTIME_END_MINS = parseTimeToMinutes(ROUTINE_CONFIG.bedtime.window[1]);   // 20:30
        const morningStartMins = parseTimeToMinutes(ROUTINE_CONFIG.wake.desiredWakeTime) - ROUTINE_CONFIG.wake.nightSleepCutoffBeforeDwtMins; // 07:00
        const nightCutoffMins = Math.round(ROUTINE_CONFIG.bedtime.nightCutoffHour * 60); // 19:30 (1170 mins)

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

        rawCompletedNaps.forEach((nap, idx) => {
            const actualPrevWW = nap.startMinutes - lastWakeMins;
            const napDur = nap.endMinutes - nap.startMinutes;

            completedToday.push({
                type: 'wake_window',
                title: `☀️ Awake (Pre-Nap ${idx + 1})`,
                startTime: formatMinutesToTime(lastWakeMins),
                endTime: formatMinutesToTime(nap.startMinutes),
                durationMins: actualPrevWW,
                durationStr: formatMinsToHhMm(actualPrevWW),
                details: 'Completed wake window'
            });

            completedToday.push({
                type: 'nap',
                title: `💤 Nap ${idx + 1}`,
                napNumber: idx + 1,
                startTime: formatMinutesToTime(nap.startMinutes),
                endTime: formatMinutesToTime(nap.endMinutes),
                durationMins: napDur,
                durationStr: formatMinsToHhMm(napDur),
                details: `${formatMinsToHhMm(napDur)} nap`
            });

            lastWakeMins = nap.endMinutes;
            lastNapDur = napDur;
        });

        // --- STEP 2: Assess Current Live State & Forward Projections ---
        const remainingDayEstimates = [];

        function appendBedtimeProjection(startCursor, detailsNote) {
            let estBedStart;
            if (startCursor >= BEDTIME_START_MINS) {
                estBedStart = startCursor;
            } else {
                estBedStart = startCursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
                estBedStart = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, estBedStart));
            }
            const estWWMins = Math.max(0, estBedStart - startCursor);

            if (startCursor < estBedStart && estWWMins >= 15) {
                remainingDayEstimates.push({
                    type: 'wake_window',
                    title: '☀️ Pre-Bed Wake Window',
                    startTime: formatMinutesToTime(startCursor),
                    endTime: formatMinutesToTime(estBedStart),
                    durationMins: estWWMins,
                    durationStr: formatMinsToHhMm(estWWMins),
                    details: detailsNote || `Pre-bed window (${formatMinsToHhMm(estWWMins)}, target 2h)`
                });
            }

            const isDueNow = (startCursor >= BEDTIME_START_MINS);
            remainingDayEstimates.push({
                type: 'bedtime',
                title: isDueNow ? '🌙 Bedtime (Due Now)' : '🌙 Bedtime',
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
                // Night Sleep Active
                const totalNightMins = getElapsedAcrossMidnight(sleepStartMins, morningWakeMins);
                const remMins = Math.max(0, totalNightMins - elapsedMins);
                currentStatus = {
                    state: 'asleep',
                    isNightSleep: true,
                    sleepStartTime: formatMinutesToTime(sleepStartMins),
                    elapsedMins,
                    elapsedStr: formatMinsToHhMm(elapsedMins),
                    targetDurationMins: totalNightMins,
                    targetDurationStr: formatMinsToHhMm(totalNightMins),
                    projWakeTime: ROUTINE_CONFIG.wake.desiredWakeTime,
                    remainingMins: remMins,
                    remainingStr: formatMinsToHhMm(remMins),
                    summary: `💤 Night Sleep (Asleep for ${formatMinsToHhMm(elapsedMins)} · Est. Wake: ${ROUTINE_CONFIG.wake.desiredWakeTime})`
                };
                cursor = morningWakeMins;
            } else {
                // Daytime Nap Active
                const isBridge = (sleepStartMins >= parseTimeToMinutes(ROUTINE_CONFIG.naps.catnapEarliestStartTime));
                const typicalNapDur = getAdaptiveNapDuration(sleepStartMins, isBridge);
                const estWakeMins = sleepStartMins + typicalNapDur;
                const targetDurMins = typicalNapDur;
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
                napIndex = rawCompletedNaps.length + 2;
            }
        } else if (currentTimeMins < morningStartMins) {
            // Night Awake / Overnight Feed
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
            // Daytime / Evening Awake
            const elapsedAwakeMins = Math.max(0, currentTimeMins - lastWakeMins);
            const hardStopMins = parseTimeToMinutes(ROUTINE_CONFIG.naps.hardStop);
            const isEveningTime = (currentTimeMins >= hardStopMins || currentTimeMins >= BEDTIME_START_MINS);
            const isBridge = !isEveningTime && shouldScheduleBridgeCatnap(lastWakeMins);
            const isPreBed = isEveningTime || (!isBridge && (lastWakeMins >= parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.catnapCutoffWakeTime) || lastWakeMins + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins >= BEDTIME_START_MINS));

            let targetWW = isPreBed ? ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins : ROUTINE_CONFIG.wakeWindows.daytimeBaseMins;
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
                if (isPreBed) {
                    appendBedtimeProjection(currentTimeMins, 'Bedtime due now');
                    cursor = 1440;
                } else {
                    let napDur = getAdaptiveNapDuration(currentTimeMins, isBridge);
                    let estSleepEndMins = currentTimeMins + napDur;
                    const napTitle = isBridge ? '💤 Est. Bridge Catnap' : `💤 Est. Nap ${napIndex}`;

                    remainingDayEstimates.push({
                        type: isBridge ? 'catnap' : 'nap',
                        title: napTitle,
                        napNumber: isBridge ? 'Catnap' : napIndex,
                        startTime: formatMinutesToTime(currentTimeMins),
                        endTime: formatMinutesToTime(estSleepEndMins),
                        durationMins: napDur,
                        durationStr: formatMinsToHhMm(napDur),
                        details: isBridge ? '30m Power Catnap' : 'Standard 1.5h nap (Due now)'
                    });

                    cursor = estSleepEndMins;
                    napIndex++;
                }
            } else {
                cursor = lastWakeMins;
            }
        }

        // --- STEP 3: Forward Day Simulation ---
        while (cursor < 1440) {
            const isPreBed = (cursor >= parseTimeToMinutes(ROUTINE_CONFIG.wakeWindows.catnapCutoffWakeTime) || cursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins >= BEDTIME_START_MINS);

            if (isPreBed) {
                let estBedStart = cursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
                estBedStart = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, estBedStart));
                appendBedtimeProjection(cursor, `Pre-bed window (${formatMinsToHhMm(estBedStart - cursor)}, ~2h)`);
                break;
            }

            const isBridge = shouldScheduleBridgeCatnap(cursor);
            const targetWW = getAdaptiveWakeWindow(cursor, null, false, false, isBridge);
            const napStartMins = cursor + targetWW;
            const isCatnap = isBridge || (napStartMins >= parseTimeToMinutes(ROUTINE_CONFIG.naps.catnapEarliestStartTime));
            const napDur = isCatnap ? ROUTINE_CONFIG.naps.catnapDurMins : ROUTINE_CONFIG.naps.standardNapDurMins;
            const napEndMins = napStartMins + napDur;

            remainingDayEstimates.push({
                type: 'wake_window',
                title: isCatnap ? '☀️ Pre-Catnap Wake' : `☀️ Pre-Nap ${napIndex} Wake`,
                startTime: formatMinutesToTime(cursor),
                endTime: formatMinutesToTime(napStartMins),
                durationMins: targetWW,
                durationStr: formatMinsToHhMm(targetWW),
                details: isCatnap ? 'Pre-catnap window' : 'Standard 1.5h wake window'
            });

            remainingDayEstimates.push({
                type: isCatnap ? 'catnap' : 'nap',
                title: isCatnap ? '💤 Est. Bridge Catnap' : `💤 Est. Nap ${napIndex}`,
                napNumber: isCatnap ? 'Catnap' : napIndex,
                startTime: formatMinutesToTime(napStartMins),
                endTime: formatMinutesToTime(napEndMins),
                durationMins: napDur,
                durationStr: formatMinsToHhMm(napDur),
                details: isCatnap ? '30m Power Catnap' : 'Standard 1.5h nap'
            });

            cursor = napEndMins;
            napIndex++;

            if (isCatnap) {
                let estBedStart = cursor + ROUTINE_CONFIG.wakeWindows.preBedtimeBaseMins;
                estBedStart = Math.max(BEDTIME_START_MINS, Math.min(BEDTIME_END_MINS, estBedStart));
                appendBedtimeProjection(cursor, `Pre-bed window (${formatMinsToHhMm(estBedStart - cursor)}, ~2h)`);
                break;
            }
        }

        // --- STEP 4: Calculate Total Projected Sleep ---
        let totalCompletedNapMins = rawCompletedNaps.reduce((acc, n) => acc + (n.endMinutes - n.startMinutes), 0);
        let activeSleepMins = (activeSleep && !currentStatus.isNightSleep) ? currentStatus.elapsedMins : 0;
        let futureEstNapMins = remainingDayEstimates
            .filter(e => (e.type === 'nap' || e.type === 'catnap') && e.durationMins)
            .reduce((acc, e) => acc + e.durationMins, 0);

        const totalProjectedDaySleepMins = totalCompletedNapMins + activeSleepMins + futureEstNapMins;

        const dayMetrics = {
            totalCompletedNapMins,
            totalCompletedStr: formatMinsToHhMm(totalCompletedNapMins),
            totalProjectedMins: totalProjectedDaySleepMins,
            totalProjectedStr: formatMinsToHhMm(totalProjectedDaySleepMins),
            targetRangeStr: "3.5h – 4.5h",
            statusText: `✅ Optimal (${formatMinsToHhMm(totalProjectedDaySleepMins)})`
        };

        return {
            morningWakeTime: formatMinutesToTime(morningWakeMins),
            completedToday,
            remainingDayEstimates,
            currentStatus,
            dayMetrics
        };
    }

    function calculateDaySchedule(wakeTimeStr = ROUTINE_CONFIG.wake.desiredWakeTime) {
        return simulateDaySchedule({ morningWakeMins: parseTimeToMinutes(wakeTimeStr) });
    }

    function calculateLiveSleepStatus(params = {}) {
        const msToMins = (ms) => {
            if (!ms) return null;
            const d = new Date(ms);
            return (d.getHours() * 60) + d.getMinutes();
        };

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