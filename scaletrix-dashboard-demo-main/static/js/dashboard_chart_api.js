/* ============================================================================
 * dashboard_chart_api.js
 *
 * API integration layer for chart data fetching and caching
 *
 * UPDATED: 2026-01-22
 *
 * CHANGE SUMMARY:
 * - Performance Overview (Page 1) now uses Scalex Adaptor (dynamic)
 * - Channel Analytics (Page 2) unchanged
 * - Unified API contract: POST /chart-data
 *
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js LOADED (FULLY DYNAMIC)",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * SECTION 1: API CONFIGURATION
 * ---------------------------------------------------------------------------*/

// ✅ Unified backend (Scalex Adaptor)
const SCALEX_ADAPTOR_API =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

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

function buildPayload(chartId) {
  const f = getStoredFilters();

  return {
    chartName: chartId,              // ✅ adaptor contract
    dateRange: f.dateRange,          // { startDate, endDate }
    comparison: f.comparison || false,
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
  const payload = buildPayload(chartId);

  if (!payload.dateRange?.startDate || !payload.dateRange?.endDate) {
    console.warn(`[ScaleX] Missing dateRange for ${chartId}`);
    return { success: false, error: "Missing dateRange" };
  }

  try {
    const res = await fetch(SCALEX_ADAPTOR_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let json;
    try {
      json = await res.json();
    } catch {
      console.error(`[ScaleX] Invalid JSON for ${chartId}`);
      return { success: false, error: "Invalid JSON from server" };
    }

    if (!res.ok) {
      console.error(`[ScaleX] API error (${chartId})`, json);
      return { success: false, error: json };
    }

    return json;
  } catch (err) {
    console.error(`[ScaleX] Network error (${chartId})`, err);
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
 * SECTION 6: PAGE → CHART MAPPING
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

/* ============================================================================
 * END OF dashboard_chart_api.js
 * ========================================================================== */
