PERFORMANCE_CHART_RESPONSES = {
    "kpi_revenue": {
        "success": True,
        "data": {
            "currentValue": 2400000,
            "previousValue": 1700000,
            "deltaPercent": 41.2,
            "currency": "INR",
            "sparkline": [58000, 64000, 71000, 78000, 82000, 86000, 90000]
        },
        "error": None
    },

    "kpi_ad_spend": {
        "success": True,
        "data": {
            "currentValue": 670000,
            "previousValue": 640000,
            "deltaPercent": 4.7,
            "currency": "INR",
            "sparkline": [15000, 26000, 19000, 32000, 21000, 34000, 39000]
        },
        "error": None
    },

    "kpi_roas": {
        "success": True,
        "data": {
            "currentValue": 3,
            "previousValue": 2.9,
            "deltaPercent": 3.4,
            "sparkline": [2.5, 3.3, 2.8, 3.4, 2.9, 3.2, 3]
        },
        "error": None
    },

    "kpi_roi": {
        "success": True,
        "data": {
            "currentValue": 120,
            "previousValue": 160,
            "deltaPercent": -25,
            "unit": "percent",
            "sparkline": [170, 165, 155, 145, 135, 125, 120]
        },
        "error": None
    },

    "perf_funnel_by_channel": {
        "success": True,
        "data": {
            "labels": ["Spend", "Revenue", "ROAS", "ROI"],
            "datasets": [
                { "label": "Meta", "data": [240000, 720000, 3, 2] },
                { "label": "Google", "data": [280000, 900000, 3.21, 2.21] },
                { "label": "LinkedIn", "data": [60000, 240000, 4, 3] }
            ],
            "currency": "INR"
        },
        "error": None
    },

    "perf_pipeline_value": {
        "success": True,
        "data": {
            "labels": ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
            "datasets": [
                {
                    "label": "Marketing-influenced pipeline",
                    "data": [1000000, 1100000, 1800000, 2200000, 1900000, 1700000]
                }
            ],
            "currency": "INR"
        },
        "error": None
    },

    "perf_ltv_cac_ratio": {
        "success": True,
        "data": {
            "ltv": 24000,
            "cac": 20000,
            "ratio": 1.2,
            "status": "risk",
            "currency": "INR"
        },
        "error": None
    },

    "perf_cac_trend_by_channel": {
        "success": True,
        "data": {
            "labels": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
            "datasets": [
                { "label": "Meta CAC", "data": [1450, 1420, 1400, 1380, 1360, 1350] },
                { "label": "Google CAC", "data": [1650, 1620, 1600, 1580, 1560, 1550] },
                { "label": "LinkedIn CAC", "data": [2300, 2200, 2100, 2000, 1900, 1850] }
            ],
            "currency": "INR"
        },
        "error": None
    },

    "perf_paid_roi_by_stage": {
        "success": True,
        "data": {
            "labels": ["Lead", "MQL", "SQL", "Converted"],
            "datasets": [
                { "label": "Meta", "data": [40, 90, 140, 190] },
                { "label": "Google", "data": [50, 100, 150, 210] },
                { "label": "LinkedIn", "data": [30, 80, 130, 180] }
            ],
            "unit": "percent"
        },
        "error": None
    },

    "perf_top_channels_roas": {
        "success": True,
        "data": {
            "labels": ["Google Ads", "Meta Ads", "Email", "LinkedIn"],
            "datasets": [{ "label": "ROAS", "data": [3.2, 3.1, 3.0, 3.3] }],
            "unit": "x"
        },
        "error": None
    },

    "perf_new_vs_repeat_mix": {
        "success": True,
        "data": {
            "labels": ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
            "datasets": [
                { "label": "New customers", "data": [35, 34, 33, 32, 31, 30] },
                { "label": "Repeat customers", "data": [65, 66, 67, 68, 69, 70] }
            ],
            "unit": "percent",
            "tooltipRevenue": {
                "new": [1.8, 1.7, 1.6, 1.5, 1.4, 1.3],
                "repeat": [3.2, 3.3, 3.4, 3.5, 3.6, 3.7]
            }
        },
        "error": None
    }
}
