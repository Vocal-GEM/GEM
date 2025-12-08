
import { useState, useEffect } from 'react';
import { programService } from '../services/ProgramService';

export const useProgram = () => {
    const [activeProgram, setActiveProgram] = useState(programService.getActiveProgram());
    const [progress, setProgress] = useState(programService.progress);
    const [currentDay, setCurrentDay] = useState(programService.getCurrentDay());

    useEffect(() => {
        // Initial sync
        setActiveProgram(programService.getActiveProgram());
        setProgress({ ...programService.progress });
        setCurrentDay(programService.getCurrentDay());

        const unsub = programService.subscribe((newProgress) => {
            setActiveProgram(programService.getActiveProgram());
            setProgress({ ...newProgress });
            setCurrentDay(programService.getCurrentDay());
        });
        return unsub;
    }, []);

    return {
        activeProgram,
        progress,
        currentDay,
        enroll: (id) => programService.enroll(id),
        completeTask: (id) => programService.completeTask(id),
        isTaskComplete: (id) => programService.isTaskComplete(id),
        nextDay: () => programService.nextDay()
    };
};
