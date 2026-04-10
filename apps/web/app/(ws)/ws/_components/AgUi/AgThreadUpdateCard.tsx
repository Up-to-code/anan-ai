import { memo } from "react"
import { ArrowLeftRight, Clock3 } from "lucide-react";

type AgThreadUpdateCardProps = {
  subject: string;
  sender: string;
  recipient: string;
  project: string;
  unit?: string;
  status: string;
  update: string;
};

function PartyRow({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-2 text-[var(--workspace-bubble-other-foreground)]">
      <span>{value}</span>
      <span className="text-xs text-[var(--workspace-muted)]">{label}</span>
    </div>
  );
}

function ThreadContext({ project, unit }: { project: string; unit?: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-3">
      <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-muted)]">السياق</div>
      <div className="mt-1">{project}</div>
      <div className="mt-1 text-xs text-[var(--workspace-muted)]">{unit ?? "على مستوى المشروع"}</div>
    </div>
  );
}

function ThreadStatusFooter({ status, update }: { status: string; update: string }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-[color:var(--workspace-border)] pt-4">
      <div className="flex items-center gap-2 text-xs font-black text-[var(--workspace-highlight)]">
        <Clock3 className="h-3.5 w-3.5" />
        {status}
      </div>
      <div className="text-xs font-medium text-[var(--workspace-muted)]">{update}</div>
    </div>
  );
}

const AgThreadUpdateCardComponent = function AgThreadUpdateCard({
  subject,
  sender,
  recipient,
  project,
  unit,
  status,
  update,
}: AgThreadUpdateCardProps) {
  return (
    <section className="w-full max-w-[340px] rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-black tracking-[0.22em] text-[var(--workspace-highlight)]">آخر تحديث على الخيط</div>
          <h3 className="mt-1 text-base font-black text-[var(--workspace-bubble-other-foreground)]">{subject}</h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-bubble-other-foreground)]">
          <ArrowLeftRight className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">
        <PartyRow value={sender} label="المرسل" />
        <PartyRow value={recipient} label="المستلم" />
        <ThreadContext project={project} unit={unit} />
      </div>

      <ThreadStatusFooter status={status} update={update} />
    </section>
  );
}

export default memo(AgThreadUpdateCardComponent)
