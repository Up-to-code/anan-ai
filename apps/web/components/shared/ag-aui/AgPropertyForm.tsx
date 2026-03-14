"use client";

import {
  Building2, 
  MapPin, 
  Check, 
  ChevronRight,
  Upload,
  Search,
  X,
  UserPlus,
  PlayCircle,
  Video,
  ShieldCheck,
  AlertCircle,
  Trash2,
  ChevronLeft
} from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent } from "react";
import AgRichTextEditor from "./AgRichTextEditor";
import { cn } from "@/lib/utils";
import ZonePageIntro from "../../../app/(ws)/ws/_components/ZoneShell/ZonePageIntro";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../../../app/(ws)/ws/_components/Visuals/BrokerPresenceChip";

export type ProjectFormData = {
  name: string;
  price: string;
  location: string;
  description: string;
  rooms: string;
  baths: string;
  area: string;
  status: string;
  images: UploadedFileReference[];
  video: string | null;
  brokerId: string | null;
};

type AgPropertyFormProps = {
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: () => void;
};

/**
 * WHY:   Institutional real-estate interfaces require structured, non-flex grid layouts for perfect alignment.
 * WHAT:  Evolved property engine with multi-image/video support and UX safety logic. Supports create & edit.
 * HOW:   Redesigned to follow the flat, stark, minimalist "lazy/base" aesthetic like the Market page.
 */
