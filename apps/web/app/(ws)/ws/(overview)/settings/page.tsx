import ZonePageIntro from "../../_components/ZoneShell/ZonePageIntro";
import BrandStatStrip from "../../_components/WorkspaceBrand/BrandStatStrip";
import { getWorkspaceOrganizationTeam } from "../../_lib/organizationTeam";
import InviteMemberForm from "./_components/InviteMemberForm";
import OrganizationSettingsWorkspace from "./_components/OrganizationSettingsWorkspace";

/**
 * WHY:   Organization settings need a top-level summary page under the overview shell.
 * WHAT:  Renders the primary organization summary plus counts for members and pending invites.
 * HOW:   Loads the current organization team data from the shared settings helper.
 */
export default async function WorkspaceSettingsPage() {
  const { organization, members, invites, currentMembershipRole } = await getWorkspaceOrganizationTeam();
  const canManage = currentMembershipRole === "manager";

  return (
    <div className="flex min-h-full flex-col">
      <ZonePageIntro
        eyebrow="الإعدادات"
        title="إعدادات المنظمة"
        description="إدارة الأعضاء، الدعوات، والأدوار من داخل مساحة العمل."
      />
      <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-8">
        <BrandStatStrip
          items={[
            { label: "المنظمة", value: organization?.name ?? "بدون منظمة", tone: "blue" },
            { label: "الأعضاء", value: members.length },
            { label: "الدعوات", value: invites.length },
            { label: "الحالة", value: organization?.status ?? "غير متوفر" },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2 mt-8">
          <OrganizationSettingsWorkspace organization={organization} canManage={canManage} />
          <div className="space-y-4">
            <InviteMemberForm canManage={canManage} />
          </div>
        </div>
      </div>
    </div>
  );
}
