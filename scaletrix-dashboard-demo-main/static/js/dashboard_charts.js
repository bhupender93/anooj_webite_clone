/* ============================================================================
 * dashboard_charts.js — Channel Analytics (API-ready)
 * Project: Scalex Adaptor
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * Utility: Destroy existing chart instance (avoid duplicates)
 * ------------------------------------------------------------------------ */
function resetChart(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  const ctx = canvas.getContext("2d");
  if (canvas._chart) {
    canvas._chart.destroy();
  }
  return ctx;
}

/* ============================================================================
 * 1️⃣ Channel-wise CPL · CAC · ROAS
 * ========================================================================== */
function renderChannelCplCacRoas(apiData) {
  const ctx = resetChart("channelCplCacRoasChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/* ============================================================================
 * 2️⃣ Campaign ROI & Incremental ROAS (Bubble / Scatter)
 * ========================================================================== */
function renderCampaignRoiBubble(apiData) {
  const ctx = resetChart("campaignRoiBubbleChart");

  // API gives labels + datasets, but bubble needs objects
  const roiDataset = apiData.datasets[0].data.map((roi, i) => ({
    x: i + 1,
    y: roi,
    r: 12,
    label: apiData.labels[i],
  }));

  ctx.canvas._chart = new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: "ROI %",
          data: roiDataset,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `${roiDataset[ctx.dataIndex].label}: ${ctx.raw.y}%`,
          },
        },
      },
      scales: {
        x: { display: false },
        y: { beginAtZero: true },
      },
    },
  });
}

/* ============================================================================
 * 3️⃣ Touch-Point Revenue Split
 * ========================================================================== */
function renderTouchpointSplit(apiData) {
  const ctx = resetChart("touchpointSplitChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true },
      },
    },
  });
}

/* ============================================================================
 * 4️⃣ Audience Segment ROAS
 * ========================================================================== */
function renderAudienceRoas(apiData) {
  const ctx = resetChart("audienceRoasChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true },
      },
    },
  });
}

/* ============================================================================
 * 5️⃣ Lead Quality Score by Channel
 * ========================================================================== */
function renderLeadQuality(apiData) {
  const ctx = resetChart("leadQualityChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  });
}

/* ============================================================================
 * 6️⃣ Spend Efficiency Index by Channel
 * ========================================================================== */
function renderSpendEfficiency(apiData) {
  const ctx = resetChart("spendEfficiencyChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      plugins: { legend: { position: "top" } },
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
    },
  });
}

/* ============================================================================
 * 7️⃣ Channel Performance Snapshot
 * (Rendered as grouped bars for key metrics)
 * ========================================================================== */
function renderChannelSnapshot(apiData) {
  const ctx = resetChart("channelSnapshotChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: apiData.labels,
      datasets: apiData.datasets,
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "top" } },
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/* ============================================================================
 * ❌ Creative Performance (STATIC — DO NOT TOUCH)
 * ========================================================================== */
function renderCreativePerformanceStatic() {
  const ctx = resetChart("creativePerformanceChart");

  ctx.canvas._chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["CTR", "CPC", "Engagement"],
      datasets: [
        {
          label: "Performance",
          data: [3.4, 28, 7.9],
          borderColor: "#4BC0C0",
          fill: false,
        },
      ],
    },
  });
}
