"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";
import { formatOfferCountLabel, getOfferUiCopy } from "../../shared/copy/offerLocalization";

type SearchableOption = {
  label: string;
  value: string;
};

/**
 * WHY:   Offers filters need a selector that feels natural for long Saudi/UAE lists without sacrificing keyboard or screen-reader support.
 * WHAT:  Renders a form-compatible searchable combobox with a scrollable listbox, hidden submitted value, and full keyboard navigation.
 * HOW:   Uses a button-triggered popup, internal search state, roving active option state, and outside-click/escape handling while preserving GET form behavior.
 */
export default function SearchableSelector({
  label,
  name,
  value,
  options,
  placeholder,
  emptyMessage,
  onValueChange,
}: {
  label: string;
  name: string;
  value: string;
  options: SearchableOption[];
  placeholder: string;
  emptyMessage: string;
  onValueChange?: (value: string) => void;
}) {
  const { locale } = useWebLocale();
  const copy = getOfferUiCopy(locale);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedValue, setSelectedValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = useId();
  const labelId = useId();

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (activeIndex > filteredOptions.length - 1) {
      setActiveIndex(Math.max(filteredOptions.length - 1, 0));
    }
  }, [activeIndex, filteredOptions.length]);

  const selectedOption = options.find((option) => option.value === selectedValue);
  const buttonText = selectedOption?.label || placeholder;

  function commitValue(nextValue: string) {
    setSelectedValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, Math.max(filteredOptions.length - 1, 0)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }
    if (event.key === "Enter" && filteredOptions[activeIndex]) {
      event.preventDefault();
      commitValue(filteredOptions[activeIndex].value);
    }
  }

  return (
    <div ref={rootRef} className="space-y-2 text-right">
      <div className="flex items-center justify-between">
        <label id={labelId} className="text-[12px] font-bold text-foreground">
          {label}
        </label>
        <span className="text-[11px] text-muted-foreground">
          {formatOfferCountLabel(locale, copy.selector.optionCount, options.length)}
        </span>
      </div>

      <input type="hidden" name={name} value={selectedValue} />

      <div className="relative">
        <button
          type="button"
          aria-labelledby={labelId}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          onClick={() => setOpen((current) => !current)}
          onKeyDown={handleTriggerKeyDown}
          className="flex h-11 w-full items-center justify-between rounded-[16px] border border-border/70 bg-background/90 px-3.5 text-[13px] font-medium text-foreground transition hover:bg-background focus:border-[color:var(--workspace-highlight)] focus:ring-4 focus:ring-[color:var(--workspace-highlight-soft)] focus:outline-none"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-muted-foreground transition ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 8 5 5 5-5" />
          </svg>
          <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>{buttonText}</span>
        </button>

        {open ? (
          <div className="absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 rounded-[18px] border border-border/80 bg-popover/95 p-2 text-popover-foreground shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur">
            <div className="border-b border-border/60 pb-2">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={copy.selector.searchIn.replace("{label}", label)}
                aria-label={copy.selector.searchIn.replace("{label}", label)}
                className="h-10 w-full rounded-[14px] border border-border/70 bg-background px-3 text-right text-[13px] font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[color:var(--workspace-highlight)] focus:ring-4 focus:ring-[color:var(--workspace-highlight-soft)]"
              />
            </div>

            <div
              id={listboxId}
              role="listbox"
              aria-labelledby={labelId}
              className="mt-2 max-h-56 overflow-y-auto overscroll-contain pr-1"
            >
              {filteredOptions.length > 0 ? (
                <div className="space-y-1">
                  {filteredOptions.map((option, index) => {
                    const isSelected = option.value === selectedValue;
                    const isActive = index === activeIndex;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => commitValue(option.value)}
                        className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-right text-[13px] font-medium transition ${
                          isSelected
                            ? "bg-[color:var(--workspace-highlight-soft)] text-[color:var(--workspace-highlight-strong)]"
                            : isActive
                              ? "bg-muted text-foreground"
                              : "text-foreground hover:bg-muted"
                        }`}
                      >
                        {isSelected ? (
                          <span className="text-[11px] font-bold">{copy.selector.selected}</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">{copy.selector.choose}</span>
                        )}
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="px-3 py-6 text-center text-[12px] font-medium text-muted-foreground">{emptyMessage}</div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
