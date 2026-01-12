/* ============================================================================
 * dashboard_chart_api.js
 *
 * HYBRID API ROUTER
 * - Performance Overview  → OLD (working) API
 * - Channel Analytics     → NEW (Scalex Adaptor) API
 *
 * LAST UPDATED: 2026-01-11
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js loaded (HYBRID MODE)",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * API BASES
 * ------------------------------------------------------------------------- */

// ✅ OLD / WORKING API (Performance Overview)
const SCALEX_API_PERF =
  "https://scalex-ads-connector-ohkoqzgrzq-el.a.run.app/api/v1/chart";

// ✅ NEW API (Channel & Campaign Analytics)
const SCALEX_API_CHANNEL =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

/* ---------------------------------------------------------------------------
 * PAGE STATE
 * ------------------------------------------------------------------------- */

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

/* ---------------------------------------------------------------------------
 * FILTER HELPERS (UNCHANGED)
 * ------------------------------------------------------------------------- */

function getStoredFilters() {
  const stored = sessionStorage.getItem("dateRange");
  const parsed = stored ? JSON.parse(stored) : null;

  return {
    dateRange: parsed?.dateRange || null,
    comparison: parsed?.comparison || false,
    timestamp: parsed?.timestamp || new Date().toISOString(),
    devices: sessionStorage.getItem("filter_devices") || null,
    channels: sessionStorage.getItem("filter_channels") || null,
    locations: sessionStorage.getItem("filter_locations") || null
  };
}

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
 * API FETCH (SMART ROUTER)
 * ------------------------------------------------------------------------- */

async function fetchChartData(chartId) {
  const payload = buildPayload();

  const isPerf = CURRENT_PAGE === "performance-overview";
  const url = isPerf
    ? `${SCALEX_API_PERF}/${chartId}`
    : SCALEX_API_CHANNEL;

  const body = isPerf
    ? payload
    : { chartName: chartId };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return await res.json();
  } catch (e) {
    console.error("[ScaleX] API error", chartId, e);
    return { success: false, error: e.message };
  }
}

/* ---------------------------------------------------------------------------
 * PAGE → CHART MAPPING (UNCHANGED)
 * ------------------------------------------------------------------------- */

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
 * LOADER HELPERS
 * ------------------------------------------------------------------------- */

window.showLoader = () => {
  const el = document.getElementById("loader");
  if (el) el.classList.remove("hidden");
};

window.hideLoader = () => {
  const el = document.getElementById("loader");
  if (el) el.classList.add("hidden");
};

/* ---------------------------------------------------------------------------
 * PAGE REFRESH (SINGLE SOURCE OF TRUTH)
 * ------------------------------------------------------------------------- */

async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  console.log(
    "%c[ScaleX] refreshPage → " + CURRENT_PAGE,
    "color:#facc15"
  );

  if (window.showLoader) window.showLoader();

  try {
    const charts = getChartsForPage(CURRENT_PAGE);

    const promises = charts.map(chartId =>
      fetchChartData(chartId).then(response => ({ chartId, response }))
    );

    const results = await Promise.allSettled(promises);

    for (const r of results) {
      if (r.status === "fulfilled") {
        const { chartId, response } = r.value;
        if (window.renderChartFromAPI) {
          window.renderChartFromAPI(chartId, response);
        }
      } else {
        console.warn("[ScaleX] Chart failed", r.reason);
      }
    }
  } finally {
    if (window.hideLoader) window.hideLoader();
  }
}

window.refreshPage = refreshPage;

/* ---------------------------------------------------------------------------
 * INITIAL LOAD
 * ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  refreshPage(CURRENT_PAGE);
});

/* ============================================================================
 * END OF FILE
 * ========================================================================== */
