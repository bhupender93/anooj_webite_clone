/* ============================================================================
 * dashboard_chart_api.js
 *
 * API integration layer for chart data fetching and caching
 *
 * UPDATED: 2026-01-12
 *
 * PERFORMANCE OVERVIEW  → website-test (static/sample API)
 * CHANNEL ANALYTICS     → scalex-adapter (real adaptor API)
 *
 * ========================================================================== */

console.log(
  "%c[ScaleX] dashboard_chart_api.js LOADED (dual API routing enabled)",
  "color:#22c55e;font-weight:bold"
);

/* ---------------------------------------------------------------------------
 * SECTION 1: API CONFIGURATION & CONSTANTS
 * ---------------------------------------------------------------------------*/

// 🔹 Performance Overview (static/sample)
const SCALEX_API_BASE_PERF =
  "https://website-test-268453003438.europe-west1.run.app/api/v1/chart";

// 🔹 Channel & Campaign Analytics (real adaptor)
const SCALEX_API_BASE_CHANNEL =
  "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data";

let CURRENT_PAGE =
  sessionStorage.getItem("activePage") || "performance-overview";

/**
 * Resolve correct API base based on active page
 */
function getApiBaseForPage(page) {
  if (page === "channel-campaign-analytics") {
    return SCALEX_API_BASE_CHANNEL;
  }
  return SCALEX_API_BASE_PERF; // default → performance overview
}

/* ---------------------------------------------------------------------------
 * SECTION 2: FILTER MANAGEMENT
 * ---------------------------------------------------------------------------*/

function getStoredFilters() {
  let stored = sessionStorage.getItem("dateRange");
  let parsed = stored ? JSON.parse(stored) : null;

  return {
    dateRange: parsed?.dateRange || null,
    comparison: parsed?.comparison || false,
    timestamp: parsed?.timestamp || new Date().toISOString(),
    devices: sessionStorage.getItem("filter_devices") || null,
    channels: sessionStorage.getItem("filter_channels") || null,
    locations: sessionStorage.getItem("filter_locations") || null
  };
}

/* ---------------------------------------------------------------------------
 * SECTION 3: API PAYLOAD CONSTRUCTION
 * ---------------------------------------------------------------------------*/

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
 * SECTION 4: API REQUEST & RESPONSE HANDLING
 * ---------------------------------------------------------------------------*/

async function fetchChartData(chartId) {
  const basePayload = buildPayload();

  const isChannelAnalytics =
    CURRENT_PAGE === "channel-campaign-analytics";

  // ✅ Correct endpoints
  const url = isChannelAnalytics
    ? "https://scalex-adapter-268453003438.europe-west1.run.app/chart-data"
    : `https://website-test-268453003438.europe-west1.run.app/api/v1/chart/${chartId}`;

  // ✅ Correct payloads
  const payload = isChannelAnalytics
    ? {
        chart_name: chartId,   // adaptor contract
        ...basePayload
      }
    : basePayload;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let json;
    try {
      json = await res.json();
    } catch {
      console.error(`[ScaleX] Invalid JSON for ${chartId}`);
      return { success: false, error: "Invalid JSON from server" };
    }

    if (!res.ok) {
      console.error(`[ScaleX] API error (${chartId})`, json);
      return { success: false, error: json };
    }

    return json;
  } catch (err) {
    console.error(`[ScaleX] Network error (${chartId})`, err);
    return { success: false, error: err?.message || String(err) };
  }
}


/* ---------------------------------------------------------------------------
 * SECTION 5: PAGE REFRESH
 * ---------------------------------------------------------------------------*/

window.showLoader = function () {
  const el = document.getElementById("loader");
  if (el) el.classList.remove("hidden");
};

window.hideLoader = function () {
  const el = document.getElementById("loader");
  if (el) el.classList.add("hidden");
};

