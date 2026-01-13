import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToggleSwitchProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  label?: ReactNode;
  labelPosition?: "left" | "right";
  labelClassName?: string;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  onStateLabel?: ReactNode;
  offStateLabel?: ReactNode;
  size?: "sm" | "md";
  className?: string;
};

export default function ToggleSwitch({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
  label,
  labelPosition = "right",
  labelClassName,
  leftLabel,
  rightLabel,
  onStateLabel,
  offStateLabel,
  size = "md",
  className,
}: ToggleSwitchProps) {
  const isSmall = size === "sm";
  const trackSize = isSmall ? "h-4 w-8" : "h-5 w-10";
  const knobSize = isSmall ? "h-3 w-3" : "h-4 w-4";
  const knobTranslate = isSmall ? "peer-checked:translate-x-4" : "peer-checked:translate-x-5";
  const labelText = isSmall ? "text-[10px]" : "text-xs";
  const stateText = isSmall ? "text-[8px]" : "text-[9px]";
  const ariaLabelText =
    ariaLabel ?? (typeof label === "string" || typeof label === "number"
      ? String(label)
      : "Toggle");

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 select-none",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      {label && labelPosition === "left" && (
        <span
          className={cn(
            labelText,
            "inline-flex items-center text-muted-foreground",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
      {leftLabel && (
        <span
          className={cn(
            labelText,
            "inline-flex items-center justify-center font-semibold text-muted-foreground",
          )}
        >
          {leftLabel}
        </span>
      )}
      <span className={cn("relative inline-flex items-center", trackSize)}>
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          disabled={disabled}
          aria-label={ariaLabelText}
        />
        <span
          className={cn(
            "absolute inset-0 rounded-full border border-border/60 bg-surface/70 shadow-inner transition-colors",
            "peer-checked:bg-accent/20 peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
            "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
          )}
        />
        {offStateLabel && (
          <span
            className={cn(
              "absolute left-1 inline-flex items-center justify-center font-semibold uppercase text-muted-foreground/70 transition-opacity",
              stateText,
              "peer-checked:opacity-0 pointer-events-none",
            )}
          >
            {offStateLabel}
          </span>
        )}
        {onStateLabel && (
          <span
            className={cn(
              "absolute right-1 inline-flex items-center justify-center font-semibold uppercase text-muted-foreground/70 opacity-0 transition-opacity",
              stateText,
              "peer-checked:opacity-100 pointer-events-none",
            )}
          >
            {onStateLabel}
          </span>
        )}
        <span
          className={cn(
            "absolute left-0.5 rounded-full bg-white shadow transition-transform",
            knobSize,
            knobTranslate,
          )}
        />
      </span>
      {rightLabel && (
        <span
          className={cn(
            labelText,
            "inline-flex items-center justify-center font-semibold text-muted-foreground",
          )}
        >
          {rightLabel}
        </span>
      )}
      {label && labelPosition === "right" && (
        <span
          className={cn(
            labelText,
            "inline-flex items-center text-muted-foreground",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
}
