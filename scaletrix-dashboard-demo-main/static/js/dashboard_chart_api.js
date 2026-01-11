/* ============================================================================
 * dashboard_chart_api.js — STEP-BY-STEP DEBUG VERSION
 * ========================================================================== */

console.log("✅ dashboard_chart_api.js LOADED");

/* ---------------------------------------------------------------------------
 * GLOBAL STORE (DEFINED IMMEDIATELY)
 * ------------------------------------------------------------------------ */
window.__SCALEX_DATA__ = {};

/* ---------------------------------------------------------------------------
 * CONFIG
 * ------------------------------------------------------------------------ */
const SCALEX_API =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

/* ---------------------------------------------------------------------------
 * PAYLOAD BUILDER
 * ------------------------------------------------------------------------ */
function buildPayload(chartName) {
  const stored = sessionStorage.getItem("dateRange");
  const parsed = stored ? JSON.parse(stored) : {};

  return {
    chartName,
    dateRange: parsed.dateRange || null,
    comparison: false,
  };
}

/* ---------------------------------------------------------------------------
 * FETCH + STORE
 * ------------------------------------------------------------------------ */
async function fetchAndStore(chartName, key) {
  console.log("📡 fetching:", chartName);

  const res = await fetch(SCALEX_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload(chartName)),
  });

  const json = await res.json();
  window.__SCALEX_DATA__[key] = json.data;

  console.log("✅ stored:", key);
}

/* ---------------------------------------------------------------------------
 * PUBLIC ENTRY POINT (WHAT layout.js EXPECTS)
 * ------------------------------------------------------------------------ */
window.refreshPage = async function (pageKey) {
  console.log("🔁 refreshPage called:", pageKey);

  if (pageKey === "performance-overview") {
    if (typeof window.renderPerformanceOverviewDetails === "function") {
      window.renderPerformanceOverviewDetails();
    }
    return;
  }

  if (pageKey === "channel-campaign-analytics") {
    await Promise.all([
      fetchAndStore("channel_cpl_cac_roas", "cpl"),
      fetchAndStore("campaign_roi_bubble", "roi"),
      fetchAndStore("channel_touchpoint_split", "touchpoint"),
      fetchAndStore("audience_roas", "audience"),
      fetchAndStore("channel_lead_quality", "quality"),
      fetchAndStore("channel_spend_efficiency", "efficiency"),
      fetchAndStore("channel_snapshot_table", "snapshot"),
    ]);

    if (typeof window.renderChannelCampaignDetails === "function") {
      window.renderChannelCampaignDetails();
    }
  }
};

console.log("✅ refreshPage REGISTERED");
