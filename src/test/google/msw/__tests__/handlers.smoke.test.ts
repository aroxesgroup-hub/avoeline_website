import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { startGoogleMockServer, stopGoogleMockServer } from "../server";

describe("Google MSW handlers smoke", () => {
  before(() => {
    startGoogleMockServer();
  });
  after(() => {
    stopGoogleMockServer();
  });

  it("mocks OAuth token", async () => {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: "grant_type=refresh_token",
    });
    assert.equal(res.status, 200);
    const json = (await res.json()) as { access_token?: string };
    assert.equal(json.access_token, "mock-access-token");
  });

  it("mocks Drive list", async () => {
    const res = await fetch("https://www.googleapis.com/drive/v3/files", {
      headers: { Authorization: "Bearer mock" },
    });
    assert.equal(res.status, 200);
    const json = (await res.json()) as { files: unknown[] };
    assert.ok(Array.isArray(json.files));
  });
});
