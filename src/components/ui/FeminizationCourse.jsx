import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, PlayCircle, CheckCircle, Lock, Star } from 'lucide-react';
import { COURSE_DATA } from '../../data/courseData';
import LessonView from './LessonView';
import FeedbackModal from './FeedbackModal';

const FeminizationCourse = ({ onClose }) => {
    const [activeLesson, setActiveLesson] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);

    // Load progress from local storage
    useEffect(() => {
        const savedProgress = localStorage.getItem('gem_course_progress');
        if (savedProgress) {
            setCompletedLessons(JSON.parse(savedProgress));
        }
    }, []);

    const handleLessonComplete = (lessonId) => {
        if (!completedLessons.includes(lessonId)) {
            const newProgress = [...completedLessons, lessonId];
            setCompletedLessons(newProgress);
            localStorage.setItem('gem_course_progress', JSON.stringify(newProgress));

            // Trigger feedback for every 3rd lesson or just randomly for engagement
            if (newProgress.length % 3 === 0) {
                setShowFeedback(true);
            }
        }
    };

    const getLessonStatus = (lessonId) => {
        return completedLessons.includes(lessonId) ? 'completed' : 'locked'; // Simplified logic
    };

    const isLessonLocked = (lessonId, moduleIndex, lessonIndex) => {
        return false; // All lessons unlocked
    };

    const handleStartLesson = (lesson) => {
        setActiveLesson(lesson);
    };

    const handleNextLesson = () => {
        // Find current lesson index
        let currentModuleIndex = -1;
        let currentLessonIndex = -1;

        COURSE_DATA.forEach((module, mIdx) => {
            module.lessons.forEach((lesson, lIdx) => {
                if (lesson.id === activeLesson.id) {
                    currentModuleIndex = mIdx;
                    currentLessonIndex = lIdx;
                }
            });
        });

        // Check if there is a next lesson in the current module
        if (currentLessonIndex < COURSE_DATA[currentModuleIndex].lessons.length - 1) {
            setActiveLesson(COURSE_DATA[currentModuleIndex].lessons[currentLessonIndex + 1]);
        }
        // Or next module
        else if (currentModuleIndex < COURSE_DATA.length - 1) {
            setActiveLesson(COURSE_DATA[currentModuleIndex + 1].lessons[0]);
        } else {
            // Course complete!
            setActiveLesson(null);
        }
    };

    const handlePreviousLesson = () => {
        // Find current lesson index
        let currentModuleIndex = -1;
        let currentLessonIndex = -1;

        COURSE_DATA.forEach((module, mIdx) => {
            module.lessons.forEach((lesson, lIdx) => {
                if (lesson.id === activeLesson.id) {
                    currentModuleIndex = mIdx;
                    currentLessonIndex = lIdx;
                }
            });
        });

        if (currentLessonIndex > 0) {
            setActiveLesson(COURSE_DATA[currentModuleIndex].lessons[currentLessonIndex - 1]);
        } else if (currentModuleIndex > 0) {
            const prevModule = COURSE_DATA[currentModuleIndex - 1];
            setActiveLesson(prevModule.lessons[prevModule.lessons.length - 1]);
        }
    };

    // Calculate progress
    const totalLessons = COURSE_DATA.reduce((acc, module) => acc + module.lessons.length, 0);
    const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);

    if (activeLesson) {
        // Determine if there are next/prev lessons
        let currentModuleIndex = -1;
        let currentLessonIndex = -1;
        COURSE_DATA.forEach((module, mIdx) => {
            module.lessons.forEach((lesson, lIdx) => {
                if (lesson.id === activeLesson.id) {
                    currentModuleIndex = mIdx;
                    currentLessonIndex = lIdx;
                }
            });
        });

        const hasNext =
            currentLessonIndex < COURSE_DATA[currentModuleIndex].lessons.length - 1 ||
            currentModuleIndex < COURSE_DATA.length - 1;

        const hasPrevious =
            currentLessonIndex > 0 ||
            currentModuleIndex > 0;

        return (
            <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md">
                    <button
                        onClick={() => setActiveLesson(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Course Mode</h1>
                        <p className="text-white font-bold">{activeLesson.title}</p>
                    </div>
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full">
                    <LessonView
                        lesson={activeLesson}
                        onComplete={() => handleLessonComplete(activeLesson.id)}
                        onNext={handleNextLesson}
                        onPrevious={handlePreviousLesson}
                        hasNext={hasNext}
                        hasPrevious={hasPrevious}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-4 bg-slate-900/50 backdrop-blur-md">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Feminization Course</h1>
                    <p className="text-xs text-slate-400">Comprehensive Guide to Voice Feminization</p>
                </div>
                <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-white/5">
                    <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="text-xs font-bold text-white">{progressPercentage}% Complete</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Hero Section */}
                    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-pink-600 to-purple-700 p-8 text-white shadow-2xl">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/20">
                                MODULE 1: FOUNDATIONS
                            </span>
                            <h2 className="text-3xl font-bold mb-2">Welcome to Your Journey</h2>
                            <p className="text-pink-100 max-w-lg mb-6">
                                Start here to understand the core principles of voice feminization: Pitch, Resonance, and Weight.
                            </p>
                            <button
                                onClick={() => handleStartLesson(COURSE_DATA[0].lessons[0])}
                                className="px-6 py-3 bg-white text-pink-600 rounded-xl font-bold hover:bg-pink-50 transition-colors flex items-center gap-2 shadow-lg"
                            >
                                <PlayCircle className="w-5 h-5" />
                                Start First Lesson
                            </button>
                        </div>

                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4"></div>
                    </div>

                    {/* Course Curriculum */}
                    <div>
                        <h3 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5" />
                            Curriculum
                        </h3>

                        <div className="space-y-4">
                            {COURSE_DATA.map((module, mIdx) => (
                                <div key={module.id} className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden ${mIdx > 0 && isLessonLocked(module.lessons[0].id, mIdx, 0) ? 'opacity-75' : ''}`}>
                                    <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                        <h4 className="font-bold text-white">{module.title}</h4>
                                        <span className="text-xs text-slate-400">
                                            {module.lessons.filter(l => completedLessons.includes(l.id)).length}/{module.lessons.length} Completed
                                        </span>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {module.lessons.map((lesson, lIdx) => {
                                            const isLocked = isLessonLocked(lesson.id, mIdx, lIdx);
                                            const isCompleted = completedLessons.includes(lesson.id);

                                            return (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => !isLocked && handleStartLesson(lesson)}
                                                    className={`p-4 flex items-center gap-4 transition-colors group ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white/5'}`}
                                                >
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500 text-white' :
                                                        isLocked ? 'bg-slate-800 text-slate-500' :
                                                            'bg-pink-500/20 text-pink-400 group-hover:bg-pink-500 group-hover:text-white'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                                                            isLocked ? <Lock className="w-4 h-4" /> :
                                                                <PlayCircle className="w-4 h-4" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className={`text-sm font-bold ${isCompleted ? 'text-green-400' : 'text-slate-200'}`}>{lesson.title}</h5>
                                                        <p className="text-xs text-slate-500">{lesson.description}</p>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{lesson.duration}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                initialType="feedback"
            />
        </div >
    );
};

export default FeminizationCourse;
