import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { calculateExcessGreen, compareGreenCover } from "../excess-green";

describe("Excess Green Index (ExG) Analysis", () => {
  it("should detect high green coverage on a green image", async () => {
    // Create a 100x100 solid green image
    const greenImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 30, g: 180, b: 40 },
      },
    })
      .png()
      .toBuffer();

    const result = await calculateExcessGreen(greenImage);
    expect(result.greenCoverPercentage).toBeGreaterThan(95);
    expect(result.meanExG).toBeGreaterThan(50);
  });

  it("should detect low green coverage on an asphalt/dirt image", async () => {
    // Create a 100x100 brownish-grey dirt image
    const dirtImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 120, g: 90, b: 60 },
      },
    })
      .png()
      .toBuffer();

    const result = await calculateExcessGreen(dirtImage);
    expect(result.greenCoverPercentage).toBe(0);
    expect(result.meanExG).toBeLessThanOrEqual(0);
  });

  it("should quantify change between before (dirt) and after (green vegetation)", async () => {
    const beforeImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 140, g: 110, b: 70 },
      },
    })
      .png()
      .toBuffer();

    const afterImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 30, g: 190, b: 45 },
      },
    })
      .png()
      .toBuffer();

    const comparison = await compareGreenCover(beforeImage, afterImage);
    expect(comparison.isEstimate).toBe(true);
    expect(comparison.beforePercentage).toBe(0);
    expect(comparison.afterPercentage).toBeGreaterThan(95);
    expect(comparison.percentagePointChange).toBeGreaterThan(90);
  });
});
