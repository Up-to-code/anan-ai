import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import InviteMemberForm from "../_components/InviteMemberForm";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";

/**
 * WHY:   Inviting teammates is a first-class settings task and needs its own focused page.
 * WHAT:  Renders the organization invite flow.
 * HOW:   Uses the shared invite form client component backed by the workspace invite API route.
 */
export default async function WorkspaceInviteMemberPage() {
  const { currentMembershipRole } = await getWorkspaceOrganizationTeam();

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="الإعدادات"
        title="دعوة عضو جديد"
        description="أرسل دعوة إلى مدير أو عضو أو مشاهد ضمن نفس المنظمة."
      />
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <InviteMemberForm canManage={currentMembershipRole === "manager"} />
      </div>
    </div>
  );
}
