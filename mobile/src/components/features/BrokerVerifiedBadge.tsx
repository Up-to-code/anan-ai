import { View, Pressable } from "react-native";
import { Link } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { CheckCircle } from "lucide-react-native";

type BrokerVerifiedBadgeProps = {
  id: string;
  name: string;
  isVerified: boolean;
};

/**
 * Minimal broker name + verified checkmark. No avatar, no extra UI.
 */
export function BrokerVerifiedBadge({ id, name, isVerified }: BrokerVerifiedBadgeProps) {
  return (
    <Link href={`/broker/${id}` as any} asChild>
      <Pressable className="flex-row items-center gap-2">
        <AppText className="font-cairo-bold text-slate-900">{name}</AppText>
        {isVerified ? <CheckCircle size={14} color="#2563EB" /> : null}
      </Pressable>
    </Link>
  );
}