async function refreshPage(pageName = CURRENT_PAGE) {
  CURRENT_PAGE = pageName;
  sessionStorage.setItem("activePage", CURRENT_PAGE);

  if (window.showLoader) window.showLoader();

  try {
    const chartList = getChartsForPage(pageName);

    const promises = chartList.map(chartId =>
      fetchChartData(chartId).then(response => ({ chartId, response }))
    );

    const results = await Promise.allSettled(promises);

    for (const res of results) {
      if (res.status === "fulfilled") {
        const { chartId, response } = res.value;
        if (window.renderChartFromAPI) {
          window.renderChartFromAPI(chartId, response);
        }
      }
    }
  } finally {
    if (window.hideLoader) window.hideLoader();
  }
}

window.refreshPage = refreshPage;

/* ---------------------------------------------------------------------------
 * SECTION 6: PAGE-TO-CHART MAPPING
 * ---------------------------------------------------------------------------*/

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

/* --------------------------------------------------------------------------
 * 8.1: HELPER FUNCTIONS
 * ----------------------------------------------------------------------- */

/**
 * Store Chart.js instances for KPI sparklines so we can destroy and
 * recreate them safely whenever filters / tabs change.
 */
const SCALEX_KPI_CHARTS = {
    revenue: null,
    spend: null,
    roas: null,
    roi: null
};

/**
 * Render (or re-render) a KPI sparkline inside the given canvas element.
 *
 * @param {HTMLCanvasElement} canvasEl   – target canvas
 * @param {number[]}          values     – numeric series for the sparkline
 * @param {string}            strokeColor
 * @param {string}            fillColor
 * @param {string}            cacheKey   – one of: 'revenue' | 'spend' | 'roas' | 'roi'
 */
