/* ============================================================================
 * dashboard_chart_api.js — OPTION A
 * ========================================================================== */

console.log("✅ dashboard_chart_api.js loaded (Option A)");

const API_BASE =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

async function refreshPage(view = window.__ACTIVE_VIEW__) {
  console.log("🔄 refreshPage()", view);

  // ❌ DO NOT CALL API FOR PERFORMANCE
  if (view === "performance-overview") return;

  const payload = getStoredDateRange();
  const charts = getChartsForPage(view);

  for (const chartName of charts) {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chartName,
        ...payload,
      }),
    });

    const json = await res.json();
    if (window.renderChartFromAPI) {
      window.renderChartFromAPI(chartName, json);
    }
  }
}

window.refreshPage = refreshPage;

/* ---------- CHANNEL PAGE ONLY ---------- */
function getChartsForPage(page) {
  if (page !== "channel-campaign-analytics") return [];
  return [
    "channel_cpl_cac_roas",
    "campaign_roi_bubble",
    "channel_touchpoint_split",
    "audience_roas",
    "channel_lead_quality",
    "channel_spend_efficiency",
    "channel_snapshot_table",
  ];
}
