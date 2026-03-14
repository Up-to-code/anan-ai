import { FileText, Download, Eye, Clock, Share2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgFileCardProps {
    fileName: string;
    fileSize: string;
    fileType: string;
    timestamp: string;
    isAiGenerated?: boolean;
}

export default function AgFileCard({
    fileName,
    fileSize,
    fileType,
    timestamp,
    isAiGenerated = true,
}: AgFileCardProps) {
    return (
        <div className="group   bg-white p-6 transition hover:border-blue-600">
            <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-slate-50   group-hover:bg-blue-50 group-hover:border-blue-100 transition">
                    <FileText className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-black text-slate-900 uppercase tracking-tight">{fileName}</h3>
                        {isAiGenerated && (
                            <span className="px-2 py-0.5 bg-blue-600 text-[8px] font-black uppercase tracking-widest text-white">
                                توليد ذكي
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-[10px] font-bold text-slate-400">
                        <span>{fileType}</span>
                        <span className="h-1 w-1 rounded-none bg-slate-200" />
                        <span>{fileSize}</span>
                        <span className="h-1 w-1 rounded-none bg-slate-200" />
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {timestamp}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                        <Download className="h-4 w-4" />
                    </button>
                    <button className="p-2   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                        <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2   hover:border-blue-600 hover:text-blue-600 transition rounded-none">
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
