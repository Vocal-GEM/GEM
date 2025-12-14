import { useState } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

/**
 * ErrorRetry - Graceful error recovery component
 */
const ErrorRetry = ({
    error,
    onRetry,
    title = 'Something went wrong',
    showHomeButton = true
}) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const { navigate } = useNavigation();

    const handleRetry = async () => {
        setIsRetrying(true);
        try {
            await onRetry?.();
        } catch (e) {
            console.error('Retry failed:', e);
        } finally {
            setIsRetrying(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="text-red-400" size={32} />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

            {error && (
                <p className="text-slate-400 mb-6 max-w-md">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
            )}

            <div className="flex gap-3">
                {onRetry && (
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className={isRetrying ? 'animate-spin' : ''} size={18} />
                        {isRetrying ? 'Retrying...' : 'Try Again'}
                    </button>
                )}

                {showHomeButton && (
                    <button
                        onClick={() => navigate('dashboard')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Home size={18} />
                        Go Home
                    </button>
                )}
            </div>
        </div>
    );
};

/**
 * Wrapper component for error boundaries
 */
export const withErrorRetry = (WrappedComponent) => {
    return function WithErrorRetryComponent(props) {
        const [error, setError] = useState(null);

        if (error) {
            return (
                <ErrorRetry
                    error={error}
                    onRetry={() => setError(null)}
                />
            );
        }

        return <WrappedComponent {...props} onError={setError} />;
    };
};

export default ErrorRetry;
