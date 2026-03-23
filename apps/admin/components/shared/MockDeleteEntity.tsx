"use client";

import { useState } from "react";
import Button from "@/components/shared/Button";
import WorkspacePanel from "@/components/shared/WorkspacePanel";

type MockDeleteEntityProps = {
  entityLabel: string;
  entityName: string;
  backHref: string;
};

/**
 * WHY:   CRUD flows need a straightforward confirmation screen for destructive actions before backend wiring exists.
 * WHAT:  Renders a UI-only delete confirmation with an explicit acknowledgement checkbox.
 * HOW:   Requires local confirmation state before showing a mocked success result and return action.
 */
export default function MockDeleteEntity({ entityLabel, entityName, backHref }: MockDeleteEntityProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <WorkspacePanel className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-900">حذف {entityLabel}</h2>
        <p className="text-sm text-slate-600">
          أنت على وشك حذف <span className="font-medium text-slate-900">{entityName}</span>. هذا الإجراء تجريبي داخل الواجهة فقط.
        </p>
      </div>

      <label className="flex items-center gap-3 rounded-[8px] border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span>أفهم أن هذا الحذف تجريبي ولن يغيّر البيانات الحقيقية.</span>
      </label>

      {deleted ? <div className="rounded-[8px] border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">تم تنفيذ حذف {entityLabel} داخل الواجهة التجريبية.</div> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" href={backHref}>
          رجوع
        </Button>
        <Button onClick={() => setDeleted(true)} className={!confirmed ? "pointer-events-none opacity-50" : ""}>
          تأكيد الحذف
        </Button>
      </div>
    </WorkspacePanel>
  );
}