export default function AgPropertyForm({
  initialData,
  brokers = [],
  title = "مسؤولية الاطلاع",
  description = "تكامل البيانات وإدارة الأصول العقارية المركزية. مراجعة، تدقيق، ونشر.",
  submitLabel = "تأكيد ونشر المشروع",
  onSave,
  onCancel,
  onDelete,
}: AgPropertyFormProps) {
    const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
    const [brokerSearch, setBrokerSearch] = useState("");
    const [isBrokerDropdownOpen, setIsBrokerDropdownOpen] = useState(false);
    const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
    const [savePending, setSavePending] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const { startUpload, isUploading } = useUploadThing("propertyMedia");

    const [formState, setFormState] = useState({
        name: initialData?.name ?? "",
        price: initialData?.price ?? "",
        location: initialData?.location ?? "",
        description: initialData?.description ?? "",
        rooms: initialData?.rooms ?? "",
        baths: initialData?.baths ?? "",
        area: initialData?.area ?? "",
        status: initialData?.status ?? "active",
        images: initialData?.images ?? [],
        video: initialData?.video ?? null
    });

    const isEditMode = Boolean(initialData);

    const filteredBrokers = useMemo(() => {
        return brokers.filter(b => 
            b.name.toLowerCase().includes(brokerSearch.toLowerCase()) || 
            b.title?.toLowerCase().includes(brokerSearch.toLowerCase())
        );
    }, [brokerSearch, brokers]);

    const selectedBroker = useMemo(() => 
        brokers.find(b => b.id === selectedBrokerId), 
    [selectedBrokerId, brokers]);

    const removeImage = (index: number) => {
        setFormState(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      if (files.length === 0) {
        return;
      }

      setUploadError(null);

      try {
        const uploaded = await startUpload(files);
        const nextImages =
          uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
        setFormState((prev) => ({ ...prev, images: [...prev.images, ...nextImages] }));
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "تعذر رفع الصور حالياً.");
      } finally {
        event.target.value = "";
      }
    };

    const handleConfirm = async () => {
      const payload: ProjectFormData = { ...formState, brokerId: selectedBrokerId };
      setSavePending(true);
      try {
        if (onSave) {
          await onSave(payload);
        } else {
          console.log("CONFIRMED:", payload);
        }
        setShowSafetyConfirm(false);
      } finally {
        setSavePending(false);
      }
    };

    return (
        <div className="flex flex-col min-h-full pb-32">
            {/* Safety Confirmation Overlay */}
            {showSafetyConfirm && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setShowSafetyConfirm(false)}
                >
                    <div 
                        className="w-full max-w-md bg-white p-12 text-center animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <ShieldCheck className="mx-auto h-16 w-16 text-blue-600 mb-6" />
                        <h2 className="text-3xl font-black text-slate-950 mb-4">تأكيد التدقيق النهائي</h2>
                        <p className="text-base font-medium text-slate-500 mb-10 leading-relaxed">
                            يرجى مراجعة كافة البيانات المدخلة قبل الاعتماد والنشر، لضمان دقة معلومات الوصول والمواصفات.
                        </p>
                        <div className="grid gap-3">
                            <button 
                                onClick={handleConfirm}
                                disabled={savePending}
                                className="border-2 border-blue-600 bg-blue-600 py-4 text-sm font-black tracking-[0.2em] text-white hover:bg-slate-950 hover:border-slate-950 transition-colors"
                            >
                                {savePending ? "جارٍ الحفظ..." : "اعتماد ونشر"}
                            </button>
                            <button 
                                onClick={() => setShowSafetyConfirm(false)}
                                className="border border-slate-200 py-4 text-[10px] font-black tracking-widest text-slate-500 hover:text-slate-950 hover:border-slate-300 transition-colors"
                            >
                                تراجع للمراجعة
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Flat, Stark Header replacing custom layout */}
            <ZonePageIntro
              eyebrow="العمليات التشغيلية"
              title={title}
              description={description}
              actions={
                isEditMode ? (
                  <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
                    {onDelete && (
                      <button
                        type="button"
                        onClick={onDelete}
                        className="flex items-center gap-2 border border-red-200 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                        حذف المشروع
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onCancel}
                      className="flex items-center gap-2 border border-slate-200 bg-white px-5 py-3 text-xs font-black text-slate-700 hover:border-slate-950 transition"
                    >
                       <ChevronLeft className="h-4 w-4" />
                       العودة للمشروع 
                    </button>
                  </div>
                ) : undefined
              }
            />

            <div className="px-6 py-6 lg:px-8 lg:py-8 grid gap-8 xl:grid-cols-[1fr_400px]">
                {/* Main Content Column */}
                <div className="flex flex-col gap-8">
                    {/* Basic Info Section */}
                    <div className="border border-slate-200 bg-white p-8">
                        <h3 className="text-lg font-black text-slate-950 mb-8 border-b border-slate-100 pb-4">البيانات الأساسية</h3>
                        
                        <div className="grid gap-8">
                          <div className="grid gap-3 text-right">
                             <label className="text-[11px] font-black text-slate-400">اسم المشروع أو العقار</label>
                             <div className="relative group">
                                 <input
                                     type="text"
                                     value={formState.name}
                                     onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                                     placeholder="أدخل اسماً يميز المشروع..."
                                     className="w-full border-b-2 border-slate-100 bg-transparent py-4 text-3xl font-black text-slate-950 outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 text-right pr-2"
                                 />
                                 <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-200 group-focus-within:text-blue-600 transition duration-500" />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="grid gap-3 text-right">
                                  <label className="text-[11px] font-black text-slate-400">النطاق السعري التقديري</label>
                                  <div className="relative group">
                                      <input
                                          type="text"
                                          value={formState.price}
                                          onChange={(e) => setFormState(prev => ({ ...prev, price: e.target.value }))}
                                          placeholder="مثال: 2.1 مليون ر.س"
                                          className="w-full border-b-2 border-slate-100 bg-transparent py-3 text-xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 text-right pr-2"
                                      />
                                  </div>
                              </div>

                              <div className="grid gap-3 text-right">
                                  <label className="text-[11px] font-black text-slate-400">الموقع (الحي، المدينة)</label>
                                  <div className="relative group">
                                      <input
                                          type="text"
                                          value={formState.location}
                                          onChange={(e) => setFormState(prev => ({ ...prev, location: e.target.value }))}
                                          placeholder="الرياض، حطين"
                                          className="w-full border-b-2 border-slate-100 bg-transparent py-3 text-xl font-black text-slate-900 outline-none focus:border-blue-600 transition-all placeholder:text-slate-300 text-right pr-2"
                                      />
                                      <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-200 group-focus-within:text-blue-600 transition duration-500" />
                                  </div>
                              </div>
                          </div>
                        </div>
                    </div>

                    {/* Rich Description */}
                    <div className="border border-slate-200 bg-white p-8">
                        <h3 className="text-lg font-black text-slate-950 mb-8 border-b border-slate-100 pb-4">التفاصيل والتسويق</h3>
                        <div className="grid gap-4 text-right">
                            <AgRichTextEditor 
                                value={formState.description}
                                onChange={(val) => setFormState(prev => ({ ...prev, description: val }))}
                                placeholder="اكتب تفاصيل المشروع، المميزات الاستثنائية للوحدات والخدمات..."
                                className="text-right"
                            />
                        </div>
                    </div>

                    {/* Broker Assignment */}
                    <div className="border border-slate-200 bg-white p-8">
                        <h3 className="text-lg font-black text-slate-950 mb-8 border-b border-slate-100 pb-4">تكليف وسيط</h3>
                        
                        <div className="relative">
                            {selectedBroker ? (
                                <div className="flex items-center justify-between border-2 border-blue-600 bg-blue-50/20 p-5 flex-row-reverse">
                                    <div className="flex items-center gap-4 flex-row-reverse">
                                        <div className="h-12 w-12 overflow-hidden bg-white border border-slate-100">
                                            {selectedBroker.avatarImage ? (
                                                <img src={selectedBroker.avatarImage} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center font-black text-slate-400">{selectedBroker.avatarLabel}</div>
                                            )}
                                        </div>
                                        <div className="grid gap-1 text-right">
                                            <div className="text-base font-black text-slate-950 uppercase leading-none">{selectedBroker.name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{selectedBroker.title}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedBrokerId(null)}
                                        className="h-8 w-8 flex items-center justify-center border border-slate-200 bg-white text-slate-400 hover:border-red-600 hover:text-red-600 transition-colors"
                                        title="إلغاء التكليف"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <input
                                        type="text"
                                        value={brokerSearch}
                                        onChange={(e) => {
                                            setBrokerSearch(e.target.value);
                                            setIsBrokerDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsBrokerDropdownOpen(true)}
                                        placeholder="ابحث بالاسم لتكليف وسيط للمشروع..."
                                        className="w-full border-2 border-slate-100 bg-slate-50 p-5 text-base font-bold text-slate-950 outline-none focus:border-blue-600 focus:bg-white transition-all text-right pr-12"
                                    />
                                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition" />
                                    
                                    {isBrokerDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsBrokerDropdownOpen(false)} />
                                            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[300px] overflow-auto border-2 border-slate-950 bg-white shadow-none animate-in slide-in-from-top-2 duration-200">
                                                {filteredBrokers.length > 0 ? (
                                                    <div className="grid divide-y divide-slate-100">
                                                        {filteredBrokers.map(broker => (
                                                            <button
                                                                key={broker.id}
                                                                onClick={() => {
                                                                    setSelectedBrokerId(broker.id);
                                                                    setIsBrokerDropdownOpen(false);
                                                                    setBrokerSearch("");
                                                                }}
                                                                className="flex items-center gap-4 p-4 text-right transition hover:bg-slate-50 flex-row-reverse group"
                                                            >
                                                                <div className="h-10 w-10 overflow-hidden bg-slate-100">
                                                                    {broker.avatarImage ? (
                                                                        <img src={broker.avatarImage} alt="" className="h-full w-full object-cover" />
                                                                    ) : (
                                                                        <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-slate-400">{broker.avatarLabel}</div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 overflow-hidden">
                                                                    <div className="text-sm font-black text-slate-950 group-hover:text-blue-600 transition-colors uppercase leading-none">{broker.name}</div>
                                                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{broker.title}</div>
                                                                </div>
                                                                <ChevronRight className="h-4 w-4 text-slate-200 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
                                                        <UserPlus className="h-8 w-8 text-slate-200" />
                                                        <div className="text-xs font-black text-slate-400">لا يوجد بيانات مطابقة</div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Side Column: Media & Specs */}
                <div className="flex flex-col gap-8">
                    {/* Media Gallery */}
                    <div className="border border-slate-200 bg-white p-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6 flex-row-reverse">
                            <h3 className="text-lg font-black text-slate-950">المعرض المرئي</h3>
                            <span className="text-[10px] font-black tracking-widest text-slate-400 bg-slate-50 px-2 py-1">{formState.images.length}/10</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageSelection}
                            />
                            {/* Upload Area */}
                            <div 
                                className="col-span-2 border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-600 transition-all aspect-video group cursor-pointer flex flex-col items-center justify-center text-center gap-3 p-6"
                                onClick={() => inputRef.current?.click()}
                            >
                                <Upload className="h-6 w-6 text-slate-300 group-hover:text-blue-600 transition-colors duration-300" />
                                <div className="text-sm font-black text-slate-900">
                                  {isUploading ? "جارٍ رفع الصور..." : "إضافة صور"}
                                </div>
                                <div className="text-[10px] font-bold tracking-widest text-slate-400">
                                  UploadThing
                                </div>
                            </div>
                            {uploadError ? (
                              <div className="col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-right text-xs font-bold text-red-700">
                                {uploadError}
                              </div>
                            ) : null}

                            {/* Image Grid */}
                            {formState.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square border-2 border-slate-100 bg-white overflow-hidden group">
                                    <img src={img.url} alt={img.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                        className="absolute right-1 top-1 h-6 w-6 bg-white/90 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-600 hover:text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            {/* Video Base Node */}
                            <div className={cn(
                                "col-span-2 border-2 transition-all p-4 text-right flex items-center justify-between flex-row-reverse group cursor-pointer mt-2",
                                formState.video 
                                    ? "border-blue-600 bg-blue-50/20" 
                                    : "border-slate-100 bg-white hover:border-slate-300"
                            )}
                            onClick={() => setFormState(prev => ({ ...prev, video: prev.video ? null : "mock-video.mp4" }))}
                            >
                                <div className="flex items-center gap-3 flex-row-reverse">
                                    <div className={cn(
                                        "h-10 w-10 flex items-center justify-center transition-colors border",
                                        formState.video ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                    )}>
                                        {formState.video ? <PlayCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                                    </div>
                                    <div className="grid gap-0 leading-tight">
                                        <div className="text-xs font-black text-slate-950 uppercase">{formState.video ? "الفيديو جاهز" : "إضافة فيديو (اختياري)"}</div>
                                        <div className="text-[9px] font-bold text-slate-400 tracking-widest">{formState.video ? "تم الاعتماد" : "صيغة MP4"}</div>
                                    </div>
                                </div>
                                {formState.video && <Check className="h-4 w-4 text-blue-600" />}
                            </div>
                        </div>
                    </div>

                    {/* Specs & Configuration */}
                    <div className="border border-slate-200 bg-white p-8">
                        <h3 className="text-lg font-black text-slate-950 mb-8 border-b border-slate-100 pb-4">المواصفات والتحكم</h3>

                        <div className="grid gap-6">
                            <div className="grid gap-2 text-right">
                                <label className="text-[10px] font-black tracking-widest text-slate-400">حالة الظهور</label>
                                <div className="relative">
                                    <select
                                        value={formState.status}
                                        onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-950 outline-none focus:border-blue-600 focus:bg-white appearance-none cursor-pointer text-right transition-all"
                                    >
                                        <option value="active">جاهز للنشر ومتاح للجميع</option>
                                        <option value="pending">مسودة للحفظ فقط المراجعة</option>
                                        <option value="maintenance">إخفاء عن الجمهور (أرشفة)</option>
                                    </select>
                                    <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none rotate-90" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 flex-row-reverse">
                                <div className="grid gap-2 text-right">
                                    <label className="text-[10px] font-black tracking-widest text-slate-400">الغرف</label>
                                    <input
                                        type="number"
                                        value={formState.rooms}
                                        onChange={(e) => setFormState(prev => ({ ...prev, rooms: e.target.value }))}
                                        placeholder="0"
                                        className="w-full bg-slate-50 px-3 py-3 text-lg font-black text-slate-950 outline-none focus:bg-white focus:border-blue-600 transition-all text-right border-2 border-slate-100"
                                    />
                                </div>
                                <div className="grid gap-2 text-right">
                                    <label className="text-[10px] font-black tracking-widest text-slate-400">دورات المياه</label>
                                    <input
                                        type="number"
                                        value={formState.baths}
                                        onChange={(e) => setFormState(prev => ({ ...prev, baths: e.target.value }))}
                                        placeholder="0"
                                        className="w-full bg-slate-50 px-3 py-3 text-lg font-black text-slate-950 outline-none focus:bg-white focus:border-blue-600 transition-all text-right border-2 border-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 text-right">
                                <label className="text-[10px] font-black tracking-widest text-slate-400">المساحة م²</label>
                                <input
                                    type="text"
                                    value={formState.area}
                                    onChange={(e) => setFormState(prev => ({ ...prev, area: e.target.value }))}
                                    placeholder="0"
                                    className="w-full bg-slate-50 px-4 py-3 text-lg font-black text-slate-950 outline-none focus:bg-white focus:border-blue-600 transition-all text-right border-2 border-slate-100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Publish Action Box */}
                    <div className="border border-slate-200 bg-white p-8">
                        <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 mb-6 flex-row-reverse text-right">
                            <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold leading-relaxed text-slate-600">
                                إن النشر يؤثر فوراً على ظهور المشروع في التطبيقات. يرجى التأكد من المرفقات.
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowSafetyConfirm(true)}
                            disabled={savePending}
                            className="w-full bg-blue-600 py-5 text-sm font-black tracking-[0.2em] text-white hover:bg-slate-950 transition-colors flex items-center justify-center"
                        >
                            {savePending ? "جارٍ الحفظ..." : submitLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
