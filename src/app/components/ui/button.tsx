import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { cn } from "../../utils/cn";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-eco-green text-white hover:bg-eco-green/90 shadow-sm hover:shadow-md",
    secondary: "bg-eco-blue text-white hover:bg-eco-blue/90 shadow-sm hover:shadow-md",
    outline: "border-2 border-eco-green text-eco-green hover:bg-eco-green/10",
    ghost: "text-foreground hover:bg-muted",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
