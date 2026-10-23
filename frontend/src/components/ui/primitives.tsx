import { ReactNode } from "react";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">{title}</h1>
        {description && <p className="text-sm text-ink-500 mt-1 max-w-2xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("bg-surface border border-border rounded-2xl shadow-card", className)} {...rest}>
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  icon: Icon,
  className,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary";
  icon?: LucideIcon;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "primary" && "bg-brand-500 text-white hover:bg-brand-600",
        variant === "secondary" &&
          "bg-surface text-ink-700 border border-border hover:bg-page",
        className
      )}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  text,
  linkText,
  onLinkClick,
}: {
  icon?: LucideIcon;
  text: string;
  linkText?: string;
  onLinkClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {Icon && <Icon size={22} className="text-brand-500 mb-3" />}
      <p className="text-sm text-ink-500">
        {text}{" "}
        {linkText && (
          <button onClick={onLinkClick} className="text-brand-600 underline hover:text-brand-700">
            {linkText}
          </button>
        )}
      </p>
    </div>
  );
}

export function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <Card className="p-6">
      <p className="text-3xl font-bold text-ink-900">{value}</p>
      <p className="text-xs font-medium tracking-wide text-ink-400 mt-1 uppercase">{label}</p>
    </Card>
  );
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="p-5 h-full hover:border-brand-400 transition-colors group">
        <Icon size={19} className="text-brand-500 mb-3" />
        <p className="font-semibold text-ink-900 text-[15px]">{title}</p>
        <p className="text-sm text-ink-500 mt-1">{description}</p>
        <span className="inline-block mt-3 text-brand-600 group-hover:translate-x-0.5 transition-transform">
          →
        </span>
      </Card>
    </button>
  );
}

export function ComingSoonPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-10 flex flex-col items-center text-center">
      <Icon size={22} className="text-brand-500 mb-3" />
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="text-sm text-ink-500 mt-1 max-w-md">{description}</p>
      <span className="mt-4 text-xs font-medium text-brand-600 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
        Phase 2 — API wiring in progress
      </span>
    </Card>
  );
}
