import React from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Clock3 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { MobileTopBar } from "@/components/ui/MobileChrome";
import { useBuyerAccount } from "@/hooks/useBuyerAccount";
import { getDateLocale } from "@/lib/locale";
import { useMobileLocale } from "@/lib/mobileLocale";
import { useAppTheme } from "@/lib/mobileTheme";
import { AccountActionList, AccountActionRow, AccountEmptyState, AccountPageIntro } from "@/features/AccountScreen/shared";

/**
 * WHY:   Buyers need a dedicated history view that makes resuming an earlier journey feel obvious without heavy dashboard framing.
 * WHAT:  Renders the saved conversation list with a minimal intro and a consistent account action-list treatment.
 * HOW:   Reads recent thread summaries from the shared buyer-account hook and routes back into the assistant with the selected thread id.
 */
export default function AccountHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const account = useBuyerAccount();
  const { dictionary, locale } = useMobileLocale();
  const accountCopy = dictionary.account;
  const historyCopy = dictionary.accountHistory;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.canvas }}>
      <MobileTopBar
        insetTop={insets.top}
        backgroundColor={theme.colors.canvas}
        borderColor={theme.colors.border}
        title={accountCopy.history}
        leading={<IconButton icon={ArrowLeft} onPress={() => router.back()} tone="panel" />}
        trailing={<View style={{ width: 44, height: 44 }} />}
      />

      <ScrollView
        className="flex-1 px-5 pt-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 32) + 24 }}
      >
        <View className="gap-4">
          <AccountPageIntro
            title={account.recentThreads.length > 0 ? `${account.recentThreads.length} ${accountCopy.chats}` : historyCopy.emptyTitle}
            tone="muted"
          />

          {account.recentThreads.length > 0 ? (
            <AccountActionList>
              {account.recentThreads.map((thread, index) => (
                <AccountActionRow
                  key={thread.id}
                  icon={Clock3}
                  label={thread.title}
                  description={thread.preview}
                  status={new Intl.DateTimeFormat(getDateLocale(locale), {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(thread.updatedAt))}
                  onPress={() => router.push({ pathname: "/", params: { threadId: thread.id } })}
                  withBorder={index < account.recentThreads.length - 1}
                />
              ))}
            </AccountActionList>
          ) : (
            <AccountEmptyState
              title={historyCopy.firstChatTitle}
              body={historyCopy.firstChatBody}
              action={<Button label={historyCopy.openAssistant} variant="secondary" onPress={() => router.push("/")} />}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
