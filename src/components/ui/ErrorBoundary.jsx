import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-slate-900 p-6 rounded-2xl border border-red-500/20 shadow-xl">
                        <h1 className="text-xl font-bold text-red-400 mb-4">Something went wrong</h1>
                        <p className="text-slate-400 mb-4">The application encountered an unexpected error.</p>
                        <div className="bg-black/50 p-4 rounded-lg overflow-auto max-h-48 mb-4">
                            <code className="text-xs text-red-300 font-mono">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
