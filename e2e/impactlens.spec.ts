import { test, expect } from "@playwright/test";

test.describe("ImpactLens End-to-End User Flow", () => {
  test("Dashboard loads with impact KPIs, active projects, and MapLibre map", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/ImpactLens/i);

    // Verify KPI cards render
    await expect(page.getByText("Total Evidence Assets")).toBeVisible();
    await expect(page.getByText("Verified Ground Truth")).toBeVisible();
    await expect(page.getByText("Active Geographic Intervention Zones")).toBeVisible();

    // Verify map canvas is mounted
    await expect(page.locator(".maplibregl-canvas")).toBeVisible({ timeout: 10000 });
  });

  test("Evidence Library displays assets, filters, and opens Provenance Drawer with SHA-256", async ({
    page,
  }) => {
    await page.goto("/dashboard/library");

    // Verify title and evidence count
    await expect(page.getByText("Evidence Library")).toBeVisible();

    // Verify asset cards render
    const firstAssetCard = page.locator(".group.rounded-2xl").first();
    await expect(firstAssetCard).toBeVisible();

    // Click on the first asset card to open Provenance Drawer
    await firstAssetCard.click();

    // Verify Provenance Drawer opened
    await expect(page.getByText("Evidence Provenance")).toBeVisible();
    await expect(page.getByText("Original SHA-256 Fingerprint")).toBeVisible();
    await expect(page.getByText("Capture Telemetry")).toBeVisible();

    // Toggle Responsible AI Face Blur
    const faceBlurBtn = page.getByRole("button", { name: /Face Blur/i });
    await expect(faceBlurBtn).toBeVisible();
    await faceBlurBtn.click();
    await expect(page.getByText("Face Blurred")).toBeVisible();
  });

  test("Semantic Search performs hybrid discovery and returns ranked matches", async ({
    page,
  }) => {
    await page.goto("/dashboard/search");
    await expect(page.getByText("Semantic Discovery")).toBeVisible();

    // Click on a suggestion query chip
    const suggestionBtn = page.getByRole("button", {
      name: /lake cleanup volunteers with plastic waste/i,
    });
    await expect(suggestionBtn).toBeVisible();
    await suggestionBtn.click();

    // Verify search results display
    await expect(page.getByText(/showing.*ranked matches/i)).toBeVisible({ timeout: 5000 });
  });

  test("Before/After Engine renders slider, metrics, and limitations", async ({
    page,
  }) => {
    await page.goto("/dashboard/compare");
    await expect(page.getByText("Before / After Change Engine")).toBeVisible();

    // Verify comparison controls
    await expect(page.getByRole("button", { name: /Interactive Slider/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Side-by-Side/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Fade Blend/i })).toBeVisible();

    // Verify Excess Green Index metric
    await expect(page.getByText("Excess Green Index (ExG) Canopy Cover")).toBeVisible();
    await expect(page.getByText("+38.4 percentage points")).toBeVisible();

    // Verify honest limitations disclosure
    await expect(page.getByText("Transparent Limitations & Disclosures")).toBeVisible();
  });

  test("Evidence Ledger verifies intact hash chain and simulates tamper detection", async ({
    page,
  }) => {
    await page.goto("/dashboard/verify");
    await expect(page.getByText("Evidence Ledger & Verification")).toBeVisible();

    // Verify initial chain is intact
    await expect(page.getByText("Chain Intact")).toBeVisible();

    // Click Simulate Tamper
    const tamperBtn = page.getByRole("button", { name: /Simulate Tamper/i });
    await tamperBtn.click();

    // Verify tampering was caught immediately
    await expect(page.getByText(/CHAIN BROKEN/i)).toBeVisible();
    await expect(page.getByText(/Tampering Detected/i)).toBeVisible();

    // Restore chain
    const restoreBtn = page.getByRole("button", { name: /Restore Intact Chain/i });
    await restoreBtn.click();
    await expect(page.getByText("Chain Intact")).toBeVisible();
  });

  test("Report Builder displays claims with mandatory citations and exports Evidence Pack", async ({
    page,
  }) => {
    await page.goto("/dashboard/reports");
    await expect(page.getByText("Verifiable Reports & Evidence Packs")).toBeVisible();

    // Verify mandatory evidence citations are present
    const citationBtn = page.locator("button:has-text('[Evidence #')").first();
    await expect(citationBtn).toBeVisible();

    // Verify download evidence pack button is enabled
    await expect(
      page.getByRole("button", { name: /Download Evidence Pack/i })
    ).toBeVisible();
  });

  test("Campaign Studio renders bilingual English/Hindi copy and smart crop", async ({
    page,
  }) => {
    await page.goto("/dashboard/campaigns");
    await expect(page.getByText("Story & Campaign Studio")).toBeVisible();

    // Switch to Hindi
    const hindiBtn = page.getByRole("button", { name: /हिन्दी/i }).first();
    await expect(hindiBtn).toBeVisible();
    await hindiBtn.click();

    // Verify Hindi text rendered
    await expect(page.getByText(/सच्चे पर्यावरणीय सुधार/i)).toBeVisible();
  });
});
