import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Global Error Boundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });

        // TODO: Log to error tracking service (e.g., Sentry)
        // if (window.Sentry) {
        //     window.Sentry.captureException(error, { extra: errorInfo });
        // }
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <AlertTriangle className="w-8 h-8 text-red-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Oops! Something went wrong</h1>
                                <p className="text-slate-400 text-sm">The app encountered an unexpected error</p>
                            </div>
                        </div>

                        {this.state.error && (
                            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                <p className="text-sm font-mono text-red-300 mb-2">
                                    {this.state.error.toString()}
                                </p>
                                {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                    <details className="mt-2">
                                        <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                                            Stack Trace
                                        </summary>
                                        <pre className="text-xs text-slate-400 mt-2 overflow-auto max-h-40">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Reload App
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-6">
                            If this problem persists, please contact support
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
