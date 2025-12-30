import { useEffect } from 'react';
import { CheckCircle, XCircle, X, AlertTriangle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle, role: 'status', ariaLive: 'polite' },
        error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle, role: 'alert', ariaLive: 'assertive' },
        warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, role: 'alert', ariaLive: 'assertive' },
        info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info, role: 'status', ariaLive: 'polite' },
    };

    const style = styles[type] || styles.success;
    const Icon = style.icon;

    return (
        <div
            className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
            role={style.role}
            aria-live={style.ariaLive}
            aria-atomic="true"
        >
            <Icon className={`w-5 h-5 ${style.text}`} />
            <span className={`font-medium ${style.text}`}>{message}</span>
            <button
                onClick={onClose}
                className={`ml-2 hover:opacity-70 ${style.text}`}
                aria-label="Close"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
