import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50';
    const textColor = type === 'success' ? 'text-green-400' : 'text-red-400';
    const Icon = type === 'success' ? CheckCircle : XCircle;

    return (
        <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${bgColor}`}>
            <Icon className={`w-5 h-5 ${textColor}`} />
            <span className={`font-medium ${textColor}`}>{message}</span>
            <button onClick={onClose} className={`ml-2 hover:opacity-70 ${textColor}`}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
