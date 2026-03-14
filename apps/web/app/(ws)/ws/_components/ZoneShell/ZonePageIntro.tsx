import BrandSectionFrame from "../WorkspaceBrand/BrandSectionFrame";

type ZonePageIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

/**
 * WHY:   Business-zone screens need a shared header pattern after removing the old inline shell framing.
 * WHAT:  Renders a full-width section intro with optional actions.
 * HOW:   Uses the same spacing and typography contract across zone pages while leaving the sidebar shell independent.
 */
export default function ZonePageIntro({
  eyebrow,
  title,
  description,
  actions,
}: ZonePageIntroProps) {
  return <BrandSectionFrame eyebrow={eyebrow} title={title} description={description} actions={actions} />;
}
