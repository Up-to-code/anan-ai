import Svg, { Circle, Path, Rect } from "react-native-svg";

type AnanMarkProps = {
  size?: number;
};

/**
 * WHY:   The assistant header needs a compact brand mark that feels native to the Anan system.
 * WHAT:  Renders a simplified mobile-sized version of the Anan mark.
 * HOW:   Uses the same navy and blue relationship present in the shared brand assets.
 */
export function AnanMark({ size = 28 }: AnanMarkProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
      <Circle cx="48" cy="48" r="34" stroke="#D7E3F4" strokeWidth="2.5" />
      <Path d="M48 22V35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M74 48H61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M48 74V61" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M22 48H35" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
      <Circle cx="48" cy="22" r="4.25" fill="#0F172A" />
      <Circle cx="74" cy="48" r="4.25" fill="#0F172A" />
      <Circle cx="48" cy="74" r="4.25" fill="#0F172A" />
      <Circle cx="22" cy="48" r="4.25" fill="#0F172A" />
      <Rect x="37" y="37" width="22" height="22" rx="4.5" fill="#0F172A" />
      <Path d="M42.5 56L48 42.5L53.5 56" stroke="white" strokeWidth="3.25" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M45.5 50.3H50.5" stroke="white" strokeWidth="3.25" strokeLinecap="round" />
    </Svg>
  );
}
