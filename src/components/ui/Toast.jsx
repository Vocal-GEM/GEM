import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  className
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: {
      bg: 'bg-green-500/10 border-green-500/50',
      text: 'text-green-400',
      icon: CheckCircle,
      label: 'Success'
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/50',
      text: 'text-red-400',
      icon: XCircle,
      label: 'Error'
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/50',
      text: 'text-yellow-400',
      icon: AlertTriangle,
      label: 'Warning'
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/50',
      text: 'text-blue-400',
      icon: Info,
      label: 'Information'
    },
  };

  const style = styles[type] || styles.success;
  const Icon = style.icon;

  // UX/A11y Logic: Determine role and aria-live based on toast type
  // Errors and warnings are alerts (assertive), success/info are status updates (polite)
  const isAlert = type === 'error' || type === 'warning';
  const role = isAlert ? 'alert' : 'status';
  const ariaLive = isAlert ? 'assertive' : 'polite';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={twMerge(
        clsx(
          "fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[100]",
          "flex items-center gap-3 px-6 py-4 rounded-xl border backdrop-blur-md shadow-xl",
          "animate-in fade-in slide-in-from-bottom-4",
          style.bg,
          className
        )
      )}
    >
      <Icon className={clsx("w-5 h-5", style.text)} aria-hidden="true" />
      <span className="sr-only">{style.label}: </span>
      <span className={clsx("font-medium", style.text)}>{message}</span>
      <button
        onClick={onClose}
        className={clsx(
          "ml-2 hover:opacity-70 p-1 rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-current",
          style.text
        )}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};

export default Toast;
