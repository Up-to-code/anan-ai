import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/public_zone/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * WHY:   Creates an isolated Error Vault specifically for the Broker Zone.
 * WHAT:  Catches React rendering errors, preventing them from corrupting the core dashboard shell.
 * HOW:   Uses a standard React Error Boundary class with a fallback UI to retry rendering.
 */
export class BrokerZoneErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Broker Zone Error Caught:", error, errorInfo);
        // Ideally log to Sentry or Convex error tracking here
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in duration-300">
                    <div className="mb-4 rounded-full bg-destructive/10 p-4 text-destructive">
                        <AlertTriangle className="h-8 w-8" />
                    </div>
                    <h2 className="mb-2 text-xl font-semibold text-destructive">
                        Broker Zone Error
                    </h2>
                    <p className="mb-6 max-w-md text-sm text-muted-foreground">
                        A critical error occurred within the Broker operations area. Isolation protocol maintained.
                    </p>
                    {this.state.error?.message && (
                        <div className="mb-6 rounded bg-background p-3 text-left w-full max-w-md overflow-auto border font-mono text-xs text-muted-foreground">
                            {this.state.error.message}
                        </div>
                    )}
                    <Button onClick={this.handleReset} variant="outline" className="gap-2">
                        Retry Operation
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
