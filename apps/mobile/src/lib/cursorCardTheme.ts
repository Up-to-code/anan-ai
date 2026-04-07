export type CursorCardTokens = {
  defaultAmbientBackgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  actionSurfaceColor: string;
  actionBorderColor: string;
  actionTextColor: string;
  frameThickness: number;
  frameOpacity: number;
  outerRadius: number;
  innerRadius: number;
};

export type CursorCardAppearance = {
  ambientBackgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  actionSurfaceColor: string;
  actionBorderColor: string;
  actionTextColor: string;
  frameThickness: number;
  outerRadius: number;
  innerRadius: number;
  edgeColor: string;
  transparentEdgeColor: string;
};

function withAlpha(color: string, alpha: number): string {
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));

  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (hex.length === 8) {
      hex = hex.slice(0, 6);
    }
    if (hex.length !== 6) return color;
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${normalizedAlpha})`;
  }

  if (color.startsWith("rgba(")) {
    const channels = color.slice(5, -1).split(",").map((value) => value.trim());
    if (channels.length !== 4) return color;
    return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${normalizedAlpha})`;
  }

  if (color.startsWith("rgb(")) {
    const channels = color.slice(4, -1).split(",").map((value) => value.trim());
    if (channels.length !== 3) return color;
    return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${normalizedAlpha})`;
  }

  return color;
}

/**
 * WHY:   Cursor-card fade behavior needs a pure helper so tokens can be validated without rendering the mobile theme hook.
 * WHAT:  Resolves the runtime appearance for the shared mobile cursor-card shell from semantic tokens plus an optional ambient background.
 * HOW:   Derives the edge gradient and inner surface values while preserving the card's stable geometry and action styling.
 */
export function resolveCursorCardAppearance(tokens: CursorCardTokens, ambientBackgroundColor?: string): CursorCardAppearance {
  const ambient = ambientBackgroundColor ?? tokens.defaultAmbientBackgroundColor;

  return {
    ambientBackgroundColor: ambient,
    surfaceColor: tokens.surfaceColor,
    borderColor: tokens.borderColor,
    actionSurfaceColor: tokens.actionSurfaceColor,
    actionBorderColor: tokens.actionBorderColor,
    actionTextColor: tokens.actionTextColor,
    frameThickness: tokens.frameThickness,
    outerRadius: tokens.outerRadius,
    innerRadius: tokens.innerRadius,
    edgeColor: withAlpha(ambient, tokens.frameOpacity),
    transparentEdgeColor: withAlpha(ambient, 0),
  };
}
