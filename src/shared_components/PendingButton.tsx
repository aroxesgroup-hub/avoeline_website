"use client";

import React from "react";

type PendingButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pending?: boolean;
  pendingText?: string;
};

/**
 * Non-form side-effect control: disables + aria-busy while `pending`.
 * Prefer SubmitButton inside server-action forms.
 */
export function PendingButton({
  children,
  pending = false,
  pendingText,
  disabled,
  type = "button",
  ...props
}: PendingButtonProps) {
  return (
    <button type={type} {...props} disabled={pending || disabled} aria-busy={pending}>
      {pending ? (pendingText ?? "Processing…") : children}
    </button>
  );
}

export default PendingButton;