function renderKPISparkline(canvasEl, values, strokeColor, fillColor, cacheKey) {
    if (!canvasEl || !window.Chart) {
        console.warn('renderKPISparkline: missing canvas or Chart.js');
        return;
    }
    if (!Array.isArray(values) || values.length === 0) {
        console.warn('renderKPISparkline: empty or invalid values');
        return;
    }

    const ctx = canvasEl.getContext('2d');

    // Destroy previous chart instance if we have one
    if (cacheKey && SCALEX_KPI_CHARTS[cacheKey]) {
        try {
            SCALEX_KPI_CHARTS[cacheKey].destroy();
        } catch (e) {
            console.warn('KPI chart destroy failed for', cacheKey, e);
        }
        SCALEX_KPI_CHARTS[cacheKey] = null;
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: values.map((_, i) => i + 1),
            datasets: [{
                data: values,
                borderColor: strokeColor,
                backgroundColor: fillColor,
                fill: true,
                tension: 0.35,
                borderWidth: 1,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });

    if (cacheKey) {
        SCALEX_KPI_CHARTS[cacheKey] = chart;
    }
}


/* ------------------------------------------------------------------
 * KPI Card Updater (Reusable)
 * ------------------------------------------------------------------ */

/**
 * Updates KPI card numbers + change + sparkline for a given KPI type.
 *
 * @param {Object} data - API data: { currentValue, previousValue, deltaPercent, sparkline }
 * @param {string} currId - DOM id for current value
 * @param {string} prevId - DOM id for previous value
 * @param {string} changeId - DOM id for change percent element
 * @param {string} canvasId - DOM id for sparkline canvas
 * @param {string} kpiType - 'revenue' | 'spend' | 'roas' | 'roi'
 */
function updateKpiCards(data, currId, prevId, changeId, canvasId, kpiType) {
    // --- KPI configuration (single source of truth) ---
    const kpiConfig = {
        revenue: {
            prefix: '₹ ',
            suffix: '',
            prevPrefix: 'Prev: ₹ ',
            invert: false,
            format: (v) => formatNumber(v),
            color: SCALEX_COLORS.kpiRevenue,
            fill: SCALEX_COLORS.kpiRevenueFill
        },
        spend: {
            prefix: '₹ ',
            suffix: '',
            prevPrefix: 'Prev: ₹ ',
            invert: true, // Spend up = bad
            format: (v) => formatNumber(v),
            color: SCALEX_COLORS.kpiSpend,
            fill: SCALEX_COLORS.kpiSpendFill
        },
        roas: {
            prefix: '',
            suffix: 'x',
            prevPrefix: 'Prev: ',
            invert: false,
            format: (v) => formatOneDecimal(v),
            color: SCALEX_COLORS.kpiRoas,
            fill: SCALEX_COLORS.kpiRoasFill
        },
        roi: {
            prefix: '',
            suffix: '%',
            prevPrefix: 'Prev: ',
            invert: false,
            format: (v) => formatOneDecimal(v),
            color: SCALEX_COLORS.kpiRoi,
            fill: SCALEX_COLORS.kpiRoiFill
        }
    };

    const cfg = kpiConfig[kpiType];
    if (!cfg) return;

    const currEl = document.getElementById(currId);
    const prevEl = document.getElementById(prevId);
    const changeEl = document.getElementById(changeId);
    const chartCanvas = document.getElementById(canvasId);

    // Current
    if (currEl && typeof data.currentValue === 'number') {
        currEl.textContent = cfg.prefix + cfg.format(data.currentValue) + cfg.suffix;
    }

    // Previous
    if (prevEl && typeof data.previousValue === 'number') {
        prevEl.textContent = cfg.prevPrefix + cfg.prefix + cfg.format(data.previousValue) + cfg.suffix;
        // Note: For revenue/spend, cfg.prevPrefix already contains ₹. For roas/roi it doesn't.
        // So we avoid double ₹ by handling it cleanly below:
        if (kpiType === 'revenue' || kpiType === 'spend') {
            prevEl.textContent = cfg.prevPrefix + cfg.format(data.previousValue) + cfg.suffix;
        }
    }

    // Change
    if (changeEl && typeof data.deltaPercent === 'number') {
        applyChange(changeEl, data.deltaPercent, cfg.invert);
    }

    // Sparkline
    if (chartCanvas && Array.isArray(data.sparkline) && data.sparkline.length > 0) {
        renderKPISparkline(
            chartCanvas,
            data.sparkline,
            cfg.color,
            cfg.fill,
            kpiType
        );
    }
}


// ---------------------------------------------------------------------
// SMART ALERTS – Generic DOM updater
// ---------------------------------------------------------------------

function updateSmartAlertCard(cardId, cardLabel, data) {
    const card = document.getElementById(cardId);
    if (!card || !data) return;

    const {
        severity,
        icon,
        mainPrefix,
        mainHighlight,
        mainSuffix,
        subtext
        // metrics / channels are extra, used later if needed
    } = data;

    const labelEl     = card.querySelector('.alert-text-label');
    const prefixEl    = card.querySelector('.alert-main-prefix');
    const highlightEl = card.querySelector('.alert-main-highlight');
    const suffixEl    = card.querySelector('.alert-main-suffix');
    const subtextEl   = card.querySelector('.alert-text-sub');
    const symbolEl    = card.querySelector('.alert-symbol');

    if (!labelEl || !prefixEl || !highlightEl || !suffixEl || !subtextEl || !symbolEl) {
        console.warn('[ScaleX] Smart alert DOM structure missing in card:', cardId);
        return;
    }

    // 1) Static label (title of card)
    labelEl.textContent = cardLabel;

    // 2) Text content from API
    prefixEl.textContent    = mainPrefix || '';
    highlightEl.textContent = mainHighlight || '';
    suffixEl.textContent    = mainSuffix || '';
    subtextEl.textContent   = subtext || '';

    // 3) Severity-based styling
    const { highlightClass, symbolClass, fallbackIcon } = mapSeverityToClasses(severity);

    // Remove old highlight color classes
    highlightEl.classList.remove(
        'alert-highlight-green',
        'alert-highlight-red',
        'alert-highlight-amber',
        'alert-highlight-sky'
    );
    highlightEl.classList.add(highlightClass);

    // Remove old symbol color classes
    symbolEl.classList.remove(
        'alert-symbol--green',
        'alert-symbol--red',
        'alert-symbol--amber',
        'alert-symbol--sky'
    );
    symbolEl.classList.add(symbolClass);

    // 3b) Apply border color based on severity
    card.classList.remove(
        'alert-card--positive',
        'alert-card--negative',
        'alert-card--warning',
        'alert-card--info'
    );
    card.classList.add(`alert-card--${severity}`);

    // 4) Icon (use API icon if present, else severity default)
    const iconChar = mapIconCode(icon) || fallbackIcon;
    symbolEl.textContent = iconChar;
}

// Update "Spend → Revenue → ROI → ROAS" funnel chart from API response.
function updatePerfFunnelFromAPI(apiData) {
    const chart = window.scalexPerfFunnelChart;

    if (!chart) {
        console.warn('Perf funnel chart instance not ready yet, skipping API update.');
        return;
    }

    const labels = Array.isArray(apiData.labels) && apiData.labels.length
        ? apiData.labels
        : chart.data.labels;

    const datasets = Array.isArray(apiData.datasets) ? apiData.datasets : [];

    // Update X-axis labels from backend
    chart.data.labels = labels;

    /**
     * Helper: build money + ratio arrays for one channel
     * based on label match ("Meta", "Google", "LinkedIn").
     */
    function splitChannel(channelName) {
        const ds = datasets.find(d =>
            typeof d.label === 'string' &&
            d.label.toLowerCase().includes(channelName)
        );

        // If nothing found, keep existing data (so chart doesn’t break)
        if (!ds || !Array.isArray(ds.data)) {
            console.warn(`No dataset found for channel "${channelName}" in funnel API data.`);
            return {
                money: [],
                ratio: []
            };
        }

        const money = [];
        const ratio = [];

        labels.forEach((stage, idx) => {
            const v = ds.data[idx];

            if (stage === 'Spend' || stage === 'Revenue') {
                // Money axis (₹)
                money.push(typeof v === 'number' ? v : null);
                ratio.push(null);
            } else if (stage === 'ROAS' || stage === 'ROI') {
                // Ratios axis (%), we multiply by 100 because
                // the existing chart expects "270" to mean "2.7x" etc.
                const percent = (typeof v === 'number') ? v * 100 : null;
                money.push(null);
                ratio.push(percent);
            } else {
                // Unknown stage – keep nulls
                money.push(null);
                ratio.push(null);
            }
        });

        return { money, ratio };
    }

    // Build series for Meta / Google / LinkedIn
    const meta     = splitChannel('meta');
    const google   = splitChannel('google');
    const linkedin = splitChannel('linkedin');

    const dsets = chart.data.datasets;

    // 0,1,2 = money; 3,4,5 = ratio
    if (dsets[0]) dsets[0].data = meta.money;
    if (dsets[1]) dsets[1].data = google.money;
    if (dsets[2]) dsets[2].data = linkedin.money;

    if (dsets[3]) dsets[3].data = meta.ratio;
    if (dsets[4]) dsets[4].data = google.ratio;
    if (dsets[5]) dsets[5].data = linkedin.ratio;

    chart.update();
}

// Update "Blended CAC vs Paid CAC" chart from API response.
function updateBlendedPaidCACFromAPI(apiData) {
    const chart = window.scalexBlendedPaidCACChart;

    if (!chart) {
        console.warn('Blended vs Paid CAC chart instance not ready yet, skipping API update.');
        return;
    }

    const labels = Array.isArray(apiData.labels) && apiData.labels.length
        ? apiData.labels
        : chart.data.labels;

    const incomingDatasets = Array.isArray(apiData.datasets) ? apiData.datasets : [];

    // Update X-axis labels from backend
    chart.data.labels = labels;

    // Find incoming series by label
    const blendedDs = incomingDatasets.find(d =>
        typeof d.label === 'string' &&
        d.label.toLowerCase().includes('blended')
    );
    const paidDs = incomingDatasets.find(d =>
        typeof d.label === 'string' &&
        d.label.toLowerCase().includes('paid')
    );

    // Our existing chart structure:
    // dataset[0] → Blended CAC
    // dataset[1] → Paid CAC
    const dsets = chart.data.datasets;

    if (dsets[0] && blendedDs && Array.isArray(blendedDs.data)) {
        dsets[0].data = blendedDs.data.slice(); // copy array for safety
    }

    if (dsets[1] && paidDs && Array.isArray(paidDs.data)) {
        dsets[1].data = paidDs.data.slice();
    }

    chart.update();
}

// Update CAC trend line chart (Meta / Google / LinkedIn)
function updateCacTrendByChannelFromAPI(apiData) {
    // Change this variable to your actual chart instance name
    const chart = window.scalexCacTrendByChannelChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    // We only replace the .data arrays, keep colors/tension from original config
    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    chart.update();
}

// Update ROI by funnel stage chart (Lead, MQL, SQL, Converted)
function updatePaidRoiByStageFromAPI(apiData) {
    // Use your real chart instance here
    const chart = window.scalexPaidRoiByStageChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    chart.update();
}

// Update marketing-influenced pipeline value over time
function updatePipelineValueFromAPI(apiData) {
    // Change to your actual chart name
    const chart = window.scalexPipelineValueChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets) && datasets[0] && chart.data.datasets[0]) {
        chart.data.datasets[0].data = datasets[0].data || [];
    }

    chart.update();
}

