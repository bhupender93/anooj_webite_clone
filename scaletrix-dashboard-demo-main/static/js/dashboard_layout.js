/* ============================================================================
 * dashboard_layout.js — OPTION A (STATIC PERF + API CHANNEL)
 * ========================================================================== */

/* ---------- DEBUG MARKER ---------- */
console.log("✅ dashboard_layout.js loaded (Option A)");

/* ---------- GLOBAL VIEW STATE ---------- */
window.__ACTIVE_VIEW__ = "performance-overview";

/* ---------- FILTER TOGGLE ---------- */
window.toggleFilterSection = function () {
  const content = document.getElementById("filter-content");
  const arrow = document.getElementById("filter-toggle-arrow");
  if (!content || !arrow) return;

  const open = content.classList.contains("hidden");
  content.classList.toggle("hidden", !open);
  arrow.setAttribute("data-lucide", open ? "chevron-up" : "chevron-down");
  if (window.lucide) window.lucide.createIcons();
};

/* ---------- DATE RANGE ---------- */
function storeDateRange(start, end) {
  const payload = {
    dateRange: {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
    },
    comparison: false,
    timestamp: new Date().toISOString(),
  };
  sessionStorage.setItem("dateRange", JSON.stringify(payload));
  if (window.refreshPage) window.refreshPage();
}

function getStoredDateRange() {
  const raw = sessionStorage.getItem("dateRange");
  return raw ? JSON.parse(raw) : null;
}

window.getStoredDateRange = getStoredDateRange;
window.storeDateRange = storeDateRange;

/* ---------- DATE PICKER ---------- */
function initDatePicker() {
  let start = moment().subtract(7, "days");
  let end = moment().subtract(1, "days");

  const stored = getStoredDateRange();
  if (stored?.dateRange) {
    start = moment(stored.dateRange.startDate);
    end = moment(stored.dateRange.endDate);
  }

  storeDateRange(start, end);

  $("#daterangepicker").daterangepicker(
    { startDate: start, endDate: end },
    (s, e) => storeDateRange(s, e)
  );
}

/* ---------- VIEW SWITCH ---------- */
window.handleAnalysisViewChange = function (view) {
  console.log("🔀 Switching view:", view);
  window.__ACTIVE_VIEW__ = view;

  const kpi = document.getElementById("kpi-cards");
  const alerts = document.getElementById("smart-alerts");

  if (view === "performance-overview") {
    kpi.style.display = "";
    alerts.classList.remove("hidden");
    if (window.renderPerformanceOverviewDetails) {
      window.renderPerformanceOverviewDetails();
    }
  } else {
    kpi.style.display = "none";
    alerts.classList.add("hidden");
    if (window.renderChannelCampaignDetails) {
      window.renderChannelCampaignDetails();
    }
  }
};

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  initDatePicker();

  const links = document.querySelectorAll(".sidebar-link");
  const heading = document.getElementById("main-heading");

  links.forEach((link) => {
    link.addEventListener("click", () => {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      const label = link.textContent.trim();
      heading.textContent = label;

      const view = label.toLowerCase().includes("channel")
        ? "channel-campaign-analytics"
        : "performance-overview";

      handleAnalysisViewChange(view);
      if (window.refreshPage) window.refreshPage(view);
    });
  });

  handleAnalysisViewChange("performance-overview");
});
