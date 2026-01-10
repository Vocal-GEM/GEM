import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle, role: 'status', label: 'Success' },
    error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle, role: 'alert', label: 'Error' },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, role: 'alert', label: 'Warning' },
    info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info, role: 'status', label: 'Information' },
    success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle, role: 'status' },
    error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle, role: 'alert' },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, role: 'alert' },
    info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info, role: 'status' },
    success: { bg: 'bg-green-500/10 border-green-500/50', text: 'text-green-400', icon: CheckCircle, role: 'status', live: 'polite' },
    error: { bg: 'bg-red-500/10 border-red-500/50', text: 'text-red-400', icon: XCircle, role: 'alert', live: 'assertive' },
    warning: { bg: 'bg-yellow-500/10 border-yellow-500/50', text: 'text-yellow-400', icon: AlertTriangle, role: 'alert', live: 'assertive' },
    info: { bg: 'bg-blue-500/10 border-blue-500/50', text: 'text-blue-400', icon: Info, role: 'status', live: 'polite' },
  };

  const style = styles[type] || styles.success;
  const Icon = style.icon;

  // UX/A11y Logic: Determine role and aria-live based on toast type
  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';
  const ariaLive = role === 'alert' ? 'assertive' : 'polite';

  return (
    <div
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
      role={role}
      aria-live={ariaLive}
  const isAlert = type === 'error' || type === 'warning';

  return (
    <div
      role={style.role}
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
    >
      <Icon className={`w-5 h-5 ${style.text}`} aria-hidden="true" />
      <span className="sr-only">{style.label}: </span>
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-2 hover:opacity-70 ${style.text} p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current`}
        aria-label="Close notification"
      >
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
      role={style.role}
      aria-live={style.live}
      role={isAlert ? 'alert' : 'status'}
      aria-live={isAlert ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <Icon className={`w-5 h-5 ${style.text}`} />
  const role = type === 'error' ? 'alert' : 'status';
  const ariaLive = type === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role={style.role}
      aria-live={style.live}
      aria-atomic="true"
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
    >
      <Icon aria-hidden="true" className={`w-5 h-5 ${style.text}`} />
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className={`ml-2 hover:opacity-70 ${style.text}`}
      >
        <X aria-hidden="true" className="w-4 h-4" />
      className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-4 ${style.bg}`}
      role={style.role}
      aria-live={style.role === 'alert' ? 'assertive' : 'polite'}
      role={role}
      aria-live={ariaLive}
      role={style.role}
      aria-live={style.live}
      aria-atomic="true"
    >
      <Icon className={`w-5 h-5 ${style.text}`} aria-hidden="true" />
      <span className={`font-medium ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-2 hover:opacity-70 ${style.text}`}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
        aria-label="Close"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