function updateLtvCacRatioFromAPI(data) {
    if (!data) return;

    const { ltv, cac, ratio, status } = data;

    // 1. Locate the card rendered by dashboard_charts.js
    // const card = document.querySelector('.detail-card[data-chart-id="perf_ltv_cac_ratio"]');
    const card = document.querySelector('[data-chart-id="perf_ltv_cac_ratio"]');
    if (!card) {
        console.warn("LTV:CAC card not found in DOM");
        return;
    }

    // 2. Update ratio element
    const ratioEl = card.querySelector('.detail-ltv-ratio');
    if (ratioEl) {
        ratioEl.textContent = `${ratio.toFixed(1)} : 1`;
    }

    // 3. Update subtext (LTV + CAC values)
    const subEl = card.querySelector('.detail-ltv-subtext');
    if (subEl) {
        subEl.textContent = `Avg LTV: ${formatRupee(ltv)} · CAC: ${formatRupee(cac)}`;
    }

    // 4. Update badge (status)
    const badge = card.querySelector('.detail-ltv-badge');
    if (badge) {
        // Remove existing status modifiers
        badge.classList.remove(
            'detail-ltv-badge--healthy',
            'detail-ltv-badge--warning',
            'detail-ltv-badge--risk'
        );

        // Add new modifier
        badge.classList.add(`detail-ltv-badge--${status}`);

        // Update text
        badge.textContent =
            status === 'healthy' ? 'Healthy' :
            status === 'warning' ? 'Watch' :
            'At Risk';
    }
}

