/* ============================================================================
 * dashboard_chart_api.js
 *
 * API integration layer for chart data fetching and caching
 *
 * UPDATED: 2026-01-12
 *
 * PERFORMANCE OVERVIEW  → website-test (static/sample API)
 * CHANNEL ANALYTICS     → scalex-adapter (real adaptor API)
 *
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js LOADED (dual API routing enabled)",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * SECTION 1: API CONFIGURATION & CONSTANTS
 * ---------------------------------------------------------------------------*/

// 🔹 Performance Overview (static/sample)
const SCALEX_API_BASE_PERF =
  "https://website-test-268453003438.europe-west1.run.app/api/v1/chart";

// 🔹 Channel & Campaign Analytics (real adaptor)
const SCALEX_API_BASE_CHANNEL =
  "https://scalex-adapter-268453003438.europe-west1.run.app/api/v1/chart";

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

/**
 * Resolve correct API base based on active page
 */
function getApiBaseForPage(page) {
  if (page === "channel-campaign-analytics") {
    return SCALEX_API_BASE_CHANNEL;
  }
  return SCALEX_API_BASE_PERF; // default → performance overview
}

/* ---------------------------------------------------------------------------
 * SECTION 2: FILTER MANAGEMENT
 * ---------------------------------------------------------------------------*/

function getStoredFilters() {
  let stored = sessionStorage.getItem("dateRange");
  let parsed = stored ? JSON.parse(stored) : null;

  return {
    dateRange: parsed?.dateRange || null,
    comparison: parsed?.comparison || false,
    timestamp: parsed?.timestamp || new Date().toISOString(),
    devices: sessionStorage.getItem("filter_devices") || null,
    channels: sessionStorage.getItem("filter_channels") || null,
    locations: sessionStorage.getItem("filter_locations") || null
  };
}

/* ---------------------------------------------------------------------------
 * SECTION 3: API PAYLOAD CONSTRUCTION
 * ---------------------------------------------------------------------------*/

function buildPayload() {
  const f = getStoredFilters();

  return {
    dateRange: f.dateRange,
    comparison: f.comparison,
    filters: {
      devices: f.devices,
      channels: f.channels,
      locations: f.locations
    },
    timestamp: f.timestamp
  };
}

/* ---------------------------------------------------------------------------
 * SECTION 4: API REQUEST & RESPONSE HANDLING
 * ---------------------------------------------------------------------------*/

