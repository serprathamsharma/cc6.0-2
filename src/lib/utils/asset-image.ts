/**
 * Robust image URL resolver for evidence assets.
 * Delivers custom local high-resolution documentary photographs with zero network dependency.
 */

export const LOCAL_DEMO_IMAGES = [
  "/demo-assets/reforest_before.jpg",
  "/demo-assets/reforest_after.jpg",
  "/demo-assets/lake_before.jpg",
  "/demo-assets/lake_after.jpg",
  "/demo-assets/solar_before.jpg",
  "/demo-assets/solar_after.jpg",
  "/demo-assets/mangrove.jpg",
  "/demo-assets/nursery.jpg",
];

export interface AssetLike {
  id?: string;
  cloudinaryPublicId?: string | null;
  cloudinaryMetadata?: Record<string, unknown> | null;
  beforeAfterRole?: string | null;
  activityTypes?: string[] | null;
  caption?: string | null;
}

export function getAssetImageUrl(asset: AssetLike | null | undefined, width = 800): string {
  if (!asset) return LOCAL_DEMO_IMAGES[0];

  // If real custom Cloudinary cloud name is explicitly set (not 'demo')
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (
    cloudName &&
    cloudName !== "demo" &&
    asset.cloudinaryPublicId &&
    !asset.cloudinaryPublicId.startsWith("impactlens/demo/")
  ) {
    return `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},c_fill,q_auto,f_auto/${asset.cloudinaryPublicId}`;
  }

  // Select contextually based on caption / project / role
  const text = (asset.caption || "").toLowerCase();
  const isBefore = asset.beforeAfterRole === "before";
  const isAfter = asset.beforeAfterRole === "after";

  if (text.includes("lake") || text.includes("wetland") || text.includes("water clean") || text.includes("plastic")) {
    return isBefore ? "/demo-assets/lake_before.jpg" : "/demo-assets/lake_after.jpg";
  }

  if (text.includes("solar") || text.includes("drinking water") || text.includes("barmer") || text.includes("filtration")) {
    return isBefore ? "/demo-assets/solar_before.jpg" : "/demo-assets/solar_after.jpg";
  }

  if (text.includes("mangrove") || text.includes("coastal") || text.includes("mudflat")) {
    return "/demo-assets/mangrove.jpg";
  }

  if (text.includes("nursery") || text.includes("sapling") || text.includes("cultivating")) {
    return "/demo-assets/nursery.jpg";
  }

  if (isBefore) {
    return "/demo-assets/reforest_before.jpg";
  }
  if (isAfter) {
    return "/demo-assets/reforest_after.jpg";
  }

  // Deterministic stable hash to one of our 8 custom local images
  if (asset.id) {
    let sum = 0;
    for (let i = 0; i < asset.id.length; i++) {
      sum = (sum * 31 + asset.id.charCodeAt(i)) >>> 0;
    }
    return LOCAL_DEMO_IMAGES[sum % LOCAL_DEMO_IMAGES.length];
  }

  return LOCAL_DEMO_IMAGES[0];
}
