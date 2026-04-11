import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useComposerState } from "@/hooks/useComposerState";

const renderToStaticMarkup = require("react-dom/server").renderToStaticMarkup as (element: React.ReactElement) => string;

const mockFns = vi.hoisted(() => ({
  keyboardDismiss: vi.fn(),
  startRecording: vi.fn(),
}));

vi.mock("react-native", () => ({
  Animated: {
    Value: class {},
  },
  Keyboard: {
    dismiss: mockFns.keyboardDismiss,
  },
}));

vi.mock("@/hooks/useVoiceRecording", () => ({
  useVoiceRecording: () => ({
    phase: "idle",
    durationSeconds: 0,
    waveAnims: [],
    startRecording: mockFns.startRecording,
    stopAndSubmit: vi.fn(),
    cancelRecording: vi.fn(),
  }),
}));

vi.mock("@/lib/mobileLayout", () => ({
  useMobileLayout: () => ({
    isCompact: false,
  }),
}));

vi.mock("@/lib/mobileLocale", () => ({
  useMobileLocale: () => ({
    locale: "ar",
  }),
}));

vi.mock("@/lib/mobileTheme", () => ({
  useAppTheme: () => ({
    colors: {
      composerActionIcon: "#000000",
      composerActionRing: "#000000",
      composerActionSurface: "#ffffff",
      send: "#000000",
      sendIcon: "#ffffff",
    },
    isDark: false,
  }),
}));

function HookHarness(props: {
  value: string;
  onChange?: (value: string) => void;
  onSend?: (value: string) => void;
  onSubmitVoiceRecording?: (fileUri: string) => Promise<void>;
  onReady: (result: { handlePrimaryActionPress: () => void }) => void;
}) {
  const result = useComposerState({
    value: props.value,
    onChange: props.onChange ?? vi.fn(),
    onSend: props.onSend ?? vi.fn(),
    onSubmitVoiceRecording: props.onSubmitVoiceRecording ?? vi.fn(async () => undefined),
  });

  props.onReady(result);
  return null;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("useComposerState", () => {
  it("dismisses the keyboard before sending a typed message", () => {
    const onSend = vi.fn();
    let captured: { handlePrimaryActionPress: () => void } | null = null;

    renderToStaticMarkup(
      <HookHarness
        value="  ابحث عن فيلا  "
        onSend={onSend}
        onReady={(result) => {
          captured = result;
        }}
      />,
    );

    if (!captured) {
      throw new Error("Expected hook result to be captured.");
    }

    const hookResult = captured as { handlePrimaryActionPress: () => void };
    hookResult.handlePrimaryActionPress();

    expect(mockFns.keyboardDismiss).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith("ابحث عن فيلا");
    expect(mockFns.startRecording).not.toHaveBeenCalled();
  });
});
