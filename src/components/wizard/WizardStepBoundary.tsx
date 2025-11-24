import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, SkipForward } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  stepName: string;
  onSkip?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WizardStepBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in wizard step ${this.props.stepName}:`, error, errorInfo);
    toast.error(`Error in ${this.props.stepName} step`);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleSkip = () => {
    if (this.props.onSkip) {
      this.setState({
        hasError: false,
        error: null,
      });
      this.props.onSkip();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">
              Error in {this.props.stepName}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {this.state.error?.message || 'An unexpected error occurred in this step.'}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={this.handleRetry}
              size="lg"
              className="bg-gradient-primary hover:opacity-90"
            >
              Try Again
            </Button>
            {this.props.onSkip && (
              <Button
                onClick={this.handleSkip}
                variant="outline"
                size="lg"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip This Step
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
