import { useEffect, useRef, useState } from "react";
import { AppText } from "@/components/ui/AppText";

type StreamingTextProps = {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
};

/**
 * AG-UI Streaming Text — typewriter effect for AI responses.
 * Characters appear one at a time to simulate real-time generation.
 */
export function StreamingText({ text, speed = 20, onComplete }: StreamingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <AppText className="text-slate-700 leading-6">
      {displayed}
      {displayed.length < text.length ? (
        <AppText className="text-brand">▊</AppText>
      ) : null}
    </AppText>
  );
}
