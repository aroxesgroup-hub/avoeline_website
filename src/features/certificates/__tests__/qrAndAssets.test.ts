import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultLayout } from "../layout.types";
import { renderCertificate, renderCertificatePdf } from "../renderCertificate";

const data = {
  recipient_name: "Alex Rivera",
  role: "Attendee",
  event_title: "Sample Summit",
  event_dates: "12 Oct 2026",
  certificate_number: "CERT-QR01",
  verify_url: "https://example.com/verify/qr-test",
};

describe("QR + embedded assets", () => {
  it("SVG includes QR modules for verify URL", () => {
    const { svg } = renderCertificate(defaultLayout(), data);
    assert.match(svg, /<rect /);
    // Default layout has a qr element — fragment draws many dark cells.
    const darkCells = (svg.match(/fill="#111111"/g) || []).length;
    assert.ok(darkCells > 20, `expected QR cells, got ${darkCells}`);
  });

  it("SVG embeds data-URI image without network", () => {
    // 1x1 PNG
    const png =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const layout = defaultLayout();
    layout.elements.push({
      id: "logo",
      type: "image",
      x: 40,
      y: 40,
      w: 64,
      h: 64,
      z: 5,
      assetKey: "logo",
    });
    const { svg } = renderCertificate(layout, data, { logo: png });
    assert.match(svg, /href="data:image\/png;base64,/);
  });

  it("PDF renders with QR and embedded asset", async () => {
    const png =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
    const layout = defaultLayout();
    layout.elements.push({
      id: "logo",
      type: "image",
      x: 40,
      y: 40,
      w: 64,
      h: 64,
      z: 5,
      assetKey: "logo",
    });
    const bytes = await renderCertificatePdf(layout, data, { logo: png });
    assert.ok(bytes.byteLength > 500);
    assert.equal(String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!), "%PDF");
  });
});
