
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
            days: [
                {
                    id: 'w3d1',
                    title: 'Day 15: Understanding Weight',
                    tasks: [
                        { type: 'video', id: 'weight_theory', title: 'Watch: Vocal Weight Explained' },
                        { type: 'drill', id: 'heavy_light_comparison', title: 'Heavy vs Light Voice Exercise', toolId: 'practice', params: { tool: 'voice-quality' } }
                    ]
                },
                {
                    id: 'w3d2',
                    title: 'Day 16: Light Sigh Exercise',
                    tasks: [
                        { type: 'warmup', id: 'breath_warmup', title: 'Breath Support Warmup (5 min)' },
                        { type: 'drill', id: 'light_sigh', title: 'Light Airy Sigh Practice', toolId: 'practice', params: { tool: 'voice-quality' } },
                        { type: 'drill', id: 'flow_phonation', title: 'Thin Fold Flow Phonation' }
                    ]
                },
                {
                    id: 'w3d3',
                    title: 'Day 17: Glissando Practice',
                    tasks: [
                        { type: 'warmup', id: 'sovt_straw_2', title: 'SOVT Straw Phonation (5 min)' },
                        { type: 'drill', id: 'high_low_gliss', title: 'High-to-Low Glissando', toolId: 'practice', params: { tool: 'pitch' } },
                        { type: 'drill', id: 'speaking_transfer', title: 'Transfer to Speaking Voice' }
                    ]
                },
                {
                    id: 'w3d4',
                    title: 'Day 18: Rest & Recovery',
                    tasks: [
                        { type: 'info', title: 'Complete rest day - no vocal exercises. Focus on hydration and gentle humming only if needed.' }
                    ]
                },
                {
                    id: 'w3d5',
                    title: 'Day 19: Weight Toolbox',
                    tasks: [
                        { type: 'drill', id: 'cartoon_imitation', title: 'Cartoon Character Imitation' },
                        { type: 'drill', id: 'yawn_sob_triggers', title: 'Yawning & Sobbing Triggers' },
                        { type: 'drill', id: 'chicken_neck', title: 'Chicken Neck Stretch' }
                    ]
                },
                {
                    id: 'w3d6',
                    title: 'Day 20: Word & Phrase Practice',
                    tasks: [
                        { type: 'drill', id: 'light_words', title: 'Practice Light Words (Hoo, Hee, Hey)' },
                        { type: 'drill', id: 'light_phrases', title: 'Light Phrase Practice', toolId: 'practice', params: { tool: 'voice-quality' } }
                    ]
                },
                {
                    id: 'w3d7',
                    title: 'Day 21: Week 3 Review',
                    tasks: [
                        { type: 'record', id: 'w3_review', title: 'Record Progress Sample', toolId: 'assessment', params: { tab: 'baseline' } },
                        { type: 'reflection', id: 'w3_journal', title: 'Journal: What changes do you notice in your vocal weight?' }
                    ]
                }
            ]
        },
        {
            id: 'week-4',
            title: 'Week 4: Intonation & Flow',
            description: 'Adding melody and natural flow to your speech.',
            days: [
                {
                    id: 'w4d1',
                    title: 'Day 22: Pitch Contour Awareness',
                    tasks: [
                        { type: 'video', id: 'intonation_intro', title: 'Watch: The Melody of Speech' },
                        { type: 'drill', id: 'contour_listening', title: 'Listen & Map Exercise', toolId: 'practice', params: { tool: 'contour-visualizer' } }
                    ]
                },
                {
                    id: 'w4d2',
                    title: 'Day 23: Syllable Separation',
                    tasks: [
                        { type: 'warmup', id: 'articulation_warmup', title: 'Articulation Warmup' },
                        { type: 'drill', id: 'robot_mode', title: 'Robot Mode Practice' },
                        { type: 'drill', id: 'elastic_mode', title: 'Elastic Mode Transition' }
                    ]
                },
                {
                    id: 'w4d3',
                    title: 'Day 24: Inflection Patterns',
                    tasks: [
                        { type: 'drill', id: 'question_intonation', title: 'Question Inflection Practice', toolId: 'practice', params: { tool: 'intonation-exercise' } },
                        { type: 'drill', id: 'statement_intonation', title: 'Statement Inflection Practice', toolId: 'practice', params: { tool: 'intonation-exercise' } },
                        { type: 'drill', id: 'emphasis_practice', title: 'Word Emphasis Drills' }
                    ]
                },
                {
                    id: 'w4d4',
                    title: 'Day 25: Rest Day',
                    tasks: [
                        { type: 'info', title: 'Rest and passive listening - listen to voices you admire, but no active practice.' }
                    ]
                },
                {
                    id: 'w4d5',
                    title: 'Day 26: Combining Elements',
                    tasks: [
                        { type: 'drill', id: 'pitch_res_weight', title: 'Pitch + Resonance + Weight Integration' },
                        { type: 'drill', id: 'sentence_practice', title: 'Full Sentence Practice with Contour', toolId: 'practice', params: { tool: 'contour-visualizer' } }
                    ]
                },
                {
                    id: 'w4d6',
                    title: 'Day 27: Real-World Application',
                    tasks: [
                        { type: 'drill', id: 'coffee_order', title: 'Scenario: Coffee Shop Order' },
                        { type: 'drill', id: 'phone_greeting', title: 'Scenario: Phone Call Opening' },
                        { type: 'drill', id: 'conversation_practice', title: 'Casual Conversation Practice' }
                    ]
                },
                {
                    id: 'w4d7',
                    title: 'Day 28: Course Completion',
                    tasks: [
                        { type: 'record', id: 'final_recording', title: 'Final Progress Recording', toolId: 'assessment', params: { tab: 'comparison' } },
                        { type: 'assessment', id: 'before_after', title: 'Compare Day 1 vs Day 28', toolId: 'comparison-tool' },
                        { type: 'reflection', id: 'graduation_journal', title: 'Final Reflection: Your Journey & Next Steps' }
                    ]
                }
            ]
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