// Update LTV by cohort chart (bar or line)
function updateLtvByCohortFromAPI(apiData) {
    const chart = window.scalexLtvByCohortChart; 
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets) && datasets[0] && chart.data.datasets[0]) {
        chart.data.datasets[0].data = datasets[0].data || [];
    }

    chart.update();
}

// Update attribution accuracy vs baseline chart
function updateAttributionAccuracyFromAPI(apiData) {
    const chart = window.scalexAttributionAccuracyChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    chart.update();
}

// Update top channels by ROAS bar chart
function updateTopChannelsRoasFromAPI(apiData) {
    const chart = window.scalexTopChannelsRoasChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets) && datasets[0] && chart.data.datasets[0]) {
        chart.data.datasets[0].data = datasets[0].data || [];
    }

    chart.update();
}

// Update new vs repeat revenue mix chart (stacked %)
function updateNewVsRepeatMixFromAPI(apiData) {
    const chart = window.scalexNewVsRepeatMixChart;
    if (!chart) return;

    const { labels, datasets, tooltipRevenue } = apiData || {};

    // Labels
    chart.data.labels = labels || [];

    // Find the correct datasets by label (safer than relying on index order)
    if (Array.isArray(datasets)) {
        const newDs = datasets.find(ds =>
            typeof ds.label === 'string' && ds.label.toLowerCase().includes('new')
        );
        const repeatDs = datasets.find(ds =>
            typeof ds.label === 'string' && ds.label.toLowerCase().includes('repeat')
        );

        if (newDs) {
            chart.data.datasets[0].data = newDs.data || [];
        }
        if (repeatDs) {
            chart.data.datasets[1].data = repeatDs.data || [];
        }
    }

    // 🔹 Update tooltip revenue data on chart instance
    chart.__tooltipRevenue = {
        new: (tooltipRevenue && tooltipRevenue.new) || [],
        repeat: (tooltipRevenue && tooltipRevenue.repeat) || []
    };

    chart.update();
}


