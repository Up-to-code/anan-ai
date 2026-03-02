import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * WHY:   Isolates errors within the Admin Zone to prevent crashes from taking down the entire app
 *        (broker zone, user zone, etc.).
 * WHAT:  Catches React lifecycle and render errors in the component tree below it.
 * HOW:   Wraps the Admin Zone router layout. If a child throws, this renders a fallback UI
 *        and provides a "Retry" button to reset the error boundary.
 */
export class AdminZoneErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in Admin Zone:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
                    <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Something went wrong in the Admin Zone</h2>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md">
                        {this.state.error?.message || "An unexpected rendering error occurred."}
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
