import type { HTMLAttributes, ReactNode } from "react";
import { Card as SharedCard, CardBody as SharedCardBody } from "@/src/shared_components/ui/Card";

/**
 * Form-kit Card — tones match shared_components/ui/Card (canonical).
 * Extra Header/Title/Content helpers stay here for existing form-kit imports.
 */

export type CardTone = "flat" | "raised" | "panel";

export interface CardProps {
  tone?: CardTone;
  title?: ReactNode;
  action?: ReactNode;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({
  tone = "flat",
  title,
  action,
  interactive = false,
  className = "",
  children,
}: CardProps) {
  return (
    <SharedCard
      tone={tone}
      title={title}
      action={action}
      interactive={interactive}
      className={className}
    >
      {children}
    </SharedCard>
  );
}

export function CardBody({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <SharedCardBody className={className}>{children}</SharedCardBody>;
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 p-5 pb-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-display text-base font-semibold leading-none tracking-tight text-ink ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-ink-soft ${className}`.trim()} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 pt-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center border-t border-line p-5 pt-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
