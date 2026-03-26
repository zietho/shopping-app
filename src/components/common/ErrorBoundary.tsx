import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full bg-bg-primary px-6 text-center">
          <p className="text-2xl mb-2">😵</p>
          <p className="text-text-primary font-semibold mb-1">Something went wrong</p>
          <p className="text-text-muted text-sm mb-6">Please reload the app to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-2 text-sm font-medium"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
