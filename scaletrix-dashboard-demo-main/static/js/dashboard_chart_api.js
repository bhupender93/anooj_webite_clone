/* ============================================================================
 * dashboard_chart_api.js
 *
 * Responsibility:
 * - Fetch data from Scalex Adaptor API
 * - Normalize API responses
 * - Populate OLD dashboard_charts.js data objects
 * - Trigger existing render functions
 *
 * IMPORTANT:
 * - DO NOT render charts here
 * - DO NOT touch layout
 * - DO NOT create Chart.js instances here
 * ========================================================================== */

const SCALEX_API_ENDPOINT =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

/* ---------------------------------------------------------------------------
 * SAFE FETCH WRAPPER
 * --------------------------------------------------------------------------- */
async function safeCall(promise) {
  try {
    return await promise;
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * MAIN PAGE REFRESH
 * --------------------------------------------------------------------------- */
async function refreshPage() {
  const dateRange = getActiveDateRange();

  // -------- Channel-wise CPL · CAC · ROAS --------
  const cplRes = await safeCall(fetchChart("channel_cpl_cac_roas", dateRange));
  if (cplRes) {
    channelEfficiencyData.channels = cplRes.labels || [];
    channelEfficiencyData.cpl = cplRes.datasets?.[0]?.data || [];
    channelEfficiencyData.cac = cplRes.datasets?.[1]?.data || [];
    channelEfficiencyData.roas = cplRes.datasets?.[2]?.data || [];
  }

  // -------- Audience Segment ROAS --------
  const audRes = await safeCall(fetchChart("audience_roas", dateRange));
  if (audRes) {
    audienceRoasData.labels = audRes.labels || [];
    audienceRoasData.roas = audRes.datasets?.[0]?.data || [];
  }

  // -------- Touch-point Revenue Split --------
  const touchRes = await safeCall(fetchChart("touchpoint_revenue_split", dateRange));
  if (touchRes) {
    touchPointSplitData.channels = touchRes.labels || [];
    touchPointSplitData.first = touchRes.datasets?.[0]?.data || [];
    touchPointSplitData.mid = touchRes.datasets?.[1]?.data || [];
    touchPointSplitData.last = touchRes.datasets?.[2]?.data || [];
  }

  // -------- Lead Quality Score --------
  const qualityRes = await safeCall(fetchChart("lead_quality_score", dateRange));
  if (qualityRes) {
    leadQualityData.channels = qualityRes.labels || [];
    leadQualityData.scores = qualityRes.datasets?.[0]?.data || [];
  }

  // -------- Spend Efficiency --------
  const effRes = await safeCall(fetchChart("spend_efficiency_index", dateRange));
  if (effRes) {
    spendEfficiencyData.channels = effRes.labels || [];
    spendEfficiencyData.spendShare = effRes.datasets?.[0]?.data || [];
    spendEfficiencyData.revenueShare = effRes.datasets?.[1]?.data || [];
  }

  // -------- Channel Performance Snapshot --------
  const snapRes = await safeCall(fetchChart("channel_performance_snapshot", dateRange));
  if (Array.isArray(snapRes?.rows)) {
    channelPerformanceTableData.length = 0;
    snapRes.rows.forEach(r => channelPerformanceTableData.push(r));
  }

  // -------- RENDER BASED ON ACTIVE TAB --------
  if (window.__ACTIVE_VIEW__ === "channel") {
    renderChannelCampaignDetails();
  } else {
    renderPerformanceOverviewDetails();
  }
}

/* ---------------------------------------------------------------------------
 * FETCH HELPERS
 * --------------------------------------------------------------------------- */
async function fetchChart(chartName, dateRange) {
  const res = await fetch(SCALEX_API_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chartName,
      dateRange,
      comparison: false
    })
  });

  const json = await res.json();
  return json?.data || null;
}

/* ---------------------------------------------------------------------------
 * DATE RANGE
 * --------------------------------------------------------------------------- */
function getActiveDateRange() {
  const picker = document.getElementById("daterangepicker");
  if (!picker || !picker.value) {
    const end = moment();
    const start = moment().subtract(29, "days");
    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD")
    };
  }

  const [start, end] = picker.value.split(" - ");
  return {
    startDate: moment(start).format("YYYY-MM-DD"),
    endDate: moment(end).format("YYYY-MM-DD")
  };
}

/* ---------------------------------------------------------------------------
 * INITIAL LOAD
 * --------------------------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  refreshPage();
});
