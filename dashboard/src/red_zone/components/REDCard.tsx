import { Building2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface REDCardProps {
    developer: {
        _id: string;
        name: string;
        location?: string;
        projectsCount?: number;
    };
    href: string;
}

export function REDCard({ developer, href }: REDCardProps) {
    return (
        <Link to={href} className="block">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{developer.name}</h3>
                        {developer.location && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" /> {developer.location}
                            </p>
                        )}
                        {developer.projectsCount !== undefined && (
                            <p className="text-xs text-slate-400 mt-2">
                                {developer.projectsCount} مشاريع
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}
