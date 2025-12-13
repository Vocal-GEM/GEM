import { useState } from 'react';

/**
 * Hook to check if content warning should be shown
 * @param {string} warningTitle - Unique title/id for the warning
 */
export const useContentWarning = (warningTitle) => {
    const [showWarning, setShowWarning] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const checkAndShow = () => {
        const dismissed = JSON.parse(localStorage.getItem('gem_content_warnings_dismissed') || '[]');
        if (!dismissed.includes(warningTitle)) {
            setShowWarning(true);
        } else {
            setHasChecked(true);
        }
    };

    const onProceed = () => {
        setShowWarning(false);
        setHasChecked(true);
    };

    const onCancel = () => {
        setShowWarning(false);
    };

    return { showWarning, hasChecked, checkAndShow, onProceed, onCancel };
};
