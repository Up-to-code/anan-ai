import type { ReactNode } from "react";

export type DocsPageKey =
  | "overview"
  | "architecture"
  | "convex"
  | "webGateway"
  | "channels"
  | "capabilities"
  | "ui"
  | "data"
  | "aiChatflow"
  | "mobile"
  | "workflow";

export type DocsLinkItem = {
  href: string;
  label: string;
  description: string;
};

export type DocsTable = {
  headers: string[];
  rows: string[][];
};

export type DocsCallout = {
  title: string;
  body: string;
  tone?: "info" | "warn" | "success";
};

export type DocsSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  callout?: DocsCallout;
  table?: DocsTable;
  codeBlock?: {
    label: string;
    code: string;
  };
  links?: DocsLinkItem[];
  note?: ReactNode;
};

export type DocsPageDefinition = {
  key: DocsPageKey;
  eyebrow?: string;
  title: string;
  summary: string;
  intro: string[];
  sections: DocsSection[];
  related: DocsPageKey[];
};