function updateChannelCplCacRoasFromAPI(apiData) {
    const chart = window.scalexChannelCplCacRoasChart;
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    chart.update();
}

// Update Campaign ROI Bubble chart from API response
function updateCampaignRoiBubbleFromAPI(apiData) {
    const chart = window.scalexCampaignRoiBubbleChart;
    if (!chart || !apiData) return;

    const { datasets = [], currency = 'INR' } = apiData;

    if (!Array.isArray(datasets) || datasets.length === 0) {
        console.warn('[ScaleX] No datasets returned for campaign ROI bubble chart');
        chart.data.datasets[0].data = [];
        chart.update();
        return;
    }

    const bubblePoints = datasets.map((ds) => {
        const label = ds.label || 'Campaign';
        const point = ds.point || {};

        const roiPercent = Number(point.roiPercent) || 0;
        const spend = Number(point.spend) || 0;         // in ₹
        const revenue = Number(point.revenue) || 0;     // in ₹
        const incrementalRoasPercent = Number(point.incrementalRoasPercent) || 0;

        // Convert to Lakhs for Y-axis + tooltip
        const spendLakh = spend / 100000;
        const revenueLakh = revenue / 100000;

        // Bubble radius: keep your existing logic style
        const radius = Math.max(8, Math.sqrt(Math.max(revenueLakh, 0)) * 3);

        // Try to split channel + campaign from label like "Meta – Lead Gen"
        const [channelPart, ...rest] = label.split('–');
        const channel = (channelPart || '').trim();
        const name = rest.length ? rest.join('–').trim() : label;

        return {
            x: roiPercent,
            y: spendLakh,
            r: radius,
            _meta: {
                name,
                channel,
                roi: roiPercent,
                spendLakh,
                revenueLakh,
                incrRoas: incrementalRoasPercent,
                currency
            }
        };
    });

    // Preserve styling from original dataset, only replace `data`
    if (!chart.data.datasets || chart.data.datasets.length === 0) {
        chart.data.datasets = [{
            label: 'Campaigns',
            data: bubblePoints
        }];
    } else {
        chart.data.datasets[0].data = bubblePoints;
        chart.data.datasets[0].label = 'Campaigns';
    }

    // Optional: store currency on chart if you ever want it in tooltip
    chart.__currency = currency;

    chart.update();
}

function updateChannelTouchpointSplitFromAPI(apiData) {
    const chart = window.scalexTouchpointSplitChart; //
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    chart.update();
}

function updateAudienceRoasFromAPI(apiData) {
    const chart = window.scalexAudienceRoasChart; //
    if (!chart) return;

    const { labels, datasets } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets) && datasets[0] && chart.data.datasets[0]) {
        chart.data.datasets[0].data = datasets[0].data || [];
    }

    chart.update();
}

// Update "Lead Quality Score by Channel" from API
function updateChannelLeadQualityFromAPI(apiData) {
    const chart = window.scalexLeadQualityChart;
    if (!chart || !apiData) return;

    const { labels, datasets } = apiData;
    if (!Array.isArray(datasets) || !datasets[0]) return;

    const scores = datasets[0].data || [];

    chart.data.labels = labels || [];
    chart.data.datasets[0].data = scores;

    // Recompute colors based on score buckets
    const colors = scores.map((score) => {
        if (score >= 80) return SCALEX_COLORS.good;
        if (score >= 70) return SCALEX_COLORS.warning;
        return SCALEX_COLORS.bad;
    });

    chart.data.datasets[0].backgroundColor = colors;
    chart.data.datasets[0].borderColor = colors;

    chart.update();
}

