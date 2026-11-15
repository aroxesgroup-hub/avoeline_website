import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PAGE_PRESETS } from "../layout.types";
import { fitCenterPage } from "../fitCenter";

describe("fitCenterPage", () => {
  for (const [name, page] of Object.entries(PAGE_PRESETS)) {
    it(`centers ${name} without left-half bias`, () => {
      const viewportWidth = 800;
      const viewportHeight = 600;
      const padding = 16;
      const result = fitCenterPage({
        pageWidth: page.width,
        pageHeight: page.height,
        viewportWidth,
        viewportHeight,
        padding,
      });
      assert.ok(result.scale > 0);
      assert.ok(result.displayWidth <= viewportWidth - padding * 2 + 0.01);
      assert.ok(result.displayHeight <= viewportHeight - padding * 2 + 0.01);
      const availW = viewportWidth - padding * 2;
      const availH = viewportHeight - padding * 2;
      // Horizontal centering: leftover space split equally (±1px).
      const expectedX = padding + (availW - result.displayWidth) / 2;
      const expectedY = padding + (availH - result.displayHeight) / 2;
      assert.ok(Math.abs(result.offsetX - expectedX) < 0.5, `${name} offsetX`);
      assert.ok(Math.abs(result.offsetY - expectedY) < 0.5, `${name} offsetY`);
      // Not left-aligned (unless page already fills avail width).
      if (result.displayWidth < availW - 1) {
        assert.ok(result.offsetX > padding, `${name} should not stick left`);
      }
    });
  }
});
