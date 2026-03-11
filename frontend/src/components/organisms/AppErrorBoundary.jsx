import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('AppErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    }

    handleReload = () => {
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className='w-screen h-screen bg-main flex items-center justify-center p-6'>
                    <div className='bg-main-white rounded-xl border border-border shadow-md p-8 max-w-xl w-full text-center'>
                        <h1 className='text-2xl font-bold text-text mb-2'>Something went wrong</h1>
                        <p className='text-text/70 mb-6'>An unexpected error occurred. You can retry without losing your session or reload the page.</p>
                        <div className='flex justify-center gap-3'>
                            <button
                                type='button'
                                onClick={this.handleRetry}
                                className='font-medium border-border border rounded-lg px-4 py-2 text-text cursor-pointer hover:bg-main-dark/30'
                            >
                                Try Again
                            </button>
                            <button
                                type='button'
                                onClick={this.handleReload}
                                className='font-medium border-border border rounded-lg px-4 py-2 text-main-white bg-text cursor-pointer hover:opacity-90'
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
