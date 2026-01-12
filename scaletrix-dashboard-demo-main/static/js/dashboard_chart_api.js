/* ============================================================================
 * dashboard_chart_api.js
 * MODE: STATIC Performance Overview + API Channel Analytics
 * UPDATED: 2026-01-10
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js LOADED (STATIC PERF + API CHANNEL)",
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
 * STATIC PERFORMANCE DATA (SINGLE SOURCE OF TRUTH)
 * ------------------------------------------------------------------------- */
function injectPerformanceStaticData() {
  console.log(
    "%c[ScaleX] Rendering Performance Overview (STATIC DATA)",
    "color:#38bdf8;font-weight:bold"
  );

  const staticResponses = {
    // KPI CARDS
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

    // DETAIL CHARTS
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

  Object.entries(staticResponses).forEach(([chartId, response]) => {
    if (window.renderChartFromAPI) {
      window.renderChartFromAPI(chartId, response);
    }
  });
}

/* ---------------------------------------------------------------------------
 * API FETCH (CHANNEL & CAMPAIGN ONLY)
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
    console.error("[ScaleX] API error", chartName, e);
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * PAGE REFRESH (SINGLE ENTRY POINT)
 * ------------------------------------------------------------------------- */
async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  console.log(
    "%c[ScaleX] refreshPage → " + CURRENT_PAGE,
    "color:#facc15;font-weight:bold"
  );

  // 🔹 PERFORMANCE OVERVIEW → STATIC ONLY
  if (CURRENT_PAGE === "performance-overview") {
    injectPerformanceStaticData();
    return;
  }

  // 🔹 CHANNEL & CAMPAIGN → API
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
