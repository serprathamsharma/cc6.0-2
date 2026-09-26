import { db } from "../src/lib/db";
import {
  organizations,
  users,
  projects,
  sites,
  assets,
  assetAnalysis,
  assetEmbeddings,
  pairs,
  comparisons,
  ledgerEntries,
} from "../src/lib/db/schema";
import { createLedgerEntry, GENESIS_HASH } from "../src/lib/ledger/hash-chain";
import { runMigrations } from "./migrate";
import { createHash } from "crypto";

// Openly licensed image fixtures (Wikimedia Commons & Unsplash)
const PHOTO_FIXTURES = [
  // Maharashtra Reforestation
  {
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09",
    caption: "Native sapling plantation drive along hillside contour bunds in Sahyadri, Satara",
    project: "Maharashtra Reforestation",
    activity: "planting",
    lat: 17.6805,
    lng: 73.9904,
    device: "Canon EOS R5 / 24-70mm f/2.8",
    author: "Unsplash Contributor",
    license: "Unsplash Free License",
  },
  {
    url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86",
    caption: "Matured native tree canopy and ground vegetation 14 months post-planting",
    project: "Maharashtra Reforestation",
    activity: "restoration",
    lat: 17.6808,
    lng: 73.9907,
    device: "Canon EOS R5 / 24-70mm f/2.8",
    author: "Unsplash Contributor",
    license: "Unsplash Free License",
  },
  {
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9",
    caption: "Community nursery cultivating native Mahua and Teak saplings",
    project: "Maharashtra Reforestation",
    activity: "planting",
    lat: 17.6792,
    lng: 73.9881,
    device: "Sony Alpha 7 IV",
    author: "Unsplash Contributor",
    license: "Unsplash Free License",
  },
  // Bellandur Wetland Cleanup
  {
    url: "https://images.unsplash.com/photo-1621451537084-482c73073a0f",
    caption: "Accumulated solid waste and plastic debris choking south feeder inlet before intervention",
    project: "Bellandur Wetland Cleanup",
    activity: "cleanup",
    lat: 12.9352,
    lng: 77.6675,
    device: "Nikon Z6 II",
    author: "Wikimedia Commons Contributor",
    license: "CC-BY-SA 4.0",
  },
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    caption: "Cleared water body surface following waste extraction and perimeter barrier deployment",
    project: "Bellandur Wetland Cleanup",
    activity: "cleanup",
    lat: 12.9355,
    lng: 77.6678,
    device: "Nikon Z6 II",
    author: "Wikimedia Commons Contributor",
    license: "CC-BY-SA 4.0",
  },
  // Rajasthan Water Access
  {
    url: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8",
    caption: "Solar-powered community reverse-osmosis filtration plant civil foundation, Barmer",
    project: "Rural Water Access",
    activity: "water_access",
    lat: 25.7532,
    lng: 71.3967,
    device: "DJI Mavic 3 Enterprise",
    author: "Unsplash Contributor",
    license: "Unsplash Free License",
  },
  {
    url: "https://images.unsplash.com/photo-1574482620826-40685ca5ebd2",
    caption: "Commissioned solar pump and 10,000L clean drinking water distribution point",
    project: "Rural Water Access",
    activity: "water_access",
    lat: 25.7534,
    lng: 71.3969,
    device: "DJI Mavic 3 Enterprise",
    author: "Unsplash Contributor",
    license: "Unsplash Free License",
  },
];

