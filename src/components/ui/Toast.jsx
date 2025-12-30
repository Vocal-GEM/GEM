import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const styles = {
        success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        error: 'bg-red-500/10 border-red-500/20 text-red-500',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500'
    };

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
        warning: AlertCircle
    };

    // Safe fallback for styles and icons
    const safeType = styles[type] ? type : 'info';
    const Icon = icons[safeType] || Info;

    const role = safeType === 'error' || safeType === 'warning' ? 'alert' : 'status';
    const ariaLive = safeType === 'error' || safeType === 'warning' ? 'assertive' : 'polite';

    return (
        <div
            role={role}
            aria-live={ariaLive}
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${styles[safeType]}`}
        >
            <Icon className={`w-5 h-5 ${safeType === 'success' ? 'text-emerald-400' : safeType === 'error' ? 'text-red-400' : safeType === 'warning' ? 'text-amber-400' : 'text-blue-400'}`} />
            <span className={`font-medium ${safeType === 'success' ? 'text-emerald-400' : safeType === 'error' ? 'text-red-400' : safeType === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>{message}</span>
            <button
                onClick={onClose}
                aria-label="Close notification"
                className={`ml-2 hover:opacity-70 ${safeType === 'success' ? 'text-emerald-400' : safeType === 'error' ? 'text-red-400' : safeType === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
