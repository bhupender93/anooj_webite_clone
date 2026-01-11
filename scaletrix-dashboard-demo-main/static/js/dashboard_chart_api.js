/* ============================================================================
 * dashboard_chart_api.js — HYBRID MODE (STATIC PERF + API CHANNEL)
 * UPDATED: 2026-01-09
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js loaded (HYBRID MODE)",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * CONFIG
 * ------------------------------------------------------------------------- */
const SCALEX_API_BASE =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

/* ---------------------------------------------------------------------------
 * STATIC DEMO DATA — PERFORMANCE OVERVIEW ONLY
 * ------------------------------------------------------------------------- */
function injectPerformanceDemoData() {
  console.log(
    "%c[ScaleX] Injecting Performance Overview demo data",
    "color:#38bdf8"
  );

  /* ===== KPI CARDS ===== */
  updateKpiCards(
    {
      currentValue: 1280000,
      previousValue: 1040000,
      deltaPercent: 23.1,
      sparkline: [82000, 86000, 91000, 98000, 104000, 112000, 128000]
    },
    "rev-current",
    "rev-prev",
    "rev-change",
    "rev-chart",
    "revenue"
  );

  updateKpiCards(
    {
      currentValue: 420000,
      previousValue: 395000,
      deltaPercent: 6.3,
      sparkline: [31000, 32000, 34000, 36000, 38000, 40000, 42000]
    },
    "spend-current",
    "spend-prev",
    "spend-change",
    "spend-chart",
    "spend"
  );

  updateKpiCards(
    {
      currentValue: 3.05,
      previousValue: 2.7,
      deltaPercent: 13.0,
      sparkline: [2.2, 2.4, 2.6, 2.8, 2.9, 3.0, 3.05]
    },
    "roas-current",
    "roas-prev",
    "roas-change",
    "roas-chart",
    "roas"
  );

  updateKpiCards(
    {
      currentValue: 205,
      previousValue: 170,
      deltaPercent: 20.6,
      sparkline: [150, 158, 165, 175, 185, 195, 205]
    },
    "roi-current",
    "roi-prev",
    "roi-change",
    "roi-chart",
    "roi"
  );

  /* ===== DETAIL CHARTS ===== */

  updatePerfFunnelFromAPI({
    labels: ["Spend", "Revenue", "ROI", "ROAS"],
    datasets: [
      { label: "Meta", data: [450000, 1350000, 2.0, 3.0] },
      { label: "Google", data: [600000, 2200000, 2.7, 3.7] },
      { label: "LinkedIn", data: [300000, 900000, 2.0, 3.0] }
    ]
  });

  updateBlendedPaidCACFromAPI({
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      { label: "Blended CAC", data: [7200, 7000, 6900, 6700, 6500, 6300] },
      { label: "Paid CAC", data: [8200, 8100, 7900, 7700, 7600, 7400] }
    ]
  });

  updateCacTrendByChannelFromAPI({
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [
      { label: "Meta CAC", data: [6800, 6600, 6400, 6300, 6200, 6100] },
      { label: "Google CAC", data: [7200, 7000, 6900, 6800, 6700, 6600] },
      { label: "LinkedIn CAC", data: [9500, 9300, 9100, 9000, 8900, 8800] }
    ]
  });

  updatePipelineValueFromAPI({
    labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
    datasets: [{ data: [3200000, 3600000, 4100000, 4700000, 5200000, 6100000] }]
  });

  updateLtvCacRatioFromAPI({
    ltv: 180000,
    cac: 52000,
    ratio: 3.5,
    status: "healthy"
  });

  updateTopChannelsRoasFromAPI({
    labels: ["Affiliate", "Google Search", "Meta", "Display", "LinkedIn"],
    datasets: [{ data: [4.6, 3.8, 3.1, 2.4, 2.1] }]
  });
}

/* ---------------------------------------------------------------------------
 * API HELPERS
 * ------------------------------------------------------------------------- */
async function fetchChartData(chartName) {
  try {
    const res = await fetch(SCALEX_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chartName })
    });
    return await res.json();
  } catch (e) {
    console.error("[ScaleX] API error", e);
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * PAGE REFRESH
 * ------------------------------------------------------------------------- */
async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  console.log(
    "%c[ScaleX] refreshPage → " + CURRENT_PAGE,
    "color:#facc15"
  );

  /* PERFORMANCE OVERVIEW → STATIC */
  if (CURRENT_PAGE === "performance-overview") {
    injectPerformanceDemoData();
    return;
  }

  /* CHANNEL & CAMPAIGN → API */
  const charts = [
    "channel_cpl_cac_roas",
    "campaign_roi_bubble",
    "channel_touchpoint_split",
    "audience_roas",
    "channel_lead_quality",
    "channel_spend_efficiency",
    "creative_perf_tiles",
    "channel_snapshot_table"
  ];

  for (const chartName of charts) {
    const response = await fetchChartData(chartName);
    if (window.renderChartFromAPI && response) {
      window.renderChartFromAPI(chartName, response);
    }
  }
}

window.refreshPage = refreshPage;

/* ---------------------------------------------------------------------------
 * INITIAL LOAD
 * ------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  refreshPage(CURRENT_PAGE);
});
