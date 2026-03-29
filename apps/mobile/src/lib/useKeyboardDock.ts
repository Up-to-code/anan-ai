import { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";

type KeyboardDockResult = {
  dockBottomOffset: number;
  listBottomPadding: number;
  keyboardVisible: boolean;
};

/**
 * WHY:   The mobile assistant composer must stay visible above the keyboard without relying on fragile shared-value layout work.
 * WHAT:  Exposes a small, stable layout contract for the floating composer and timeline padding.
 * HOW:   Uses native keyboard events and lets iOS lift the dock while Android keeps resize-first behavior.
 */
export function useKeyboardDock({
  bottomInset,
  dockHeight,
  keyboardGap = 5,
}: {
  bottomInset: number;
  dockHeight: number;
  keyboardGap?: number;
}): KeyboardDockResult {
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const baseBottomInset = Math.max(bottomInset, 12);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = Math.max(Math.round(event.endCoordinates.height - bottomInset), 0);
      setKeyboardInset(keyboardHeight);
      setKeyboardVisible(keyboardHeight > 0);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardInset(0);
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [bottomInset, keyboardGap]);

  return useMemo(
    () => ({
      dockBottomOffset:
        Platform.OS === "ios" && keyboardVisible ? keyboardInset + keyboardGap : baseBottomInset,
      listBottomPadding:
        dockHeight +
        (Platform.OS === "ios" && keyboardVisible
          ? keyboardInset + keyboardGap + 16
          : baseBottomInset + 16),
      keyboardVisible,
    }),
    [baseBottomInset, dockHeight, keyboardGap, keyboardInset, keyboardVisible]
  );
}
