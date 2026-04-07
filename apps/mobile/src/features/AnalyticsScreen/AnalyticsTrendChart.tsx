import { View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { MobileSurface } from "@/components/ui/MobileChrome";
import { useAppTheme } from "@/lib/mobileTheme";

export type AnalyticsTrendPoint = {
  label: string;
  visits: number;
  qualified: number;
  conversion: number;
};

function formatCompactArabicNumber(value: number) {
  if (value >= 1_000_000) {
    const scaled = value / 1_000_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}م`;
  }

  if (value >= 1_000) {
    const scaled = value / 1_000;
    return `${scaled >= 10 ? scaled.toFixed(0) : scaled.toFixed(1)}ألف`;
  }

  return new Intl.NumberFormat("ar-EG").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

/**
 * WHY:   The analytics page needs one readable trend view that keeps the story obvious on a narrow phone canvas.
 * WHAT:  Renders a compact weekly chart using vertical bars, qualified-lead tags, and two summary callouts.
 * HOW:   Scales all columns against the strongest week, keeps labels below the bars, and avoids heavy chart chrome or extra controls.
 */
export function AnalyticsTrendChart({ data }: { data: AnalyticsTrendPoint[] }) {
  const theme = useAppTheme();
  const strongestPoint = data.reduce((best, point) => (point.visits > best.visits ? point : best), data[0]);
  const averageConversion = data.reduce((total, point) => total + point.conversion, 0) / data.length;
  const maxVisits = Math.max(...data.map((point) => point.visits), 1);

  return (
    <MobileSurface radius="hero" className="gap-5">
      <View className="gap-2">
        <AppText className="text-[22px] font-cairo-black" style={{ color: theme.colors.ink }}>
          نبض الزيارات والجودة
        </AppText>
        <AppText className="text-[14px] leading-7 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
          المشاهدات ترتفع بثبات، لكن الأسبوع الأقوى هو الذي جمع وصولاً جيداً مع عدد أعلى من الطلبات المؤهلة.
        </AppText>
      </View>

      <View
        className="overflow-hidden rounded-[24px] px-4 pb-4 pt-5"
        style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
      >
        <View className="relative" style={{ height: 216 }}>
          {[0, 1, 2].map((lineIndex) => (
            <View
              key={lineIndex}
              className="absolute left-0 right-0"
              style={{
                top: lineIndex * 56,
                borderTopWidth: 1,
                borderTopColor: theme.colors.border,
                opacity: 0.85,
              }}
            />
          ))}

          <View
            className="absolute bottom-0 left-0 right-0 flex-row-reverse items-end justify-between"
            style={{ gap: 8 }}
          >
            {data.map((point) => {
              const barHeight = Math.max(28, Math.round((point.visits / maxVisits) * 128));

              return (
                <View key={point.label} className="flex-1 items-center" style={{ gap: 10 }}>
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: theme.colors.canvas, borderWidth: 1, borderColor: theme.colors.border }}
                  >
                    <AppText
                      className="text-[11px] font-cairo-bold"
                      style={{ color: theme.colors.inkSoft, textAlign: "center" }}
                    >
                      {formatCompactArabicNumber(point.qualified)} مؤهل
                    </AppText>
                  </View>

                  <View
                    className="w-full items-center justify-end"
                    style={{ height: 132 }}
                  >
                    <View
                      className="w-full overflow-hidden rounded-[18px]"
                      style={{ maxWidth: 30, height: barHeight, backgroundColor: theme.colors.primary }}
                    />
                  </View>

                  <View className="items-center" style={{ gap: 2 }}>
                    <AppText
                      className="text-[12px] font-cairo-bold"
                      style={{ color: theme.colors.ink, textAlign: "center" }}
                    >
                      {point.label}
                    </AppText>
                    <AppText
                      className="text-[11px] font-cairo-medium"
                      style={{ color: theme.colors.inkMuted, textAlign: "center" }}
                    >
                      {formatPercent(point.conversion)}
                    </AppText>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View className="flex-row-reverse" style={{ gap: 12 }}>
        <View
          className="flex-1 rounded-[20px] px-4 py-4"
          style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
        >
          <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
            أقوى أسبوع
          </AppText>
          <AppText className="mt-2 text-[18px] font-cairo-black" style={{ color: theme.colors.ink }}>
            {strongestPoint.label}
          </AppText>
          <AppText className="mt-1 text-[13px] leading-6 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
            {formatCompactArabicNumber(strongestPoint.visits)} زيارة و{formatCompactArabicNumber(strongestPoint.qualified)} طلباً مؤهلاً.
          </AppText>
        </View>

        <View
          className="flex-1 rounded-[20px] px-4 py-4"
          style={{ backgroundColor: theme.colors.surfaceMuted, borderWidth: 1, borderColor: theme.colors.border }}
        >
          <AppText className="text-[12px] font-cairo-bold" style={{ color: theme.colors.inkMuted }}>
            متوسط التحويل
          </AppText>
          <AppText className="mt-2 text-[18px] font-cairo-black" style={{ color: theme.colors.ink }}>
            {formatPercent(averageConversion)}
          </AppText>
          <AppText className="mt-1 text-[13px] leading-6 font-cairo-medium" style={{ color: theme.colors.inkSoft }}>
            القراءة الأفضل تأتي من دمج الحجم مع الجودة، لا من الزيارات وحدها.
          </AppText>
        </View>
      </View>
    </MobileSurface>
  );
}
