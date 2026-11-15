import path from "node:path";
import { expect, test } from "@playwright/test";
import { assertMailHasNoSecrets, waitForMail } from "../helpers/mailpit";
import {
  NEW_PASSWORD,
  OWNER_EMAIL,
  OWNER_PASSWORD,
  acceptInvite,
  createTenant,
  signIn,
  signOut,
  uniqueEmail,
} from "../helpers/journey";
import { writeJourneyState } from "./state";

test.describe.configure({ mode: "serial" });

const organizerEmail = uniqueEmail("j1.org");
const departmentEmail = uniqueEmail("j1.dept");
const vendorEmail = uniqueEmail("j1.vendor");
const organizerPassword = "TempPass1!";

test("J1 owner provisions tenants, plan, billing, override, moderation, and support", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);

  const shown = await createTenant(page, {
    type: "Organizer",
    name: "Journey Organizer",
    email: organizerEmail,
    access: "temp",
    password: organizerPassword,
  });
  expect(shown).toBeTruthy();
  const ready = await waitForMail({ to: organizerEmail });
  assertMailHasNoSecrets(ready, shown || organizerPassword);
  expect(ready.Subject.length).toBeGreaterThan(0);

  await signOut(page);
  await signIn(page, organizerEmail, shown || organizerPassword);
  await expect(page).toHaveURL(/\/auth\/change-password/);
  await page.locator("#new-password").fill(NEW_PASSWORD);
  await page.locator("#confirm-password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Save password" }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/change-password"));

  await signOut(page);
  await page.goto("/auth/signin");
  await page.locator("#signin-email").fill(organizerEmail);
  await page.locator("#signin-password").fill(shown || organizerPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText(/invalid|incorrect|wrong/i).first()).toBeVisible({ timeout: 15_000 });

  await signIn(page, organizerEmail, NEW_PASSWORD);
  await expect(page).not.toHaveURL(/\/auth\/signin/);
  await signOut(page);

  await signIn(page, OWNER_EMAIL, OWNER_PASSWORD);
  await createTenant(page, {
    type: "Department",
    name: "Journey Department",
    email: departmentEmail,
    access: "invite",
    institute: "Journey University",
  });
  await createTenant(page, {
    type: "Vendor",
    name: "Journey Vendor",
    email: vendorEmail,
    access: "invite",
  });

  await page.goto("/admin/plans");
  await page.getByRole("button", { name: "Create plan" }).click();
  await page.locator("#plan-create-name").fill("Social Lite");
  await page.locator("#plan-create-key").fill(`social_lite_${Date.now()}`);
  await page.locator("#plan-create-monthly").fill("0");
  await page.getByRole("button", { name: "Create plan" }).last().click();
  await expect(page.getByText("Social Lite").first()).toBeVisible();

  await page.goto("/admin/tenants");
  await page.getByRole("button", { name: "Manage" }).first().click();
  await page.getByRole("button", { name: "Change plan" }).click();
  await page.getByLabel("New plan").selectOption({ label: "Social Lite" });
  await page.getByRole("button", { name: "Preview" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.goto("/admin/settings/billing");
  await page.getByRole("button", { name: /Add bank|Edit bank/ }).click();
  await page.locator("#bank-bankName").fill("Journey Bank");
  await page.locator("#bank-accountTitle").fill("Avoeline Test");
  await page.locator("#bank-accountNumber").fill("000111222");
  await page.locator("#bank-iban").fill("PK00JOURNEY000111222");
  await page.getByRole("button", { name: "Save bank" }).click();
  await expect(page.getByText("Journey Bank")).toBeVisible();

  await page.goto("/admin/tenants");
  await page.getByRole("button", { name: "Manage" }).first().click();
  await page.getByRole("button", { name: "Grant / deny" }).click();
  await page.getByRole("button", { name: "Preview" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.getByRole("link", { name: "Approvals" }).click();
  const approve = page.getByRole("button", { name: "Approve" }).first();
  if (await approve.isVisible().catch(() => false)) {
    await approve.click();
  }

  await page.goto("/admin/events");
  await page.getByRole("button", { name: "Moderate" }).first().click();
  await page.getByText("Unpublish", { exact: true }).click();
  await page.getByPlaceholder(/At least 10 characters/).fill("Journey moderation hide");
  await page.getByRole("button", { name: "Confirm" }).click();

  await page.goto("/support");
  await page.locator("#ticket-subject").fill("Journey attachment");
  await page.locator("#ticket-body").fill("Please see the attached note.");
  await page.getByRole("button", { name: "Send to support" }).click();
  await page.getByRole("link", { name: "Journey attachment" }).click();
  await page
    .locator("input[name='attachment']")
    .setInputFiles(path.join(process.cwd(), "e2e/fixtures/journey-note.txt"));
  await page.getByLabel("Reply").fill("Note attached.");
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(page.getByText("Reply sent.")).toBeVisible();

  await signOut(page);
  await acceptInvite(page, departmentEmail, NEW_PASSWORD);
  await acceptInvite(page, vendorEmail, NEW_PASSWORD);

  writeJourneyState({
    organizerEmail,
    departmentEmail,
    vendorEmail,
    password: NEW_PASSWORD,
  });
});
