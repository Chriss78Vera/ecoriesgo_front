import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-2xl shadow-sm border border-border p-6 transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-card-foreground", className)}>{children}</h3>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("", className)}>{children}</div>;
}
