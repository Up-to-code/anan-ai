/**
 * WHY:   The assistant should collect missing data one field at a time, not dump all fields.
 * WHAT:  Renders the next missing field as a conversational question, with a subtle remaining count.
 * HOW:   Shows only the first field prominently; remaining fields appear as a tiny counter so the user isn't overwhelmed.
 */
export default function AgFieldRequestList({
  title = "ما زالت هناك بيانات ناقصة",
  fields,
}: {
  title?: string;
  fields: string[];
}) {
  if (fields.length === 0) return null;

  const nextField = fields[0];
  const remainingCount = fields.length - 1;

  return (
    <div className="w-full max-w-[380px]">
      <div className="text-[10px] font-black tracking-[0.22em] text-blue-700">جمع البيانات</div>
      <p className="mt-1.5 text-sm font-bold leading-7 text-slate-900">{title}</p>
      <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm font-bold text-slate-800">
        {nextField}
      </div>
      {remainingCount > 0 ? (
        <div className="mt-2 text-[11px] font-medium text-slate-400">
          + {remainingCount} معلومات أخرى سنسألك عنها لاحقًا
        </div>
      ) : null}
    </div>
  );
}
