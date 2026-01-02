import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle },
    error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle },
    info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info },
  };

  const style = styles[type] || styles.success;
  const Icon = style.icon;

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}>
      <Icon className={`w-5 h-5 ${style.text}`} />
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button onClick={onClose} className={`ml-2 hover:opacity-70 ${style.text}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
