import { UserRound, Star, MapPin, Award, MessageSquare, Phone } from "lucide-react";

interface AgBrokerCardProps {
    name: string;
    role: string;
    rating: number;
    deals: number;
    location: string;
    specialization: string[];
}

export default function AgBrokerCard({
    name,
    role,
    rating,
    deals,
    location,
    specialization
}: AgBrokerCardProps) {
    return (
        <div className="w-full bg-white p-6 transition hover:border-blue-600">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="h-24 w-24 shrink-0 bg-slate-950 flex items-center justify-center text-white relative">
                    <UserRound className="h-12 w-12" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 p-1.5 text-white">
                        <Award className="h-4 w-4" />
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="text-xl font-black text-slate-900 uppercase tracking-tighter">{name}</div>
                            <div className="mt-1 flex items-center gap-2 text-xs font-bold text-blue-600">
                                {role}
                                <span className="text-slate-200">|</span>
                                <span className="flex items-center gap-1 text-slate-400">
                                    <MapPin className="h-3 w-3" />
                                    {location}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6   px-6 py-4">
                            <div className="text-center">
                                <div className="flex items-center gap-1 text-sm font-black text-slate-900">
                                    {rating}
                                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                </div>
                                <div className="text-[10px] font-black uppercase text-slate-400">التقييم</div>
                            </div>
                            <div className="w-px h-8 bg-slate-100" />
                            <div className="text-center">
                                <div className="text-sm font-black text-slate-900">{deals}</div>
                                <div className="text-[10px] font-black uppercase text-slate-400">الصفقات</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {specialization.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500  ">
                                {s}
                            </span>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button className="flex-1   bg-slate-950 py-3 px-6 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition flex items-center justify-center gap-3 rounded-none">
                            <MessageSquare className="h-3.5 w-3.5" />
                            إرسال رسالة
                        </button>
                        <button className="flex-1   bg-white py-3 px-6 text-xs font-black uppercase tracking-widest text-slate-950 hover:border-blue-600 transition flex items-center justify-center gap-3 rounded-none">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            اتصال بالوسيط
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
