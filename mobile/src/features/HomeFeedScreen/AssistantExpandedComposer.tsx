import { Pressable, TextInput, View } from "react-native";
import { SendHorizontal } from "lucide-react-native";
import { rtlTextAlign } from "@/lib/rtl";

type AssistantExpandedComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

/**
 * Minimal chat input — clean horizontal strip, no heavy borders.
 */
export function AssistantExpandedComposer({
  value,
  onChange,
  onSend,
}: AssistantExpandedComposerProps) {
  return (
    <View className="flex-row items-end gap-2 bg-slate-50 p-2" style={{ borderWidth: 0.5, borderColor: "#e2e8f0" }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="اكتب رسالتك..."
        placeholderTextColor="#94a3b8"
        multiline
        className="flex-1 min-h-[44px] max-h-28 px-3 py-2 font-cairo text-base text-slate-900"
        style={rtlTextAlign}
      />
      <Pressable onPress={onSend} className="h-10 w-10 shrink-0 items-center justify-center bg-brand">
        <SendHorizontal size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
