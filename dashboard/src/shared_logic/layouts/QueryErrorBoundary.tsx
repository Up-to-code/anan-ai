import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class QueryErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
        console.warn("QueryErrorBoundary caught:", error.message);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-amber-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 tracking-tight">حدث خطأ أثناء تحميل البيانات</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors"
                    >
                        إعادة المحاولة
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
