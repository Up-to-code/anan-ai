"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { salesTabs } from "@/lib/adminSectionTabs";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { ProjectRecord } from "@/admin_zone/mocks/types";

type ProjectsPageClientProps = {
  projects: ProjectRecord[];
};

/**
 * WHY:   Sales operators need one filtered project workspace to review project readiness before exposing it to the assistant.
 * WHAT:  Renders the projects list with client-side search and stage/organization filters.
 * HOW:   Filters the mocked project array locally and links each row to its detail screen.
 */
export default function ProjectsPageClient({ projects }: ProjectsPageClientProps) {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [organization, setOrganization] = useState("all");

  const organizations = Array.from(new Set(projects.map((item) => item.organizationName)));

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch = [project.name, project.organizationName, project.city].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        );
        const matchesStage = stage === "all" || project.stage === stage;
        const matchesOrganization = organization === "all" || project.organizationName === organization;
        return matchesSearch && matchesStage && matchesOrganization;
      }),
    [organization, projects, search, stage],
  );

  return (
    <SectionScaffold
      eyebrow="المبيعات"
      title="المشاريع"
      description="مساحة مراجعة للمشاريع وحالتها قبل إتاحتها للمساعد أو عرضها داخل النظام."
      tabs={salesTabs}
      actions={<PageActions actions={[{ label: "إنشاء مشروع", href: "/sales/projects/new" }]} />}
      layout="list"
      contentWidth="contained"
    >
      <WorkspacePanel density="compact">
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput placeholder="ابحث باسم المشروع أو المدينة" value={search} onChange={(event) => setSearch(event.target.value)} />
          <AdminSelect value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="all">كل المراحل</option>
            <option value="draft">مسودة</option>
            <option value="active">نشط</option>
          </AdminSelect>
          <AdminSelect value={organization} onChange={(event) => setOrganization(event.target.value)}>
            <option value="all">كل المنظمات</option>
            {organizations.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </AdminSelect>
        </div>
      </WorkspacePanel>

      <WorkspacePanel density="default" bodyClassName="!px-0 !py-0">
      <DataTable headers={["المشروع", "المنظمة", "المرحلة", "الوصول للمساعد", "العقارات", "آخر تحديث"]} className="rounded-none border-0 bg-transparent shadow-none">
        {filteredProjects.map((project) => (
          <tr key={project.id} className="group transition-colors hover:bg-muted/5">
            <td className="px-5 py-4">
              <Link href={`/sales/projects/${project.id}`} className="block font-black tracking-tight text-foreground hover:text-primary transition-colors">
                {project.name}
              </Link>
              <div className="mt-1 text-[11px] font-bold text-muted-foreground/50">{project.city}</div>
            </td>
            <td className="px-5 py-4 text-[13px] font-bold text-muted-foreground/70">{project.organizationName}</td>
            <td className="px-5 py-4"><StatusBadge value={project.stage} /></td>
            <td className="px-5 py-4 text-[13px] font-black tracking-tight text-foreground">{project.assistantEnabled ? "مفعّل" : "موارد داخلية"}</td>
            <td className="px-5 py-4 text-[13px] font-black tracking-tight text-foreground">{formatNumber(project.propertyCount)}</td>
            <td className="px-5 py-4 text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">{formatDateTime(project.updatedAt)}</td>
          </tr>
        ))}
      </DataTable>
      </WorkspacePanel>
    </SectionScaffold>
  );
}
