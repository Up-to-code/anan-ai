import { ArrowUp, Mic } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

type ComposerDockProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function ComposerDock({ value, onChange, onSend }: ComposerDockProps) {
  const isTyping = value.trim().length > 0;
  const canSend = isTyping;

  return (
    <View className="bg-transparent py-4 w-full">
      <View 
        className="flex-row-reverse items-center gap-3 rounded-[32px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-2"
      >
        {/* Right Icon (Mic) */}
        <Pressable className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-50 dark:active:bg-slate-800 transition-colors">
          <Mic size={24} color="#64748B" />
        </Pressable>

        {/* Input Area */}
        <TextInput
          value={value}
          onChangeText={onChange}
          multiline={false}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={() => {
            if (!canSend) return;
            onSend();
          }}
          placeholder="كيف أقدر أساعدك اليوم؟"
          placeholderTextColor="#94A3B8"
          cursorColor="#2563EB"
          className="flex-1 h-12 bg-transparent text-right font-cairo-medium text-[16px] text-slate-900 dark:text-slate-100"
          style={{ writingDirection: 'rtl' }}
        />

        {/* Left Icon (Send Button) */}
        <Pressable
          onPress={canSend ? onSend : undefined}
          accessibilityRole="button"
          accessibilityLabel="إرسال"
          accessibilityState={{ disabled: !canSend }}
          className={`h-12 w-12 items-center justify-center rounded-full transition-all ${
            isTyping ? "bg-primary active:scale-95" : "bg-slate-100 dark:bg-slate-800"
          }`}
        >
          <ArrowUp size={24} color={isTyping ? "#FFFFFF" : "#94A3B8"} strokeWidth={3} />
        </Pressable>
      </View>
    </View>
  );
}
