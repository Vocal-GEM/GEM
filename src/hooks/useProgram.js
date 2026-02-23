import { useState, useEffect } from 'react';
import { programService } from '../services/ProgramService';

export const useProgram = () => {
    // Initial state set from service directly
    const [activeProgram, setActiveProgram] = useState(() => programService.getActiveProgram());
    const [progress, setProgress] = useState(() => ({ ...programService.progress }));
    const [currentDay, setCurrentDay] = useState(() => programService.getCurrentDay());

    useEffect(() => {
        // Sync on mount just in case, but rely on subscription for updates.
        // We avoid calling setters if values are same, but here we just subscribe.
        // If we really need to sync on mount because service might have changed between render and mount:
        // we can do it, but usually subscription covers it.
        // To be safe and avoid "set state in effect" warning for synchronous updates:
        // check if state actually differs before setting.

        const currentActive = programService.getActiveProgram();
        if (currentActive !== activeProgram) setActiveProgram(currentActive);

        // Deep compare or simple check for progress? It's an object.
        // Let's assume subscription is the main way.

        const unsub = programService.subscribe((newProgress) => {
            setActiveProgram(programService.getActiveProgram());
            setProgress({ ...newProgress });
            setCurrentDay(programService.getCurrentDay());
        });
        return unsub;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        activeProgram,
        progress,
        currentDay,
        programs: programService.getPrograms(),
        enroll: (id) => programService.enroll(id),
        completeTask: (id) => programService.completeTask(id),
        isTaskComplete: (id) => programService.isTaskComplete(id),
        nextDay: () => programService.nextDay()
    };
};
