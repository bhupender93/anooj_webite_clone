/* ============================================================================
 * dashboard_layout.js — SAFE, OLD-REPO COMPATIBLE
 * Project: ScaleX Dashboard
 * ========================================================================== */

/* ---------------------------------------------------------------------------
 * SAFE CALL HELPER (CORE FIX)
 * ------------------------------------------------------------------------ */
function safeCall(fnName, ...args) {
    const fn = window[fnName];
    if (typeof fn === "function") {
        return fn(...args);
    }
}

/* ---------------------------------------------------------------------------
 * FILTER TOGGLE
 * ------------------------------------------------------------------------ */
window.toggleFilterSection = function () {
    const filterContent = document.getElementById("filter-content");
    const filterArrow = document.getElementById("filter-toggle-arrow");
    if (!filterContent || !filterArrow) return;

    const opening = filterContent.classList.contains("hidden");
    filterContent.classList.toggle("hidden", !opening);
    filterArrow.setAttribute("data-lucide", opening ? "chevron-up" : "chevron-down");

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
    safeCall("refreshPage");
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
        }
    );
}

/* ---------------------------------------------------------------------------
 * PAGE INITIALIZATION (OLD-REPO STYLE)
 * ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) window.lucide.createIcons();
    initializeDateRangePicker();

    const sidebarLinks = document.querySelectorAll(".sidebar-link");
    const heading = document.getElementById("main-heading");

    function clearActive() {
        sidebarLinks.forEach(l => l.classList.remove("active"));
    }

    function getKey(label) {
        const t = label.toLowerCase();
        if (t.includes("performance")) return "performance-overview";
        if (t.includes("channel")) return "channel-campaign-analytics";
        return "performance-overview";
    }

    sidebarLinks.forEach(link => {
        link.addEventListener("click", () => {
            const label = link.textContent.trim();
            const key = getKey(label);

            clearActive();
            link.classList.add("active");
            if (heading) heading.textContent = label;

            sessionStorage.setItem("activePage", key);

            safeCall("handleAnalysisViewChange", key);
            safeCall("refreshPage", key);
        });
    });

    // DEFAULT LOAD (SAFE)
    safeCall("handleAnalysisViewChange", "performance-overview");
    safeCall("refreshPage", "performance-overview");
});

/* ---------------------------------------------------------------------------
 * CHART MODAL SAFE BINDINGS
 * ------------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("chart-modal");
    const closeBtn = document.getElementById("chart-modal-close");
    const pngBtn = document.getElementById("chart-modal-download-png");
    const pdfBtn = document.getElementById("chart-modal-download-pdf");

    if (closeBtn) {
        closeBtn.addEventListener("click", () => safeCall("closeChartModal"));
    }

    if (pngBtn) {
        pngBtn.addEventListener("click", () => safeCall("downloadModalChart", "png"));
    }

    if (pdfBtn) {
        pdfBtn.addEventListener("click", () => safeCall("downloadModalChart", "pdf"));
    }

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) safeCall("closeChartModal");
        });
    }
});
