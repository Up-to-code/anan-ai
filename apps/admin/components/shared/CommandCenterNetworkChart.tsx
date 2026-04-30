import { cn } from "@/lib/utils";
import type {
  CommandCenterNetworkGroup,
  CommandCenterNetworkLink,
} from "@/admin_zone/viewModels/commandCenter";

type CommandCenterNetworkChartProps = {
  groups: CommandCenterNetworkGroup[];
  links: CommandCenterNetworkLink[];
  className?: string;
};

type PositionedGroup = {
  group: CommandCenterNetworkGroup;
  x: number;
  y: number;
  radius: number;
};

function scaleValue(value: number, min: number, max: number, values: number[]) {
  const safeValues = values.filter((item) => item > 0);
  const minValue = Math.min(...safeValues, 1);
  const maxValue = Math.max(...safeValues, 1);

  if (minValue === maxValue) {
    return (min + max) / 2;
  }

  const ratio = (Math.log(value + 1) - Math.log(minValue + 1)) / (Math.log(maxValue + 1) - Math.log(minValue + 1));
  return min + ratio * (max - min);
}

/**
 * WHY:   The overview needs one visual centerpiece that explains how demand, channels, ecosystem capacity, pipeline, and risk connect across Anan.
 * WHAT:  Renders a custom SVG network chart with group hubs, metric satellites, and weighted links.
 * HOW:   Uses fixed horizontal group positions, logarithmic sizing for node emphasis, and CSS-token colors so the chart reads well in both themes.
 */
export default function CommandCenterNetworkChart({
  groups,
  links,
  className,
}: CommandCenterNetworkChartProps) {
  const width = 1120;
  const height = 520;
  const nodeValues = groups.flatMap((group) => [group.totalValue, ...group.metrics.map((metric) => metric.value)]);
  const linkValues = links.map((link) => link.value);
  const positionedGroups: PositionedGroup[] = groups.map((group, index) => ({
    group,
    x: 120 + index * 220,
    y: 120,
    radius: scaleValue(group.totalValue, 48, 72, nodeValues),
  }));
  const positionedById = new Map(positionedGroups.map((entry) => [entry.group.id, entry]));

  return (
    <div className={cn("w-full overflow-x-auto", className)} dir="ltr">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto min-w-[980px] w-full"
        role="img"
        aria-label="شبكة القيادة بين الطلب والقنوات والشركاء والخط التجاري والمخاطر"
      >
        <defs>
          <linearGradient id="command-center-surface" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--workspace-panel) 98%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--workspace-elevated) 74%, transparent)" />
          </linearGradient>
        </defs>

        <rect
          x="8"
          y="8"
          width={width - 16}
          height={height - 16}
          rx="32"
          fill="url(#command-center-surface)"
          stroke="color-mix(in srgb, var(--workspace-border) 72%, transparent)"
        />

        {links.map((link) => {
          const source = positionedById.get(link.sourceId);
          const target = positionedById.get(link.targetId);

          if (!source || !target) {
            return null;
          }

          const strokeWidth = scaleValue(link.value, 4, 13, linkValues);
          const sourceX = source.x + source.radius;
          const targetX = target.x - target.radius;
          const path = `M ${sourceX} ${source.y} C ${sourceX + 70} ${source.y}, ${targetX - 70} ${target.y}, ${targetX} ${target.y}`;
          const labelX = (sourceX + targetX) / 2;
          const labelY = source.y - 28 - strokeWidth;

          return (
            <g key={link.id}>
              <path
                d={path}
                fill="none"
                stroke="color-mix(in srgb, var(--workspace-highlight) 40%, transparent)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="var(--workspace-muted)"
              >
                {link.label} • {link.displayValue}
              </text>
            </g>
          );
        })}

        {positionedGroups.map(({ group, x, y, radius }) => {
          const metricValues = group.metrics.map((metric) => metric.value);
          return (
            <g key={group.id}>
              <text x={x} y={28} textAnchor="middle" fontSize="18" fontWeight="900" fill="var(--workspace-bubble-other-foreground)">
                {group.label}
              </text>
              <text x={x} y={50} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--workspace-muted)">
                {group.summary}
              </text>

              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="color-mix(in srgb, var(--workspace-panel) 84%, transparent)"
                stroke={group.accent}
                strokeWidth="2.5"
              />
              <circle
                cx={x}
                cy={y}
                r={radius - 12}
                fill="color-mix(in srgb, var(--workspace-highlight) 8%, var(--workspace-panel))"
                opacity="0.7"
              />
              <text x={x} y={y - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--workspace-muted)">
                إجمالي
              </text>
              <text x={x} y={y + 16} textAnchor="middle" fontSize="22" fontWeight="900" fill="var(--workspace-bubble-other-foreground)">
                {group.totalDisplayValue}
              </text>

              {group.metrics.map((metric, index) => {
                const boxWidth = 166;
                const boxHeight = 46;
                const boxX = x - boxWidth / 2;
                const boxY = 238 + index * 58;
                const dotRadius = scaleValue(metric.value, 7, 12, metricValues);
                return (
                  <g key={metric.id}>
                    <rect
                      x={boxX}
                      y={boxY}
                      width={boxWidth}
                      height={boxHeight}
                      rx="18"
                      fill="color-mix(in srgb, var(--workspace-panel) 94%, transparent)"
                      stroke="color-mix(in srgb, var(--workspace-border) 74%, transparent)"
                    />
                    <circle cx={boxX + 18} cy={boxY + boxHeight / 2} r={dotRadius} fill={group.accent} />
                    <text x={boxX + 34} y={boxY + 19} fontSize="11" fontWeight="800" fill="var(--workspace-muted)">
                      {metric.label}
                    </text>
                    <text x={boxX + 34} y={boxY + 34} fontSize="13" fontWeight="900" fill="var(--workspace-bubble-other-foreground)">
                      {metric.displayValue}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
