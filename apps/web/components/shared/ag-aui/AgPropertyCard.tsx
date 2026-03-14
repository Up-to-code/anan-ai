import { Building2, MapPin, Ruler, BedDouble, Bath, ChevronRight } from "lucide-react";

interface AgPropertyCardProps {
    name: string;
    price: string;
    location: string;
    area: string;
    beds: number;
    baths: number;
    image?: string;
}

export default function AgPropertyCard({
    name,
    price,
    location,
    area,
    beds,
    baths
}: AgPropertyCardProps) {
    return (
        <div className="group   bg-white transition hover:border-blue-600">
            <div className="flex flex-col md:flex-row">
                <div className="h-48 w-full bg-slate-100 md:h-auto md:w-48 shrink-0 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <Building2 className="h-12 w-12" />
                    </div>
                    <div className="absolute right-3 top-3   bg-white px-2 py-1 text-[10px] font-black uppercase text-blue-600">
                        متاح
                    </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition">{name}</div>
                            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-400">
                                <MapPin className="h-3 w-3" />
                                {location}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-black text-blue-600">{price}</div>
                            <div className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">ر.س / سنوي</div>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-4 border-y-2 border-slate-100 py-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">المساحة</span>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                <Ruler className="h-3.5 w-3.5 text-slate-400" />
                                {area}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 border-x-2 border-slate-100 px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">غرف النوم</span>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                                {beds}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 pl-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">دورات المياه</span>
                            <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                                <Bath className="h-3.5 w-3.5 text-slate-400" />
                                {baths}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition flex items-center gap-2">
                            عرض التفاصيل
                            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                        </button>
                        <button className="  bg-slate-900 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-blue-600 hover:border-blue-600 transition rounded-none">
                            اتفاقية فورية
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
