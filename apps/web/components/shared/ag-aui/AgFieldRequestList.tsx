export default function AgFieldRequestList({
  title = "ما زالت هناك بيانات ناقصة",
  fields,
}: {
  title?: string;
  fields: string[];
}) {
  return (
    <section className="w-full max-w-[340px] border border-slate-200 bg-white p-5">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">جمع البيانات</div>
      <h3 className="mt-1 text-base font-black text-slate-950">{title}</h3>
      <div className="mt-4 grid gap-2">
        {fields.map((field) => (
          <div key={field} className="border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
            {field}
          </div>
        ))}
      </div>
    </section>
  );
}
