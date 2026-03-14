import { I18nManager } from "react-native";

export const rtlRow = {
  flexDirection: I18nManager.isRTL ? ("row-reverse" as const) : ("row" as const),
};

export const rtlTextAlign = {
  textAlign: I18nManager.isRTL ? ("right" as const) : ("left" as const),
  writingDirection: I18nManager.isRTL ? ("rtl" as const) : ("ltr" as const),
};
