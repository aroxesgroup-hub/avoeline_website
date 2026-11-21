export function AuthEmailDivider({ label = "Or continue with email" }: { label?: string }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-[var(--mkt-line)]" />
      </div>
      <p className="relative mx-auto w-fit bg-[var(--mkt-panel)] px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--mkt-muted)]">
        {label}
      </p>
    </div>
  );
}