function updateChannelSpendEfficiencyFromAPI(apiData) {
    const chart = window.scalexSpendEfficiencyChart; 
    if (!chart) return;

    const { labels, datasets, index } = apiData;

    chart.data.labels = labels || [];

    if (Array.isArray(datasets)) {
        datasets.forEach((ds, idx) => {
            if (chart.data.datasets[idx]) {
                chart.data.datasets[idx].data = ds.data || [];
            }
        });
    }

    // Optional: store index array on chart for custom tooltip / annotation
    chart.__efficiencyIndex = index || [];

    chart.update();
}

// Update Creative Performance metric tiles from API response
function updateCreativePerfTilesFromAPI(apiData) {
    if (!apiData || !apiData.ctr || !apiData.cpc || !apiData.engagement) return;

    const tiles = document.querySelectorAll('.metric-tiles-wrapper .metric-tile');
    if (!tiles.length) return;

    const [ctrTile, cpcTile, engagementTile] = tiles;

    function updateTile(tile, type, metricData) {
        if (!tile || !metricData) return;

        const valueEl = tile.querySelector('.metric-tile-value');
        const deltaEl = tile.querySelector('.metric-tile-delta');
        if (!valueEl || !deltaEl) return;

        // Reset direction classes
        deltaEl.classList.remove('alert-symbol--green', 'alert-symbol--red', 'alert-symbol--sky');

        const arrow = mapIconCode(metricData.direction);
        const dirClass = mapIconColor(metricData.direction);
        deltaEl.classList.add(dirClass);

        if (type === 'ctr' || type === 'engagement') {
            // % value + percentage-points delta
            const current = Number(metricData.currentPercent).toFixed(1);
            const deltaPoints = Number(metricData.deltaPoints).toFixed(1);

            valueEl.textContent = `${current.toLocaleString()}%`;
            deltaEl.textContent = `${arrow} ${deltaPoints.toLocaleString()}pp vs prev`;
        } else if (type === 'cpc') {
            // Currency value + % delta
            const current = Number(metricData.currentValue).toFixed(1);
            const deltaPercent = Number(metricData.deltaPercent).toFixed(1);

            // Always show as ₹; backend already decided currency
            valueEl.textContent = `₹ ${current.toLocaleString()}`;
            deltaEl.textContent = `${arrow} ${Math.abs(deltaPercent).toFixed(1)}% vs prev`;
        }
    }

    updateTile(ctrTile, 'ctr', apiData.ctr);
    updateTile(cpcTile, 'cpc', apiData.cpc);
    updateTile(engagementTile, 'engagement', apiData.engagement);
}

