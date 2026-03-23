"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminInput, AdminSelect } from "@/components/shared/AdminFieldControls";
import DataTable from "@/components/shared/DataTable";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
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
    >
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

      <DataTable headers={["المشروع", "المنظمة", "المرحلة", "الوصول للمساعد", "العقارات", "آخر تحديث"]}>
        {filteredProjects.map((project) => (
          <tr key={project.id} className="border-b border-border last:border-b-0">
            <td className="px-4 py-3">
              <Link href={`/sales/projects/${project.id}`} className="font-medium text-slate-900 hover:text-blue-600">
                {project.name}
              </Link>
              <div className="mt-1 text-xs text-slate-500">{project.city}</div>
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{project.organizationName}</td>
            <td className="px-4 py-3"><StatusBadge value={project.stage} /></td>
            <td className="px-4 py-3 text-sm text-slate-600">{project.assistantEnabled ? "مفعّل" : "غير مفعّل"}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatNumber(project.propertyCount)}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(project.updatedAt)}</td>
          </tr>
        ))}
      </DataTable>
    </SectionScaffold>
  );
}
