"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:brightness-110 active:brightness-95 shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.6)]",
  secondary: "bg-surface-raised text-foreground hover:bg-muted border border-border",
  ghost: "bg-transparent text-foreground hover:bg-muted",
  outline: "bg-transparent border border-border text-foreground hover:bg-muted",
  danger: "bg-danger text-background hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-14 px-7 text-base rounded-2xl",
  icon: "h-11 w-11 rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-semibold tracking-tight transition-all duration-200 ease-out",
          "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
