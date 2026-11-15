import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import { rateLimit, __resetRateLimitForTests } from "@/src/lib/rateLimit";

describe("abuse — rate limits hold (S6)", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it("locks out after limit on access-code style key", () => {
    const key = `access-code:test-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      assert.equal(rateLimit(key, 5, 60).ok, true);
    }
    const blocked = rateLimit(key, 5, 60);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSec >= 1);
  });

  it("locks out login-style key independently", () => {
    const key = `login:user-${Date.now()}@example.test`;
    assert.equal(rateLimit(key, 3, 60).ok, true);
    assert.equal(rateLimit(key, 3, 60).ok, true);
    assert.equal(rateLimit(key, 3, 60).ok, true);
    assert.equal(rateLimit(key, 3, 60).ok, false);
  });
});
