import ZonePageIntro from "../../../_components/ZoneShell/ZonePageIntro";
import { getWorkspaceOrganizationTeam } from "../../../_lib/organizationTeam";
import MembersWorkspace from "../_components/MembersWorkspace";

/**
 * WHY:   Team management needs a dedicated members page inside organization settings.
 * WHAT:  Renders current members and pending invites using repository-backed reads.
 * HOW:   Loads the team snapshot on the server and hands it to a small client workspace for local role editing.
 */
export default async function WorkspaceMembersPage() {
  const { members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="الإعدادات"
        title="الأعضاء والدعوات"
        description="إدارة أعضاء المنظمة الحاليين والدعوات المعلقة والأدوار الممنوحة لهم."
      />
      <div className="px-6 py-6 lg:px-8 lg:py-8">
        <MembersWorkspace initialMembers={members} invites={invites} canManage={currentMembershipRole === "manager"} />
      </div>
    </div>
  );
}
