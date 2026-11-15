import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rankTeamMembersForCertificates, winnerRegistrationIds } from "../recipientPresets";

describe("rankTeamMembersForCertificates", () => {
  it("ranks by score and expands each member", () => {
    const ranked = rankTeamMembersForCertificates([
      {
        id: "t1",
        name: "Alpha",
        trackName: "Main",
        scores: { j1: { r1: { total: 10 } } },
        memberRegistrationIds: ["r1", "r2"],
      },
      {
        id: "t2",
        name: "Beta",
        trackName: "Main",
        scores: { j1: { r1: { total: 30 } } },
        members: [{ registrationId: "r3" }],
      },
    ]);
    assert.equal(ranked[0]?.registrationId, "r3");
    assert.equal(ranked[0]?.rank, 1);
    assert.equal(ranked[0]?.teamName, "Beta");
    assert.equal(ranked.filter((x) => x.rank === 2).length, 2);
    assert.deepEqual(winnerRegistrationIds(ranked, 1), ["r3"]);
  });
});
