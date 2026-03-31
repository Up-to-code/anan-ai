import ZonePageIntro from "../../../../_components/ZoneShell/ZonePageIntro";
import InviteMemberForm from "../../../../(overview)/settings/_components/InviteMemberForm";
import { createOrganizationInviteAction, searchOrganizationDirectoryAction } from "../../../../(overview)/settings/actions";

/**
 * WHY:   Broker invitation should reuse the real organization invite flow rather than a mock form.
 * WHAT:  Renders the shared invite form inside the CRM broker context.
 * HOW:   Reuses the workspace server actions so accepted invites appear in the real team list.
 */
export default function InviteBrokerPage() {
  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="علاقات العمل"
        title="دعوة وسيط جديد"
        description="أرسل دعوة حقيقية لعضو جديد داخل المنظمة الحالية، وسيظهر بعد القبول في مساحة الفريق والمحادثات."
      />

      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <InviteMemberForm
          onCreateInvite={createOrganizationInviteAction}
          onSearchDirectory={searchOrganizationDirectoryAction}
        />
      </div>
    </div>
  );
}
