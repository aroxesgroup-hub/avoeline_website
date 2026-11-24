/**
 * The one button look.
 *
 * A string rather than a <Button> component, deliberately. This app's buttons are
 * a mix of <button>, <Link>, <a> and <SubmitButton> (which carries no styling of
 * its own by design), so a component would need an `asChild` escape hatch, and
 * that means a dependency the project has ruled out. A string composes with all
 * four for free.
 *
 *   <button className={buttonClass()}>Save</button>
 *   <Link href="/x" className={buttonClass("secondary")}>Cancel</Link>
 *   <SubmitButton className={buttonClass("primary", "lg")}>Publish</SubmitButton>
 *
 * Primary is filled brand emerald (`--primary`); destructive is outlined. Confirm
 * dialogs carry the real safety for destructive acts — do not use brightness()
 * filters (they invert wrong in dark mode).
 */

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

/**
 * Semantic tokens from theme.css. Primary hover uses --primary-hover (not
 * brightness). Destructive stays outlined so the filled primary stays the safe path.
 */
const VARIANT: Record<Variant, string> = {
  primary:
    "border border-primary bg-primary text-primary-foreground shadow-xs hover:bg-primary-hover hover:border-primary-hover",
  secondary: "border border-line-loud bg-paper text-ink hover:border-ink hover:bg-muted",
  ghost: "border border-transparent bg-transparent text-ink-soft hover:bg-muted hover:text-ink",
  destructive: "border border-ink bg-paper text-ink hover:bg-ink hover:text-ink-invert",
};

const SIZE: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-11 gap-2 px-5 text-sm",
};

const BASE =
  "inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition duration-150 disabled:pointer-events-none disabled:opacity-50";

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]}${extra ? ` ${extra}` : ""}`;
}

/**
 * The one form-field look. Strings again, for the same reason as buttonClass:
 * <input>, <select> and <textarea> all take it as-is.
 *
 * border-line-loud, not border-line: the faint hairline disappears as a field
 * boundary. Focus uses outline (not ring) so layout never reflows.
 */
export const fieldClass =
  "w-full rounded-lg border border-line-loud bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-ink disabled:opacity-50";

/** ink-soft clears AA body — field labels are read, not decoration. */
export const labelClass = "block text-2xs font-medium uppercase text-ink-soft";

/**
 * The table recipe. pr-6 is load-bearing: without a gutter two adjacent headings
 * render as one word ("ATTENDEEEVENT").
 */
export const tableHead = "pb-3 pr-6 text-left text-2xs font-medium uppercase text-ink-soft";
export const tableCell = "py-3 pr-6 text-sm text-ink";
/** Muted hover is affordance only — below contrast floors on purpose. */
export const tableRow = "border-b border-line transition-colors last:border-b-0 hover:bg-muted";
