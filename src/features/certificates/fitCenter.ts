/** Scale a certificate page into a viewport and center the leftover space. */
export function fitCenterPage(input: {
  pageWidth: number;
  pageHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  padding: number;
}): {
  scale: number;
  displayWidth: number;
  displayHeight: number;
  offsetX: number;
  offsetY: number;
} {
  const availW = Math.max(0, input.viewportWidth - input.padding * 2);
  const availH = Math.max(0, input.viewportHeight - input.padding * 2);
  const scale =
    input.pageWidth > 0 && input.pageHeight > 0
      ? Math.min(availW / input.pageWidth, availH / input.pageHeight)
      : 1;
  const displayWidth = input.pageWidth * scale;
  const displayHeight = input.pageHeight * scale;
  return {
    scale,
    displayWidth,
    displayHeight,
    offsetX: input.padding + (availW - displayWidth) / 2,
    offsetY: input.padding + (availH - displayHeight) / 2,
  };
}
