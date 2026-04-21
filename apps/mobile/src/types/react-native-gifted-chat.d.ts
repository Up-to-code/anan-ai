import type React from "react";

export type IMessage = {
  _id: string | number;
  text: string;
  createdAt: Date | number;
  user: {
    _id: string | number;
    name?: string;
  };
  pending?: boolean;
};

export type BubbleProps<TMessage extends IMessage = IMessage> = {
  currentMessage?: TMessage;
};

export type GiftedChatProps<TMessage extends IMessage = IMessage> = {
  messages?: TMessage[];
  isTyping?: boolean;
  user?: {
    _id: string | number;
    name?: string;
  };
  renderAvatar?: (...args: any[]) => React.ReactNode;
  renderDay?: (...args: any[]) => React.ReactNode;
  renderTime?: (...args: any[]) => React.ReactNode;
  renderUsername?: (...args: any[]) => React.ReactNode;
  renderBubble?: (props: BubbleProps<TMessage>) => React.ReactNode;
  renderCustomView?: (props: BubbleProps<TMessage>) => React.ReactNode;
  renderInputToolbar?: (props: any) => React.ReactNode;
  isCustomViewBottom?: boolean;
  messagesContainerStyle?: any;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  textInputProps?: Record<string, unknown>;
  onSend?: (...args: any[]) => void;
};

export const GiftedChat: <TMessage extends IMessage = IMessage>(props: GiftedChatProps<TMessage>) => React.ReactElement | null;
