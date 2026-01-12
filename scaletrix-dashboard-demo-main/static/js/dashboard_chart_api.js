/* ============================================================================
 * dashboard_chart_api.js
 * MODE: STATIC Performance Overview + API Channel Analytics
 * STRUCTURE: IDENTICAL to working repo
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js loaded",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * SECTION 1: CONFIG
 * ------------------------------------------------------------------------- */

const SCALEX_API_BASE =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

/* ---------------------------------------------------------------------------
 * SECTION 2: STATIC PERFORMANCE PAYLOADS (API-SHAPED)
 * ------------------------------------------------------------------------- */

const STATIC_PERFORMANCE_DATA = {
  kpi_revenue: {
    success: true,
    data: {
      currentValue: 1280000,
      previousValue: 1040000,
      deltaPercent: 23.1,
      sparkline: [82, 86, 91, 98, 104, 112, 128]
    }
  },
  kpi_ad_spend: {
    success: true,
    data: {
      currentValue: 420000,
      previousValue: 395000,
      deltaPercent: 6.3,
      sparkline: [31, 32, 34, 36, 38, 40, 42]
    }
  },
  kpi_roas: {
    success: true,
    data: {
      currentValue: 3.05,
      previousValue: 2.7,
      deltaPercent: 13,
      sparkline: [2.2, 2.4, 2.6, 2.8, 2.9, 3.0, 3.05]
    }
  },
  kpi_roi: {
    success: true,
    data: {
      currentValue: 205,
      previousValue: 170,
      deltaPercent: 20.6,
      sparkline: [150, 158, 165, 175, 185, 195, 205]
    }
  },

  perf_funnel_by_channel: {
    success: true,
    data: {
      labels: ["Spend", "Revenue", "ROAS", "ROI"],
      datasets: [
        { label: "Meta", data: [260000, 1050000, 2.8, 180] },
        { label: "Google", data: [420000, 1550000, 3.1, 210] },
        { label: "LinkedIn", data: [180000, 820000, 3.5, 240] }
      ]
    }
  },

  perf_pipeline_value: {
    success: true,
    data: {
      labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
      datasets: [{ data: [32, 36, 41, 47, 52, 61] }]
    }
  },

  perf_ltv_cac_ratio: {
    success: true,
    data: {
      ltv: 180000,
      cac: 52000,
      ratio: 3.5,
      status: "healthy"
    }
  },

  perf_top_channels_roas: {
    success: true,
    data: {
      labels: ["Affiliate", "Google", "Meta", "Display", "LinkedIn"],
      datasets: [{ data: [4.6, 3.8, 3.1, 2.4, 2.1] }]
    }
  }
};

/* ---------------------------------------------------------------------------
 * SECTION 3: FETCH CHART DATA (SINGLE OVERRIDE POINT)
 * ------------------------------------------------------------------------- */

async function fetchChartData(chartId) {
  // 🔹 STATIC MODE FOR PERFORMANCE OVERVIEW
  if (CURRENT_PAGE === "performance-overview") {
    if (STATIC_PERFORMANCE_DATA[chartId]) {
      console.debug("[ScaleX][STATIC]", chartId);
      return STATIC_PERFORMANCE_DATA[chartId];
    }
    return { success: false };
  }

  // 🔹 API MODE FOR CHANNEL & CAMPAIGN
  try {
    const res = await fetch(SCALEX_API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chartName: chartId })
    });
    return await res.json();
  } catch (err) {
    console.error("[ScaleX] API error:", chartId, err);
    return { success: false };
  }
}

/* ---------------------------------------------------------------------------
 * SECTION 4: PAGE → CHART MAP (UNCHANGED)
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
 * SECTION 5: REFRESH PAGE (UNCHANGED)
 * ------------------------------------------------------------------------- */

async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  console.log("[ScaleX] refreshPage →", CURRENT_PAGE);

  const chartList = getChartsForPage(CURRENT_PAGE);

  for (const chartId of chartList) {
    const response = await fetchChartData(chartId);
    if (window.renderChartFromAPI) {
      window.renderChartFromAPI(chartId, response);
    }
  }
}

window.refreshPage = refreshPage;

/* ---------------------------------------------------------------------------
 * SECTION 6: INITIAL LOAD
 * ------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  refreshPage(CURRENT_PAGE);
});
