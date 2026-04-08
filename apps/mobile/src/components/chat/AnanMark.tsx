import Svg, { Circle, Path } from "react-native-svg";

type AnanMarkProps = {
  size?: number;
};

/**
 * WHY:   Mobile should use the real Anan brand mark instead of a temporary bundled glyph.
 * WHAT:  Renders the icon portion of the shared Anan logo asset.
 * HOW:   Rebuilds the production brand geometry from `apps/marketing/public/brand-logo.svg` using `react-native-svg`.
 */
export function AnanMark({ size = 28 }: AnanMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="110 70 180 200" fill="none">
      <Path d="M200 250L200 110" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M200 110L225 85" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M200 170L175 145L175 120" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M200 210L165 175L130 175" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M200 210L235 175L235 145" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M235 175L275 175" stroke="#2A7DBD" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      <Circle cx="200" cy="250" r="12" fill="#0C2D54" />
      <Circle cx="225" cy="85" r="12" fill="#0C2D54" />
      <Circle cx="175" cy="120" r="12" fill="#0C2D54" />
      <Circle cx="130" cy="175" r="12" fill="#0C2D54" />
      <Circle cx="235" cy="145" r="12" fill="#0C2D54" />
      <Circle cx="275" cy="175" r="12" fill="#0C2D54" />
      <Circle cx="242" cy="223" r="12" fill="#0C2D54" />
    </Svg>
  );
}