async function seed() {
  console.log("🌱 Starting ImpactLens seed process...");
  await runMigrations();

  // 1. Organization
  console.log("Creating demo organization...");
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Sahyadri & Rural Habitat Foundation",
      slug: "sahyadri-habitat",
      settings: { verifiedBadge: true, strictAudit: true },
    })
    .returning();

  // 2. Admin User
  console.log("Creating demo reviewer & field officer...");
  const [user] = await db
    .insert(users)
    .values({
      orgId: org.id,
      name: "Priya Sharma",
      email: "priya.sharma@impactlens.org",
      role: "admin",
    })
    .returning();

  // 3. Projects
  console.log("Creating 3 impact projects...");
  const [proj1] = await db
    .insert(projects)
    .values({
      orgId: org.id,
      name: "Maharashtra Western Ghats Afforestation",
      slug: "mh-reforestation",
      description: "Restoring degraded watershed slopes with native species in Satara district.",
      sdgTargets: ["SDG 15.3", "SDG 13.1"],
      status: "active",
    })
    .returning();

  const [proj2] = await db
    .insert(projects)
    .values({
      orgId: org.id,
      name: "Bellandur Wetland Remediation",
      slug: "bellandur-wetland",
      description: "Community cleanup, floating boom trash traps, and shoreline aeration.",
      sdgTargets: ["SDG 6.6", "SDG 11.6"],
      status: "active",
    })
    .returning();

  const [proj3] = await db
    .insert(projects)
    .values({
      orgId: org.id,
      name: "Thar Rural Solar Drinking Water Initiative",
      slug: "thar-drinking-water",
      description: "Solar-powered deep borewell filtration for drought-resilient communities in Barmer.",
      sdgTargets: ["SDG 6.1", "SDG 7.2"],
      status: "active",
    })
    .returning();

  const projectMap: Record<string, string> = {
    "Maharashtra Reforestation": proj1.id,
    "Bellandur Wetland Cleanup": proj2.id,
    "Rural Water Access": proj3.id,
  };

  // 4. Sites
  console.log("Creating project sites...");
  const [site1] = await db
    .insert(sites)
    .values({
      projectId: proj1.id,
      name: "Satara Watershed Parcel 4",
      lat: 17.6805,
      lng: 73.9904,
      boundaryGeojson: {},
    })
    .returning();

  const [site2] = await db
    .insert(sites)
    .values({
      projectId: proj2.id,
      name: "Bellandur South Feeder Inlet",
      lat: 12.9352,
      lng: 77.6675,
      boundaryGeojson: {},
    })
    .returning();

  const [site3] = await db
    .insert(sites)
    .values({
      projectId: proj3.id,
      name: "Barmer Community Station 1",
      lat: 25.7532,
      lng: 71.3967,
      boundaryGeojson: {},
    })
    .returning();

  const siteMap: Record<string, string> = {
    "Maharashtra Reforestation": site1.id,
    "Bellandur Wetland Cleanup": site2.id,
    "Rural Water Access": site3.id,
  };

  // 5. Seed 64 Assets with full EXIF, SHA-256, and Chained Ledger Entries
  console.log("Seeding 64 realistic field evidence assets with cryptographic ledger chains...");
  let prevHash: string | null = null;
  const createdAssets: any[] = [];

  for (let i = 0; i < 64; i++) {
    const fixture = PHOTO_FIXTURES[i % PHOTO_FIXTURES.length];
    const isAfter = i % 2 === 1;
    const daysOffset = (i * 5) % 400;
    const date = new Date(Date.now() - (400 - daysOffset) * 24 * 60 * 60 * 1000);

    const syntheticSha256 = createHash("sha256")
      .update(`evidence-payload-asset-${i}-${fixture.url}`)
      .digest("hex");

    const [newAsset] = await db
      .insert(assets)
      .values({
        cloudinaryAssetId: `cld-asset-${i}`,
        cloudinaryPublicId: `impactlens/demo/asset_${i}`,
        cloudinaryVersion: 1,
        resourceType: "image",
        format: "jpg",
        projectId: projectMap[fixture.project],
        siteId: siteMap[fixture.project],
        originalSha256: syntheticSha256,
        gpsLat: fixture.lat + (Math.random() - 0.5) * 0.005,
        gpsLng: fixture.lng + (Math.random() - 0.5) * 0.005,
        capturedAt: date,
        deviceInfo: fixture.device,
        verificationStatus: i < 58 ? "verified" : "pending",
        beforeAfterRole: isAfter ? "after" : "before",
        consentObtained: true,
        isDemo: true,
        cloudinaryMetadata: {
          author: fixture.author,
          license: fixture.license,
          sourceUrl: fixture.url,
        },
      })
      .returning();

    createdAssets.push(newAsset);

    // AI Analysis record
    await db.insert(assetAnalysis).values({
      assetId: newAsset.id,
      caption: `${fixture.caption} (#${i + 1})`,
      activityTypes: [fixture.activity],
      visualSignals: {
        vegetation: isAfter ? "high" : "low",
        structures: fixture.activity === "water_access" ? ["solar_panel", "tank"] : [],
      },
      sdgMapping: { primary: fixture.activity === "planting" ? "SDG 15" : "SDG 6" },
      observations: [
        `Direct visual evidence of ${fixture.activity} activity at designated coordinates`,
        `Terrain stability and vegetative state documented under daylight lighting`,
      ],
      interpretations: [
        `Consistent with verified progress milestones for ${fixture.project}`,
      ],
      modelId: "gpt-6-sol",
      promptVersion: "1.0.0",
    });

    // Hash-chained ledger entry
    const entryData = {
      assetId: newAsset.id,
      entryType: "upload" as const,
      cloudinaryPublicId: newAsset.cloudinaryPublicId!,
      originalSha256: syntheticSha256,
      actor: user.email,
      entryData: {
        caption: fixture.caption,
        license: fixture.license,
      },
      generatedAt: date,
    };

    const { entryHash, previousHash } = createLedgerEntry(prevHash, entryData);
    prevHash = entryHash;

    await db.insert(ledgerEntries).values({
      ...entryData,
      entryHash,
      previousHash,
    });
  }

  // 6. Create 6 Before/After Pairs with Comparisons
  console.log("Creating 6 before/after comparison pairs with Excess Green Index metrics...");
  for (let p = 0; p < 6; p++) {
    const beforeAsset = createdAssets[p * 2];
    const afterAsset = createdAssets[p * 2 + 1];

    const [pair] = await db
      .insert(pairs)
      .values({
        beforeAssetId: beforeAsset.id,
        afterAssetId: afterAsset.id,
        siteId: beforeAsset.siteId,
        timeDeltaDays: 180 + p * 30,
        viewpointSimilarity: 0.92,
        confidence: 0.94,
        status: "confirmed",
      })
      .returning();

    await db.insert(comparisons).values({
      pairId: pair.id,
      changeCategory: "vegetation_growth",
      observedChanges: [
        {
          description: "Substantial vegetative canopy expansion across formerly exposed ground",
          area: "center and contour bunds",
        },
      ],
      quantification: {
        metric: "Excess Green Index (ExG) Canopy Cover",
        beforeValue: "12.3%",
        afterValue: "51.8%",
        change: "+39.5 pp",
        isEstimate: true,
      },
      confidence: 0.93,
      limitations: [
        "Slight azimuth angle shift between baseline and follow-up survey",
        "Seasonal lighting variations accounted for in calculation",
      ],
      modelId: "gpt-6-astra",
      promptVersion: "1.0.0",
    });
  }

  console.log("✅ Seed completed successfully! 64 assets, 3 projects, 6 confirmed pairs, and intact ledger chain created.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
