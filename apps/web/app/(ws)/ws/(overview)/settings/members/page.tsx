import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";
import SettingsHeader from "../_components/SettingsHeader";
import MembersWorkspace from "../_components/MembersWorkspace";

/**
 * WHY:   Team management needs a dedicated members page inside organization settings.
 * WHAT:  Renders current members and pending invites using repository-backed reads.
 * HOW:   Loads the team snapshot on the server and hands it to a small client workspace for local role editing.
 */
export default async function WorkspaceMembersPage() {
  const { members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();

  return (
    <div className="space-y-6 p-6 lg:p-10">
      <SettingsHeader
        title="الأعضاء والدعوات"
        description="إدارة أعضاء المنظمة الحاليين والدعوات المعلقة والأدوار الممنوحة لهم."
      />
      <MembersWorkspace initialMembers={members} invites={invites} canManage={currentMembershipRole === "manager"} />
    </div>
  );
}
