import { useState, useEffect } from "react";
import { Pressable, TextInput, View } from "react-native";
import { ArrowUp, Mic, Square, Paperclip, Image as ImageIcon } from "lucide-react-native";
import { rtlTextAlign } from "@/lib/rtl";
import { AppText } from "@/components/ui/AppText";

type AssistantExpandedComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending?: boolean;
};

/**
 * Rich chat input inspired by the web AI interface.
 * Features a stacked layout, attachment actions, and a dedicated voice recording state.
 */
export function AssistantExpandedComposer({
  value,
  onChange,
  onSend,
  isSending,
}: AssistantExpandedComposerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  // Simple mock timer for recording state
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleMicPress = () => {
    if (isRecording) {
      // Stop recording and "transcribe" (mock behavior)
      setIsRecording(false);
      onChange(value + (value ? " " : "") + "أبحث عن شقة في شمال الرياض...");
    } else {
      setIsRecording(true);
    }
  };

  return (
    <View className="bg-white px-4 pt-3 pb-5" style={{ borderTopWidth: 0.5, borderTopColor: "#e2e8f0" }}>
      <View 
        className={`transition-colors ${
          isRecording ? "bg-red-50/30" : "bg-slate-50"
        } overflow-hidden`}
        style={{ borderWidth: 0.5, borderColor: isRecording ? "#fecaca" : "#cbd5e1" }}
      >
        {isRecording ? (
          <View className="flex-row items-center justify-center py-6 gap-3">
            <View className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <AppText className="text-xl font-cairo-bold text-red-500 tracking-widest" style={{ fontVariant: ["tabular-nums"] }}>
              {formatTime(recordTime)}
            </AppText>
          </View>
        ) : (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="اسأل عنان، أو ابحث في مشاريعك..."
            placeholderTextColor="#94a3b8"
            multiline
            className="w-full min-h-[56px] max-h-32 px-4 py-3 font-cairo text-base text-slate-900"
            style={rtlTextAlign}
          />
        )}

        {/* Action Bar */}
        <View className="flex-row items-center justify-between px-2 pb-2 pt-1" style={{ borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
          <View className="flex-row items-center gap-1">
            <Pressable className="h-9 w-9 items-center justify-center active:bg-slate-200/50">
              <Paperclip size={18} color="#94a3b8" />
            </Pressable>
            <Pressable className="h-9 w-9 items-center justify-center active:bg-slate-200/50">
              <ImageIcon size={18} color="#94a3b8" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2">
            <Pressable 
              onPress={handleMicPress}
              className={`h-9 w-9 items-center justify-center ${isRecording ? "bg-red-100" : "bg-slate-200/50 active:bg-slate-300/50"}`}
            >
              {isRecording ? <Square size={16} color="#ef4444" fill="#ef4444" /> : <Mic size={18} color="#64748b" />}
            </Pressable>
            
            <Pressable 
              onPress={onSend}
              disabled={(!value.trim() && !isRecording) || isSending}
              className={`h-9 w-9 items-center justify-center transition-colors ${
                (value.trim() || isRecording) && !isSending ? "bg-brand" : "bg-slate-200"
              }`}
            >
              <ArrowUp size={18} color={(value.trim() || isRecording) && !isSending ? "#ffffff" : "#94a3b8"} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