async function fetchChartData(chartId) {
  const payload = buildPayload();
  const apiBase = getApiBaseForPage(CURRENT_PAGE);

  try {
    const res = await fetch(`${apiBase}/${chartId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let json;
    try {
      json = await res.json();
    } catch (e) {
      console.error(`API JSON parse error (${chartId}):`, e);
      return { success: false, error: "Invalid JSON from server" };
    }

    if (!res.ok) {
      console.error(`API HTTP error (${chartId}):`, res.status, json);
      return { success: false, error: json || res.statusText };
    }

    return json;
  } catch (err) {
    console.error(`API Error (${chartId}):`, err);
    return { success: false, error: err?.message || String(err) };
  }
}

/* ---------------------------------------------------------------------------
 * SECTION 5: PAGE REFRESH
 * ---------------------------------------------------------------------------*/

window.showLoader = function () {
  const el = document.getElementById("loader");
  if (el) el.classList.remove("hidden");
};

window.hideLoader = function () {
  const el = document.getElementById("loader");
  if (el) el.classList.add("hidden");
};

async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  if (window.showLoader) window.showLoader();

  try {
    const chartList = getChartsForPage(pageName);

    const promises = chartList.map(chartId =>
      fetchChartData(chartId).then(response => ({ chartId, response }))
    );

    const results = await Promise.allSettled(promises);

    for (const res of results) {
      if (res.status === "fulfilled") {
        const { chartId, response } = res.value;
        if (window.renderChartFromAPI) {
          window.renderChartFromAPI(chartId, response);
        }
      }
    }
  } finally {
    if (window.hideLoader) window.hideLoader();
  }
}

window.refreshPage = refreshPage;

/* ---------------------------------------------------------------------------
 * SECTION 6: PAGE-TO-CHART MAPPING
 * ---------------------------------------------------------------------------*/

function getChartsForPage(page) {
  if (page === "performance-overview") {
    return [
      "kpi_revenue",
      "kpi_ad_spend",
      "kpi_roas",
      "kpi_roi",
      "alert_performance_gain",
      "alert_channel_mix",
      "alert_budget_reallocation",
      "perf_funnel_by_channel",
      "perf_cac_blended_vs_paid",
      "perf_cac_trend_by_channel",
      "perf_paid_roi_by_stage",
      "perf_pipeline_value",
      "perf_ltv_cac_ratio",
      "perf_ltv_by_cohort",
      "perf_attribution_accuracy",
      "perf_top_channels_roas",
      "perf_new_vs_repeat_mix"
    ];
  }

  if (page === "channel-campaign-analytics") {
    return [
      "channel_cpl_cac_roas",
      "campaign_roi_bubble",
      "channel_touchpoint_split",
      "audience_roas",
      "channel_lead_quality",
      "channel_spend_efficiency",
      "creative_perf_tiles",
      "channel_snapshot_table"
    ];
  }

  return [];
}

/* ---------------------------------------------------------------------------
 * SECTION 8: RENDER DISPATCHER
 * ---------------------------------------------------------------------------*/

window.renderChartFromAPI = function renderChartFromAPI(chartId, response) {
  console.debug("📊 renderChartFromAPI →", chartId, response);

  if (!response || response.success === false) {
    console.warn(`Chart ${chartId} failed`, response?.error);
    return;
  }

  const data = response.data || {};

  switch (chartId) {
    case "kpi_revenue":
      updateKpiCards(data, "rev-current", "rev-prev", "rev-change", "rev-chart", "revenue");
      break;
    case "kpi_ad_spend":
      updateKpiCards(data, "spend-current", "spend-prev", "spend-change", "spend-chart", "spend");
      break;
    case "kpi_roas":
      updateKpiCards(data, "roas-current", "roas-prev", "roas-change", "roas-chart", "roas");
      break;
    case "kpi_roi":
      updateKpiCards(data, "roi-current", "roi-prev", "roi-change", "roi-chart", "roi");
      break;

    case "alert_performance_gain":
      updateSmartAlertCard("alert-card-performance-gain", "Performance Gain", data);
      break;
    case "alert_channel_mix":
      updateSmartAlertCard("alert-card-channel-mix", "Channel Mix Efficiency", data);
      break;
    case "alert_budget_reallocation":
      updateSmartAlertCard("alert-card-budget-risk", "Budget / Risk", data);
      break;

    case "perf_funnel_by_channel":
      updatePerfFunnelFromAPI(data);
      break;
    case "perf_cac_blended_vs_paid":
      updateBlendedPaidCACFromAPI(data);
      break;
    case "perf_cac_trend_by_channel":
      updateCacTrendByChannelFromAPI(data);
      break;
    case "perf_paid_roi_by_stage":
      updatePaidRoiByStageFromAPI(data);
      break;
    case "perf_pipeline_value":
      updatePipelineValueFromAPI(data);
      break;
    case "perf_ltv_cac_ratio":
      updateLtvCacRatioFromAPI(data);
      break;
    case "perf_ltv_by_cohort":
      updateLtvByCohortFromAPI(data);
      break;
    case "perf_attribution_accuracy":
      updateAttributionAccuracyFromAPI(data);
      break;
    case "perf_top_channels_roas":
      updateTopChannelsRoasFromAPI(data);
      break;
    case "perf_new_vs_repeat_mix":
      updateNewVsRepeatMixFromAPI(data);
      break;

    case "channel_cpl_cac_roas":
      updateChannelCplCacRoasFromAPI(data);
      break;
    case "campaign_roi_bubble":
      updateCampaignRoiBubbleFromAPI(data);
      break;
    case "channel_touchpoint_split":
      updateChannelTouchpointSplitFromAPI(data);
      break;
    case "audience_roas":
      updateAudienceRoasFromAPI(data);
      break;
    case "channel_lead_quality":
      updateChannelLeadQualityFromAPI(data);
      break;
    case "channel_spend_efficiency":
      updateChannelSpendEfficiencyFromAPI(data);
      break;
    case "creative_perf_tiles":
      updateCreativePerfTilesFromAPI(data);
      break;
    case "channel_snapshot_table":
      updateChannelSnapshotTableFromAPI(data);
      break;

    default:
      console.warn(`No renderer implemented for chartId="${chartId}"`);
  }
};

/* ============================================================================
 * END OF dashboard_chart_api.js
 * ========================================================================== */
