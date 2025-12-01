import { useState, useEffect } from 'react';
import { useProfile } from '../context/ProfileContext';
import { getCourseForProfile } from '../data/courseData';

export const useCourseProgress = () => {
    const profileContext = useProfile();
    const activeProfile = profileContext?.activeProfile || 'guest';

    if (!profileContext) {
        console.warn("useCourseProgress: ProfileContext is missing. Using 'guest' profile.");
    }
    const [completedLessons, setCompletedLessons] = useState([]);
    const [currentCourse, setCurrentCourse] = useState([]);

    // Load progress and set current course
    useEffect(() => {
        const course = getCourseForProfile(activeProfile);
        setCurrentCourse(course);

        // Load progress specific to this profile (or global for now, can be refined)
        const savedProgress = localStorage.getItem(`gem_course_progress_${activeProfile}`);
        if (savedProgress) {
            setCompletedLessons(JSON.parse(savedProgress));
        } else {
            // Fallback to generic progress if profile-specific doesn't exist
            const genericProgress = localStorage.getItem('gem_course_progress');
            if (genericProgress) {
                setCompletedLessons(JSON.parse(genericProgress));
            } else {
                setCompletedLessons([]);
            }
        }
    }, [activeProfile]);

    const markLessonComplete = (lessonId) => {
        if (!completedLessons.includes(lessonId)) {
            const newProgress = [...completedLessons, lessonId];
            setCompletedLessons(newProgress);
            localStorage.setItem(`gem_course_progress_${activeProfile}`, JSON.stringify(newProgress));
            // Also update generic for backward compatibility
            localStorage.setItem('gem_course_progress', JSON.stringify(newProgress));
        }
    };

    const getNextLesson = () => {
        if (!currentCourse || currentCourse.length === 0) return null;

        for (const module of currentCourse) {
            for (const lesson of module.lessons) {
                if (!completedLessons.includes(lesson.id)) {
                    return {
                        ...lesson,
                        moduleTitle: module.title
                    };
                }
            }
        }
        return null; // Course complete
    };

    const getProgressPercentage = () => {
        if (!currentCourse || currentCourse.length === 0) return 0;
        const totalLessons = currentCourse.reduce((acc, module) => acc + module.lessons.length, 0);
        if (totalLessons === 0) return 0;

        // Count how many completed lessons are actually in the current course
        const completedInCourse = completedLessons.filter(id =>
            currentCourse.some(m => m.lessons.some(l => l.id === id))
        ).length;

        return Math.round((completedInCourse / totalLessons) * 100);
    };

    return {
        currentCourse,
        completedLessons,
        markLessonComplete,
        getNextLesson,
        getProgressPercentage
    };
};
