
// ProgramService - Manages structured curricula and programs
import { SINGING_COURSE } from '../data/SingingCourse';

const FEMINIZATION_COURSE = {
    id: 'fem-4-week',
    title: '4-Week Feminization Course',
    description: 'A structured journey to brighten your resonance and lighten your vocal weight.',
    weeks: [
        {
            id: 'week-1',
            title: 'Week 1: Laying the Foundation',
            description: 'Focus on relaxation, breath support, and finding your "Head Voice".',
            days: [
                {
                    id: 'w1d1',
                    title: 'Day 1: Awareness & Relaxation',
                    tasks: [
                        { type: 'warmup', id: 'sovt_straw', title: 'Straw Phonation (5 min)' },
                        { type: 'reading', id: 'rainbow_passage_1', title: 'Read Rainbow Passage (Relaxed)', toolId: 'assessment', params: { tab: 'baseline', passage: 'rainbow' } },
                        { type: 'drill', id: 'quiet_breathing', title: 'Silent Inhalation Drill' }
                    ]
                },
                {
                    id: 'w1d2',
                    title: 'Day 2: Exploring Pitch',
                    tasks: [
                        { type: 'warmup', id: 'lip_trills', title: 'Lip Trills (5 min)' },
                        { type: 'drill', id: 'pitch_glides', title: 'Gentle Pitch Glides', toolId: 'practice', params: { tool: 'pitch' } }
                    ]
                },
                {
                    id: 'w1d3',
                    title: 'Day 3: Introducing Resonance',
                    tasks: [
                        { type: 'warmup', id: 'humming', title: 'Forward Humming (Mmmm)' },
                        { type: 'drill', id: 'whisper_siren', title: 'Whisper Sirens', toolId: 'practice', params: { tool: 'pitch' } }
                    ]
                },
                { id: 'w1d4', title: 'Day 4: Rest & Hydration', tasks: [{ type: 'info', title: 'Drink 2L of water and rest your voice.' }] },
                { id: 'w1d5', title: 'Day 5: Synthesis', tasks: [{ type: 'drill', id: 'm_words', title: 'Words starting with M' }] },
                { id: 'w1d6', title: 'Day 6: Reading Practice', tasks: [{ type: 'reading', id: 'north_wind', title: 'North Wind and the Sun' }] },
                { id: 'w1d7', title: 'Day 7: Weekly Review', tasks: [{ type: 'record', title: 'Record a 1-minute clip for progress tracking.', toolId: 'assessment', params: { tab: 'quickCheck' } }] }
            ]
        },
        {
            id: 'week-2',
            title: 'Week 2: Brightening Resonance',
            description: 'Shifting the resonance forward and engaging the "bright" vocal tract configuration.',
            days: [
                { id: 'w2d1', title: 'Day 8: The "E" Vowel', tasks: [{ type: 'drill', id: 'e_vowel', title: 'Sustained "E" Vowel', toolId: 'practice', params: { tool: 'vowel' } }] },
                { id: 'w2d2', title: 'Day 9: Larynx Awareness', tasks: [{ type: 'video', id: 'larynx_video', title: 'Watch Larynx Control Guide' }] },
                { id: 'w2d3', title: 'Day 10: Pitch + Resonance', tasks: [{ type: 'drill', id: 'pitch_res_combo', title: 'Pitch & Resonance Combo', toolId: 'practice', params: { tool: 'pitch' } }] },
                { id: 'w2d4', title: 'Day 11: Rest', tasks: [] },
                { id: 'w2d5', title: 'Day 12: Vowel Scales', tasks: [{ type: 'drill', id: 'vowel_scales', title: 'Vowel Tuning Scales', toolId: 'training', params: { module: 'resonance-i' } }] },
                { id: 'w2d6', title: 'Day 13: Phrase Practice', tasks: [{ type: 'drill', id: 'shadowing_basic', title: 'Basic Shadowing Practice', toolId: 'training', params: { module: 'shadowing' } }] },
                { id: 'w2d7', title: 'Day 14: Review', tasks: [{ type: 'record', id: 'w2_review', title: 'Weekly Progress Recording', toolId: 'assessment', params: { tab: 'baseline' } }] }
            ]
        },
        {
            id: 'week-3',
            title: 'Week 3: Reducing Vocal Weight',
            description: 'Learning to speak softly and reducing the "buzz" or "press" in the voice.',
            days: []
        },
        {
            id: 'week-4',
            title: 'Week 4: Intonation & Flow',
            description: 'Adding melody and natural flow to your speech.',
            days: []
        }
    ]
};

class ProgramService {
    constructor() {
        this.currentProgram = null;
        this.progress = {};
        this.listeners = [];
        this.loadProgress();
    }

    async loadProgress() {
        // Mock loading from local storage for now
        const stored = localStorage.getItem('gem_program_progress');
        if (stored) {
            this.progress = JSON.parse(stored);
        } else {
            this.progress = {
                programId: null,
                currentWeek: 0,
                currentDay: 0,
                completedTasks: [] // Array of task IDs
            };
        }

        if (this.progress.programId) {
            this.currentProgram = this.getProgramById(this.progress.programId);
        }
        this.notify();
    }

    saveProgress() {
        localStorage.setItem('gem_program_progress', JSON.stringify(this.progress));
        this.notify();
    }

    getPrograms() {
        return [FEMINIZATION_COURSE, SINGING_COURSE];
    }

    getProgramById(id) {
        return this.getPrograms().find(p => p.id === id);
    }

    enroll(programId) {
        this.currentProgram = this.getProgramById(programId);
        this.progress = {
            programId: programId,
            currentWeek: 0,
            currentDay: 0,
            completedTasks: []
        };
        this.saveProgress();
    }

    getActiveProgram() {
        return this.currentProgram;
    }

    getCurrentDay() {
        if (!this.currentProgram) return null;
        const week = this.currentProgram.weeks[this.progress.currentWeek];
        if (!week) return null;
        return week.days[this.progress.currentDay];
    }

    completeTask(taskId) {
        if (!this.progress.completedTasks.includes(taskId)) {
            this.progress.completedTasks.push(taskId);
            this.saveProgress();
        }
    }

    isTaskComplete(taskId) {
        return this.progress.completedTasks.includes(taskId);
    }

    nextDay() {
        if (!this.currentProgram) return;

        let week = this.progress.currentWeek;
        let day = this.progress.currentDay + 1;

        if (day >= this.currentProgram.weeks[week].days.length) {
            day = 0;
            week++;
        }

        if (week < this.currentProgram.weeks.length) {
            this.progress.currentWeek = week;
            this.progress.currentDay = day;
            this.saveProgress();
        } else {
            // Program Complete!
            alert("Congratulations! You've finished the program!");
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.progress));
    }
}

export const programService = new ProgramService();
