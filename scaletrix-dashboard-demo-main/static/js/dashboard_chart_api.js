/* ============================================================================
 * dashboard_chart_api.js — Scalex Adaptor Integration
 * ========================================================================== */

const SCALEX_API_URL =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

/* ---------------------------------------------------------------------------
 * Helper: Build request payload
 * ------------------------------------------------------------------------ */
function buildPayload(chartName) {
  const dateRange = JSON.parse(sessionStorage.getItem("dateRange")) || {
    startDate: "2025-12-01",
    endDate: "2025-12-31",
  };

  return {
    chartName,
    dateRange,
    comparison: false,
  };
}

/* ---------------------------------------------------------------------------
 * Generic fetcher
 * ------------------------------------------------------------------------ */
async function fetchChartData(chartName) {
  const res = await fetch(SCALEX_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildPayload(chartName)),
  });

  if (!res.ok) {
    throw new Error(`API failed for ${chartName}`);
  }

  const json = await res.json();
  return json.data;
}

/* ---------------------------------------------------------------------------
 * Channel Analytics – API-powered charts
 * ------------------------------------------------------------------------ */

async function loadChannelCplCacRoas() {
  return fetchChartData("channel_cpl_cac_roas");
}

async function loadCampaignRoiBubble() {
  return fetchChartData("campaign_roi_bubble");
}

async function loadTouchpointSplit() {
  return fetchChartData("channel_touchpoint_split");
}

async function loadAudienceRoas() {
  return fetchChartData("audience_roas");
}

async function loadLeadQuality() {
  return fetchChartData("channel_lead_quality");
}

async function loadSpendEfficiency() {
  return fetchChartData("channel_spend_efficiency");
}

async function loadChannelSnapshot() {
  return fetchChartData("channel_snapshot_table");
}

/* ---------------------------------------------------------------------------
 * Page-level loader (Channel Analytics only)
 * ------------------------------------------------------------------------ */
async function loadChannelAnalyticsCharts() {
  try {
    const [
      cplCacRoas,
      campaignRoi,
      touchpointSplit,
      audienceRoas,
      leadQuality,
      spendEfficiency,
      channelSnapshot,
    ] = await Promise.all([
      loadChannelCplCacRoas(),
      loadCampaignRoiBubble(),
      loadTouchpointSplit(),
      loadAudienceRoas(),
      loadLeadQuality(),
      loadSpendEfficiency(),
      loadChannelSnapshot(),
    ]);

    // Delegate rendering to existing chart functions
    renderChannelCplCacRoas(cplCacRoas);
    renderCampaignRoiBubble(campaignRoi);
    renderTouchpointSplit(touchpointSplit);
    renderAudienceRoas(audienceRoas);
    renderLeadQuality(leadQuality);
    renderSpendEfficiency(spendEfficiency);
    renderChannelSnapshot(channelSnapshot);

  } catch (err) {
    console.error("Channel Analytics API error", err);
  }
}

/* ---------------------------------------------------------------------------
 * Export
 * ------------------------------------------------------------------------ */
window.loadChannelAnalyticsCharts = loadChannelAnalyticsCharts;
