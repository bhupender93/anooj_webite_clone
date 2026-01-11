/* ============================================================================
 * dashboard_layout.js — FIXED VIEW CONTROLLER (API COMPATIBLE)
 * Updated: 2026-01-09
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_layout.js loaded (FIXED VIEW CONTROLLER) – v2026-01-09",
  "color:#22c55e;font-weight:bold"
);

window.__SCALEX_LAYOUT_VERSION__ = "2026-01-09";

/* ---------------------------------------------------------------------------
 * SAFE CALL HELPER
 * ------------------------------------------------------------------------ */
function safeCall(fn, ...args) {
    try {
        if (typeof fn === "function") fn(...args);
    } catch (e) {
        console.error("safeCall error:", e);
    }
}

/* ---------------------------------------------------------------------------
 * GLOBAL VIEW STATE
 * ------------------------------------------------------------------------ */
window.__ACTIVE_VIEW__ = "performance";

/* ---------------------------------------------------------------------------
 * FILTER TOGGLE
 * ------------------------------------------------------------------------ */
window.toggleFilterSection = function () {
    const c = document.getElementById("filter-content");
    const a = document.getElementById("filter-toggle-arrow");
    if (!c || !a) return;

    const open = c.classList.contains("hidden");
    c.classList.toggle("hidden", !open);
    a.setAttribute("data-lucide", open ? "chevron-up" : "chevron-down");

    if (window.lucide) window.lucide.createIcons();
};

/* ---------------------------------------------------------------------------
 * DATE RANGE STORAGE
 * ------------------------------------------------------------------------ */
const DATE_RANGE_KEY = "dateRange";

function storeDateRange(startDate, endDate) {
    const payload = {
        dateRange: {
            startDate: startDate.format("YYYY-MM-DD"),
            endDate: endDate.format("YYYY-MM-DD"),
        },
        comparison: false,
        timestamp: moment().toISOString(),
    };

    sessionStorage.setItem(DATE_RANGE_KEY, JSON.stringify(payload));
    return payload;
}

function getStoredDateRange() {
    const raw = sessionStorage.getItem(DATE_RANGE_KEY);
    return raw ? JSON.parse(raw) : null;
}

window.storeDateRange = storeDateRange;
window.getStoredDateRange = getStoredDateRange;

/* ---------------------------------------------------------------------------
 * DATE PICKER INIT
 * ------------------------------------------------------------------------ */
function initializeDateRangePicker() {
    const stored = getStoredDateRange();

    let start = moment().subtract(7, "days");
    let end = moment().subtract(1, "days");

    if (stored?.dateRange) {
        start = moment(stored.dateRange.startDate);
        end = moment(stored.dateRange.endDate);
    }

    storeDateRange(start, end);

    $("#daterangepicker").daterangepicker(
        {
            startDate: start,
            endDate: end,
            ranges: {
                "Last 7 Days": [moment().subtract(7, "days"), moment().subtract(1, "days")],
                "Last 30 Days": [moment().subtract(30, "days"), moment().subtract(1, "days")],
            },
        },
        function (s, e) {
            storeDateRange(s, e);
            renderActiveView();
        }
    );
}

/* ---------------------------------------------------------------------------
 * VIEW SWITCHING
 * ------------------------------------------------------------------------ */
function renderActiveView() {
    if (window.__ACTIVE_VIEW__ === "performance") {
        safeCall(window.renderPerformanceOverviewDetails);
    } else {
        safeCall(window.renderChannelCampaignDetails);
    }
}

function switchView(view, headingText) {
    window.__ACTIVE_VIEW__ = view;

    const heading = document.getElementById("main-heading");
    if (heading) heading.textContent = headingText;

    renderActiveView();
}

/* ---------------------------------------------------------------------------
 * PAGE INIT
 * ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) window.lucide.createIcons();
    initializeDateRangePicker();

    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    sidebarLinks.forEach((link, idx) => {
        link.addEventListener("click", () => {
            sidebarLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");

            if (idx === 0) {
                switchView("performance", "Performance Overview");
            } else {
                switchView("channel", "Channel & Campaign Analytics");
            }
        });
    });

    // DEFAULT LOAD
    switchView("performance", "Performance Overview");
});

/* ---------------------------------------------------------------------------
 * CHART MODAL BINDINGS
 * ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("chart-modal");

    document.getElementById("chart-modal-close")
        ?.addEventListener("click", () => safeCall(window.closeChartModal));

    document.getElementById("chart-modal-download-png")
        ?.addEventListener("click", () => safeCall(window.downloadModalChart, "png"));

    document.getElementById("chart-modal-download-pdf")
        ?.addEventListener("click", () => safeCall(window.downloadModalChart, "pdf"));

    modal?.addEventListener("click", (e) => {
        if (e.target === modal) safeCall(window.closeChartModal);
    });
});
