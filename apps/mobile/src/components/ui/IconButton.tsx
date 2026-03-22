import { LucideIcon } from "lucide-react-native";
import { Pressable, PressableProps } from "react-native";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
  tone?: "light" | "panel";
};

/**
 * WHY:   Compact icon actions appear in the header, search, and property surfaces.
 * WHAT:  Renders a square icon button with optional active state and surface tone.
 * HOW:   Uses subtle borders and fixed sizing so icon actions stay visually stable across screens.
 */
export function IconButton({ icon: Icon, active, tone = "light", className, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      className={cn(
        "h-10 w-10 items-center justify-center border",
        tone === "light" ? "border-line bg-white" : "border-line bg-panel",
        className,
      )}
    >
      <Icon color={active ? "#2563EB" : "#0F172A"} size={20} strokeWidth={1.5} />
    </Pressable>
  );
}
