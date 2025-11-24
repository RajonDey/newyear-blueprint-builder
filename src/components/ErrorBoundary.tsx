import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleClearAndReset = () => {
    try {
      // Clear all wizard data
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('wizard_')) {
          localStorage.removeItem(key);
        }
      });
      
      // Reload the page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to clear data:', error);
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full p-8 shadow-elegant">
            <div className="text-center mb-6">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground text-lg">
                We encountered an unexpected error. Don't worry, your progress should be saved.
              </p>
            </div>

            {isDevelopment && this.state.error && (
              <div className="mb-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-mono text-sm text-destructive mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold text-muted-foreground">
                      Stack trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto max-h-64 text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={this.handleReset}
                size="lg"
                className="bg-gradient-primary hover:opacity-90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={this.handleClearAndReset}
                variant="outline"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Start Fresh
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-6">
              If the problem persists, try clearing your browser cache or contact support.
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
