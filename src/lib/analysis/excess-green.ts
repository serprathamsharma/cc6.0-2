import sharp from "sharp";

export interface GreenCoverResult {
  greenPixels: number;
  totalPixels: number;
  greenCoverPercentage: number;
  meanExG: number;
}

/**
 * Compute the Excess Green Index (ExG = 2*G - R - B) on an image buffer or URL.
 * Pixels with positive ExG above a threshold are counted as green vegetation canopy.
 */
export async function calculateExcessGreen(
  input: Buffer | string
): Promise<GreenCoverResult> {
  let image = sharp(input);

  // Resize to a standard resolution (500x500) for fast, consistent comparison
  image = image.resize(500, 500, { fit: "cover" }).ensureAlpha();

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const totalPixels = info.width * info.height;
  const channels = info.channels; // 4 (RGBA)

  let greenPixels = 0;
  let exgSum = 0;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // ExG = 2*g - r - b
    const exg = 2 * g - r - b;
    exgSum += exg;

    // Threshold for healthy green vegetation canopy (in 0-255 scale, > 25 is standard)
    if (exg > 25 && g > r && g > b) {
      greenPixels++;
    }
  }

  const greenCoverPercentage = Number(
    ((greenPixels / totalPixels) * 100).toFixed(2)
  );
  const meanExG = Number((exgSum / totalPixels).toFixed(2));

  return {
    greenPixels,
    totalPixels,
    greenCoverPercentage,
    meanExG,
  };
}

/**
 * Compare two images to measure estimated green-cover change.
 */
export async function compareGreenCover(
  beforeInput: Buffer | string,
  afterInput: Buffer | string
): Promise<{
  beforePercentage: number;
  afterPercentage: number;
  percentagePointChange: number;
  relativeGrowthPercentage: number;
  isEstimate: true;
}> {
  const [before, after] = await Promise.all([
    calculateExcessGreen(beforeInput),
    calculateExcessGreen(afterInput),
  ]);

  const percentagePointChange = Number(
    (after.greenCoverPercentage - before.greenCoverPercentage).toFixed(2)
  );

  const relativeGrowth =
    before.greenCoverPercentage > 0
      ? ((after.greenCoverPercentage - before.greenCoverPercentage) /
          before.greenCoverPercentage) *
        100
      : after.greenCoverPercentage > 0
      ? 100
      : 0;

  return {
    beforePercentage: before.greenCoverPercentage,
    afterPercentage: after.greenCoverPercentage,
    percentagePointChange,
    relativeGrowthPercentage: Number(relativeGrowth.toFixed(2)),
    isEstimate: true,
  };
}
