import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "default";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    success: "bg-eco-green-light text-eco-green border-eco-green/20",
    warning: "bg-eco-yellow-light text-eco-yellow border-eco-yellow/20",
    danger: "bg-eco-red-light text-eco-red border-eco-red/20",
    info: "bg-eco-blue-light text-eco-blue border-eco-blue/20",
    default: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
