import { MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Link } from "react-router-dom";

interface PropertyCardProps {
    property: {
        _id: string;
        title?: string;
        location?: string;
        price?: number;
        bedrooms?: number;
        bathrooms?: number;
        area?: number;
        type?: string;
        status?: string;
        imageUrl?: string;
    };
    href?: string;
}

export function PropertyCard({ property, href }: PropertyCardProps) {
    const content = (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group cursor-pointer">
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative">
                {property.imageUrl ? (
                    <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                        لا توجد صورة
                    </div>
                )}
                {property.status && (
                    <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                        {property.status}
                    </span>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                    {property.title || "عقار بدون عنوان"}
                </h3>
                {property.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {property.location}
                    </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    {property.bedrooms !== undefined && (
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" /> {property.bedrooms}</span>
                    )}
                    {property.bathrooms !== undefined && (
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms}</span>
                    )}
                    {property.area !== undefined && (
                        <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" /> {property.area} م²</span>
                    )}
                </div>
                {property.price !== undefined && (
                    <p className="text-lg font-bold text-blue-600 mt-3">
                        {property.price.toLocaleString("ar-SA")} ر.س
                    </p>
                )}
            </div>
        </div>
    );

    return href ? <Link to={href}>{content}</Link> : content;
}