// Update Channel Performance Snapshot table from API
function updateChannelSnapshotTableFromAPI(apiData) {
    if (!apiData) return;

    const { columns, rows } = apiData;
    if (!Array.isArray(rows) || !rows.length) return;

    // Find the table body
    const tbody = document.querySelector('.channel-performance-table tbody');
    if (!tbody) return;

    // Clear existing rows
    tbody.innerHTML = '';

    // Build a column index lookup for safety (in case order changes)
    const colIndex = {
        channel: columns ? columns.indexOf('channel') : 0,
        spend: columns ? columns.indexOf('spend') : 1,
        revenue: columns ? columns.indexOf('revenue') : 2,
        cpl: columns ? columns.indexOf('cpl') : 3,
        cac: columns ? columns.indexOf('cac') : 4,
        roas: columns ? columns.indexOf('roas') : 5,
        roiPercent: columns ? columns.indexOf('roiPercent') : 6,
        leadQuality: columns ? columns.indexOf('leadQuality') : 7
    };

    // Helper to read a cell safely
    const getCell = (row, key) => {
        const idx = colIndex[key];
        return idx >= 0 && idx < row.length ? row[idx] : null;
    };

    rows.forEach(row => {
        const channel     = getCell(row, 'channel') ?? '';
        const spend       = getCell(row, 'spend');
        const revenue     = getCell(row, 'revenue');
        const cpl         = getCell(row, 'cpl');
        const cac         = getCell(row, 'cac');
        const roas        = getCell(row, 'roas');
        const roiPercent  = getCell(row, 'roiPercent');
        const leadQuality = getCell(row, 'leadQuality');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${channel}</td>
            <td>${spend != null ? formatRupee(spend) : '-'}</td>
            <td>${revenue != null ? formatRupee(revenue) : '-'}</td>
            <td>${cpl != null ? formatRupee(cpl) : '-'}</td>
            <td>${cac != null ? formatRupee(cac) : '-'}</td>
            <td>${roas != null ? Number(roas).toFixed(2) + 'x' : '-'}</td>
            <td>${roiPercent != null ? Number(roiPercent).toFixed(0) + '%' : '-'}</td>
            <td>${leadQuality != null ? leadQuality : '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    // Optional: store latest data for CSV export handler
    window.scalexChannelSnapshotLatest = {
        columns,
        rows,
        currency: apiData.currency || 'INR'
    };
}


/* ---------------------------------------------------------------------------
 * SECTION 8.2: RENDER DISPATCHER
 * ---------------------------------------------------------------------------*/

window.renderChartFromAPI = function renderChartFromAPI(chartId, response) {
  console.debug("📊 renderChartFromAPI →", chartId, response);

  if (!response || response.success === false) {
    console.warn(`Chart ${chartId} failed`, response?.error);
    return;
  }

  const data = response.data || {};

  switch (chartId) {
    case "kpi_revenue":
      updateKpiCards(data, "rev-current", "rev-prev", "rev-change", "rev-chart", "revenue");
      break;
    case "kpi_ad_spend":
      updateKpiCards(data, "spend-current", "spend-prev", "spend-change", "spend-chart", "spend");
      break;
    case "kpi_roas":
      updateKpiCards(data, "roas-current", "roas-prev", "roas-change", "roas-chart", "roas");
      break;
    case "kpi_roi":
      updateKpiCards(data, "roi-current", "roi-prev", "roi-change", "roi-chart", "roi");
      break;

    case "alert_performance_gain":
      updateSmartAlertCard("alert-card-performance-gain", "Performance Gain", data);
      break;
    case "alert_channel_mix":
      updateSmartAlertCard("alert-card-channel-mix", "Channel Mix Efficiency", data);
      break;
    case "alert_budget_reallocation":
      updateSmartAlertCard("alert-card-budget-risk", "Budget / Risk", data);
      break;

    case "perf_funnel_by_channel":
      updatePerfFunnelFromAPI(data);
      break;
    case "perf_cac_blended_vs_paid":
      updateBlendedPaidCACFromAPI(data);
      break;
    case "perf_cac_trend_by_channel":
      updateCacTrendByChannelFromAPI(data);
      break;
    case "perf_paid_roi_by_stage":
      updatePaidRoiByStageFromAPI(data);
      break;
    case "perf_pipeline_value":
      updatePipelineValueFromAPI(data);
      break;
    case "perf_ltv_cac_ratio":
      updateLtvCacRatioFromAPI(data);
      break;
    case "perf_ltv_by_cohort":
      updateLtvByCohortFromAPI(data);
      break;
    case "perf_attribution_accuracy":
      updateAttributionAccuracyFromAPI(data);
      break;
    case "perf_top_channels_roas":
      updateTopChannelsRoasFromAPI(data);
      break;
    case "perf_new_vs_repeat_mix":
      updateNewVsRepeatMixFromAPI(data);
      break;

    case "channel_cpl_cac_roas":
      updateChannelCplCacRoasFromAPI(data);
      break;
    case "campaign_roi_bubble":
      updateCampaignRoiBubbleFromAPI(data);
      break;
    case "channel_touchpoint_split":
      updateChannelTouchpointSplitFromAPI(data);
      break;
    case "audience_roas":
      updateAudienceRoasFromAPI(data);
      break;
    case "channel_lead_quality":
      updateChannelLeadQualityFromAPI(data);
      break;
    case "channel_spend_efficiency":
      updateChannelSpendEfficiencyFromAPI(data);
      break;
    case "creative_perf_tiles":
      updateCreativePerfTilesFromAPI(data);
      break;
    case "channel_snapshot_table":
      updateChannelSnapshotTableFromAPI(data);
      break;

    default:
      console.warn(`No renderer implemented for chartId="${chartId}"`);
  }
};

/* ============================================================================
 * END OF dashboard_chart_api.js
 * ========================================================================== */
