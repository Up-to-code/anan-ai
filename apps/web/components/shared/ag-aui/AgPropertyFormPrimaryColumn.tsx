import { Building2, ChevronRight, MapPin, Search, UserPlus, X } from "lucide-react";
import AgRichTextEditor from "./AgRichTextEditor";
import type { BrokerPresence } from "../../../app/(ws)/ws/_components/Visuals/BrokerPresenceChip";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";

type AgPropertyFormPrimaryColumnProps = {
  brokerSearch: string;
  filteredBrokers: BrokerPresence[];
  formState: AgPropertyFormState;
  isBrokerDropdownOpen: boolean;
  selectedBroker?: BrokerPresence;
  setBrokerSearch: React.Dispatch<React.SetStateAction<string>>;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setIsBrokerDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedBrokerId: React.Dispatch<React.SetStateAction<string | null>>;
};

export function AgPropertyFormPrimaryColumn({
  brokerSearch,
  filteredBrokers,
  formState,
  isBrokerDropdownOpen,
  selectedBroker,
  setBrokerSearch,
  setFormState,
  setIsBrokerDropdownOpen,
  setSelectedBrokerId,
}: AgPropertyFormPrimaryColumnProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="border border-slate-200 bg-white p-8">
        <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">البيانات الأساسية</h3>
        <div className="grid gap-8">
          <div className="grid gap-3 text-right">
            <label className="text-[11px] font-black text-slate-400">اسم المشروع أو العقار</label>
            <div className="group relative">
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="أدخل اسماً يميز المشروع..."
                className="w-full border-b-2 border-slate-100 bg-transparent py-4 pr-2 text-right text-3xl font-black text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
              />
              <Building2 className="absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 text-slate-200 transition duration-500 group-focus-within:text-blue-600" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="grid gap-3 text-right">
              <label className="text-[11px] font-black text-slate-400">النطاق السعري التقديري</label>
              <div className="relative group">
                <input
                  type="text"
                  value={formState.price}
                  onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="مثال: 2.1 مليون ر.س"
                  className="w-full border-b-2 border-slate-100 bg-transparent py-3 pr-2 text-right text-xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid gap-3 text-right">
              <label className="text-[11px] font-black text-slate-400">الموقع (الحي، المدينة)</label>
              <div className="group relative">
                <input
                  type="text"
                  value={formState.location}
                  onChange={(e) => setFormState((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="الرياض، حطين"
                  className="w-full border-b-2 border-slate-100 bg-transparent py-3 pr-2 text-right text-xl font-black text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600"
                />
                <MapPin className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-200 transition duration-500 group-focus-within:text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-8">
        <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">التفاصيل والتسويق</h3>
        <div className="grid gap-4 text-right">
          <AgRichTextEditor
            value={formState.description}
            onChange={(val) => setFormState((prev) => ({ ...prev, description: val }))}
            placeholder="اكتب تفاصيل المشروع، المميزات الاستثنائية للوحدات والخدمات..."
            className="text-right"
          />
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-8">
        <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">تكليف وسيط</h3>

        <div className="relative">
          {selectedBroker ? (
            <div className="flex flex-row-reverse items-center justify-between border-2 border-blue-600 bg-blue-50/20 p-5">
              <div className="flex flex-row-reverse items-center gap-4">
                <div className="h-12 w-12 overflow-hidden border border-slate-100 bg-white">
                  {selectedBroker.avatarImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedBroker.avatarImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-black text-slate-400">{selectedBroker.avatarLabel}</div>
                  )}
                </div>
                <div className="grid gap-1 text-right">
                  <div className="text-base font-black uppercase leading-none text-slate-950">{selectedBroker.name}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{selectedBroker.title}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBrokerId(null)}
                className="flex h-8 w-8 items-center justify-center border border-slate-200 bg-white text-slate-400 transition-colors hover:border-red-600 hover:text-red-600"
                title="إلغاء التكليف"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="group relative">
              <input
                type="text"
                value={brokerSearch}
                onChange={(e) => {
                  setBrokerSearch(e.target.value);
                  setIsBrokerDropdownOpen(true);
                }}
                onFocus={() => setIsBrokerDropdownOpen(true)}
                placeholder="ابحث بالاسم لتكليف وسيط للمشروع..."
                className="w-full border-2 border-slate-100 bg-slate-50 p-5 pr-12 text-right text-base font-bold text-slate-950 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600 focus:bg-white"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300 transition group-focus-within:text-blue-600" />

              {isBrokerDropdownOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsBrokerDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[300px] animate-in overflow-auto border-2 border-slate-950 bg-white shadow-none slide-in-from-top-2 duration-200">
                    {filteredBrokers.length > 0 ? (
                      <div className="grid divide-y divide-slate-100">
                        {filteredBrokers.map((broker) => (
                          <button
                            key={broker.id}
                            onClick={() => {
                              setSelectedBrokerId(broker.id);
                              setIsBrokerDropdownOpen(false);
                              setBrokerSearch("");
                            }}
                            className="group flex flex-row-reverse items-center gap-4 p-4 text-right transition hover:bg-slate-50"
                          >
                            <div className="h-10 w-10 overflow-hidden bg-slate-100">
                              {broker.avatarImage ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={broker.avatarImage} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] font-black text-slate-400">{broker.avatarLabel}</div>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="text-sm font-black uppercase leading-none text-slate-950 transition-colors group-hover:text-blue-600">{broker.name}</div>
                              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{broker.title}</div>
                            </div>
                            <ChevronRight className="h-4 w-4 translate-x-0 text-slate-200 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                        <UserPlus className="h-8 w-8 text-slate-200" />
                        <div className="text-xs font-black text-slate-400">لا يوجد بيانات مطابقة</div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
