/* ============================================================================
 * dashboard_charts.js — DATA-DRIVEN (OLD-REPO COMPATIBLE)
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * UTILS
 * ------------------------------------------------------------------------ */
function clearDetailCharts() {
  const container = document.getElementById("detail-charts");
  if (container) container.innerHTML = "";
}

function createCanvas(id) {
  const canvas = document.createElement("canvas");
  canvas.id = id;
  canvas.height = 120;
  return canvas;
}

/* ---------------------------------------------------------------------------
 * PERFORMANCE OVERVIEW (UNCHANGED / STATIC)
 * ------------------------------------------------------------------------ */
window.renderPerformanceOverviewDetails = function () {
  clearDetailCharts();

  const container = document.getElementById("detail-charts");
  if (!container) return;

  const canvas = createCanvas("creativePerformanceChart");
  container.appendChild(canvas);

  new Chart(canvas.getContext("2d"), {
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
};

/* ---------------------------------------------------------------------------
 * CHANNEL & CAMPAIGN ANALYTICS (API-DRIVEN)
 * ------------------------------------------------------------------------ */
window.renderChannelCampaignDetails = function () {
  const data = window.__SCALEX_DATA__;
  if (!data) return;

  clearDetailCharts();
  const container = document.getElementById("detail-charts");
  if (!container) return;

  // 1️⃣ CPL · CAC · ROAS
  if (data.cpl) {
    const c = createCanvas("cplChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.cpl,
    });
  }

  // 2️⃣ Campaign ROI
  if (data.roi) {
    const c = createCanvas("roiChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.roi,
    });
  }

  // 3️⃣ Touchpoint Split
  if (data.touchpoint) {
    const c = createCanvas("touchpointChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.touchpoint,
      options: {
        scales: {
          x: { stacked: true },
          y: { stacked: true },
        },
      },
    });
  }

  // 4️⃣ Audience ROAS
  if (data.audience) {
    const c = createCanvas("audienceChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.audience,
      options: { indexAxis: "y" },
    });
  }

  // 5️⃣ Lead Quality
  if (data.quality) {
    const c = createCanvas("qualityChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.quality,
    });
  }

  // 6️⃣ Spend Efficiency
  if (data.efficiency) {
    const c = createCanvas("efficiencyChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.efficiency,
    });
  }

  // 7️⃣ Channel Snapshot
  if (data.snapshot) {
    const c = createCanvas("snapshotChart");
    container.appendChild(c);

    new Chart(c.getContext("2d"), {
      type: "bar",
      data: data.snapshot,
    });
  }
};

/* ---------------------------------------------------------------------------
 * MODAL FUNCTIONS (REQUIRED BY layout.js)
 * ------------------------------------------------------------------------ */
window.closeChartModal = function () {
  const modal = document.getElementById("chart-modal");
  if (modal) modal.classList.add("hidden");
};

window.downloadModalChart = function () {};
window.openChartModalFromCanvas = function () {};
