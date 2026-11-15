import { expect, test } from "@playwright/test";
import { assertMailHasNoSecrets, waitForMail } from "../helpers/mailpit";
import {
  NEW_PASSWORD,
  acceptInvite,
  publishFirstEvent,
  signIn,
  signOut,
  uniqueEmail,
} from "../helpers/journey";
import { readJourneyState, writeJourneyState } from "./state";

test("J2 department club, tenure, announcement, analytics, and read-only events", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const state = readJourneyState();
  expect(state.departmentEmail, "run J1 first").toBeTruthy();
  const presidentEmail = uniqueEmail("j2.pres");
  const clubName = `Journey Club ${Date.now()}`;
  const eventTitle = `Journey Club Night ${Date.now()}`;

  await signIn(page, state.departmentEmail!, state.password || NEW_PASSWORD);
  await page.goto("/department/clubs");
  await page.getByRole("button", { name: "Add club + President" }).click();
  await page.locator("#club-name").fill(clubName);
  await page.locator("#pres-name").fill("Journey President");
  await page.locator("#pres-email").fill(presidentEmail);
  await page.getByLabel("Teams").check();
  await page.getByLabel("Advanced team roles").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Create and send invite" }).click();
  await expect(page.getByRole("heading", { name: clubName })).toBeVisible();

  const invite = await waitForMail({ to: presidentEmail });
  assertMailHasNoSecrets(invite);
  expect(invite.HTML + invite.Text).toMatch(/https?:\/\//);

  await page.getByRole("button", { name: "Add tenure" }).click();
  await page.locator("#tenure-label").fill("2026-2027");
  await page.locator("#tenure-start").fill("2026-01-01");
  await page.locator("#tenure-end").fill("2026-12-31");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Start tenure" }).click();
  await expect(page.getByText("2026-2027").first()).toBeVisible();

  await page.goto("/department/announcements");
  const title = `Journey note ${Date.now()}`;
  await page.locator("#ann-title").fill(title);
  await page.locator("#ann-body").fill("Club presidents should see this in the app and in mail.");
  await page.getByLabel("Email (Resend)").check();
  await page.getByRole("button", { name: "Send announcement" }).click();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  const mail = await waitForMail({ to: presidentEmail, subjectIncludes: title });
  expect(mail.To.some((to) => to.Address === presidentEmail)).toBeTruthy();

  await page.goto("/department/analytics");
  await expect(page.getByText("All tenures")).toBeVisible();

  await signOut(page);
  await acceptInvite(page, presidentEmail, NEW_PASSWORD);
  await signIn(page, presidentEmail, NEW_PASSWORD);
  await publishFirstEvent(page, eventTitle);
  await signOut(page);

  await signIn(page, state.departmentEmail!, state.password || NEW_PASSWORD);
  await page.goto("/department/clubs");
  await page.getByRole("link", { name: new RegExp(clubName) }).click();
  await page.getByRole("link", { name: "Events" }).click();
  await expect(page.getByRole("link", { name: eventTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: /Create event|Edit/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Edit|Publish/ })).toHaveCount(0);

  writeJourneyState({ presidentEmail, clubName, eventTitle });
});
