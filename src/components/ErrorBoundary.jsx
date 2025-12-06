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
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8 font-mono">
                    <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-xl border border-red-500/50 shadow-2xl">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">System Crash</h1>
                        <p className="text-slate-300 mb-6">The application encountered a critical error during rendering.</p>

                        <div className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-64 mb-6 border border-slate-700">
                            <p className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                            <pre className="text-xs text-slate-500">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition-all"
                        >
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
