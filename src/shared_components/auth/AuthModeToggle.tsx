import Link from "next/link";

export function AuthModeToggle({
  mode,
  signupHref = "/auth/signup",
}: {
  mode: "signin" | "signup";
  signupHref?: string;
}) {
  const base =
    "flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold transition duration-150";
  const active = "bg-[var(--mkt-btn)] text-[var(--mkt-btn-fg)] shadow-xs";
  const idle = "text-[var(--mkt-muted)] hover:text-[var(--mkt-ink)]";

  return (
    <div
      className="mb-6 flex w-full items-center gap-1 rounded-full border border-[var(--mkt-line)] bg-[var(--mkt-panel)] p-1"
      role="tablist"
      aria-label="Sign in or sign up"
    >
      <Link
        href="/auth/signin"
        role="tab"
        aria-selected={mode === "signin"}
        className={`${base} ${mode === "signin" ? active : idle}`}
      >
        Sign in
      </Link>
      <Link
        href={signupHref}
        role="tab"
        aria-selected={mode === "signup"}
        className={`${base} ${mode === "signup" ? active : idle}`}
      >
        Sign up
      </Link>
    </div>
  );
}
