import InviteMemberForm from "../_components/InviteMemberForm";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";
import SettingsHeader from "../_components/SettingsHeader";

/**
 * WHY:   Inviting teammates is a first-class settings task and needs its own focused page.
 * WHAT:  Renders the organization invite flow.
 * HOW:   Uses the shared invite form client component backed by the workspace invite API route.
 */
export default async function WorkspaceInviteMemberPage() {
  const { currentMembershipRole, organization } = await getWorkspaceOrganizationTeam();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <SettingsHeader
        title="دعوة عضو جديد"
        description="أرسل دعوة إلى مدير أو عضو أو مشاهد ضمن نفس المنظمة."
      />
      <InviteMemberForm
        canManage={currentMembershipRole === "manager"}
        showHeader={false}
        hasOrganization={Boolean(organization && currentMembershipRole)}
      />
    </div>
  );
}
