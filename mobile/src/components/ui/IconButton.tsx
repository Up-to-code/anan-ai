import { LucideIcon } from "lucide-react-native";
import { Pressable, PressableProps } from "react-native";
import { cn } from "@/lib/cn";

type IconButtonProps = PressableProps & {
  icon: LucideIcon;
  active?: boolean;
};

/**
 * Borderless, transparent icon button for floating feed actions.
 */
export function IconButton({ icon: Icon, active, className, ...props }: IconButtonProps) {
  return (
    <Pressable
      {...props}
      className={cn("h-10 w-10 items-center justify-center", className)}
    >
      <Icon color={active ? "#2563EB" : "#0F172A"} size={20} strokeWidth={1.5} />
    </Pressable>
  );
}
