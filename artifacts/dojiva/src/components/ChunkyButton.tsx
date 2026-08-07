import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ChunkyButtonProps extends Omit<HTMLMotionProps<"button">, "type"> {
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "gray" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "icon" | "xl";
  isLocked?: boolean;
}

export const ChunkyButton = forwardRef<HTMLButtonElement, ChunkyButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLocked = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isActuallyDisabled = disabled || isLocked;

    const baseStyles =
      "relative inline-flex items-center justify-center font-bold tracking-wide uppercase transition-colors rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

    const variants = {
      primary:
        "bg-[#58cc02] text-white border-b-4 border-[#46a302] hover:bg-[#46a302] hover:border-[#388201]",
      secondary:
        "bg-[#1cb0f6] text-white border-b-4 border-[#1899d6] hover:bg-[#1899d6] hover:border-[#1483b8]",
      danger:
        "bg-[#ff4b4b] text-white border-b-4 border-[#ea2b2b] hover:bg-[#ea2b2b] hover:border-[#c52323]",
      gold:
        "bg-[#ffc800] text-white border-b-4 border-[#e5b400] hover:bg-[#e5b400] hover:border-[#c49a00]",
      gray: "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#cecece] hover:bg-[#d5d5d5]",
      ghost: "bg-transparent text-foreground hover:bg-muted/50 border-2 border-transparent hover:border-border",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm",
      md: "h-12 px-6 text-base",
      lg: "h-14 px-8 text-lg",
      xl: "h-16 px-10 text-xl rounded-2xl",
      icon: "h-12 w-12",
    };

    const lockedStyles =
      "bg-[#e5e5e5] text-[#afafaf] border-b-4 border-[#cecece] cursor-not-allowed";

    return (
      <motion.button
        ref={ref}
        whileTap={isActuallyDisabled ? undefined : { y: 4, marginBottom: -4, borderBottomWidth: 0, paddingBottom: 4 }}
        className={cn(
          baseStyles,
          sizes[size],
          isActuallyDisabled ? lockedStyles : variants[variant],
          className
        )}
        disabled={isActuallyDisabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
ChunkyButton.displayName = "ChunkyButton";
