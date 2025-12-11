import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        return id;
    }, []);

    const hideToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) =>
        showToast(message, 'success', duration), [showToast]);

    const showError = useCallback((message, duration) =>
        showToast(message, 'error', duration), [showToast]);

    const showWarning = useCallback((message, duration) =>
        showToast(message, 'warning', duration), [showToast]);

    const showInfo = useCallback((message, duration) =>
        showToast(message, 'info', duration), [showToast]);

    const value = {
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        hideToast
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-20 md:bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            onClose={() => hideToast(toast.id)}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
