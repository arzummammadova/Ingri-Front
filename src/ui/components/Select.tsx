"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { Popover } from "./Popover";
import { cn } from "@/lib/utils";

export type SelectOption<V extends string = string> = { value: V; label: ReactNode; hint?: ReactNode; icon?: ReactNode };

/**
 * Accessible, portal-based select (shadcn-like). Fixed-width trigger, so the surrounding
 * flex layout (e.g. the header) never reflows when the list opens.
 */
export default function Select<V extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  className,
  align = "start",
  minWidth = 160,
  renderValue,
  size = "md",
}: {
  value: V | "";
  options: SelectOption<V>[];
  onChange: (value: V) => void;
  ariaLabel: string;
  placeholder?: ReactNode;
  className?: string;
  align?: "start" | "end";
  minWidth?: number;
  renderValue?: (option: SelectOption<V> | undefined) => ReactNode;
  size?: "sm" | "md";
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const current = options.find((option) => option.value === value);
  const close = useCallback(() => setOpen(false), []);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setOpen(false);
    ref.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      setActive(Math.max(0, options.findIndex((o) => o.value === value)));
      setOpen(true);
      return;
    }
    if (!open) return;
    if (event.key === "ArrowDown") { event.preventDefault(); setActive((i) => (i + 1) % options.length); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive((i) => (i - 1 + options.length) % options.length); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(active); }
    else if (event.key === "Tab") setOpen(false);
  }

  return (
    <>
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => { setActive(Math.max(0, options.findIndex((o) => o.value === value))); setOpen((v) => !v); }}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex min-w-0 shrink-0 items-center justify-between gap-2 rounded-full border border-border bg-card text-left font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-3.5 text-sm",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          {renderValue ? renderValue(current) : current ? <>{current.icon}{current.label}</> : <span className="text-muted-foreground">{placeholder}</span>}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 opacity-70 transition", open && "rotate-180")} />
      </button>
      <Popover anchorRef={ref} open={open} onClose={close} align={align} minWidth={minWidth} role="presentation">
        <ul id={listId} role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(index)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  index === active && "bg-muted",
                  selected && "font-semibold",
                )}
              >
                {option.icon}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.hint && <span className="text-xs text-muted-foreground">{option.hint}</span>}
                {selected && <Check className="size-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      </Popover>
    </>
  );
}
