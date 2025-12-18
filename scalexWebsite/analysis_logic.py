import pymysql
from logger_config import logger


def get_kpi_data(DB_CONFIG):
    """
    Calculate the KPIs based on the data in kpi_aggregate_table.
    """
    try:
        connection = pymysql.connect(
            host=DB_CONFIG['db_host'],
            user=DB_CONFIG['db_user'],
            password=DB_CONFIG['db_password'],
            database=DB_CONFIG['db_name'],
            port=int(DB_CONFIG['db_port']),
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            # Fetch required data from the kpi_aggregate_table
            cursor.execute("SELECT metric_name, metric_value, metric_value_string FROM kpi_aggregate_table;")
            raw_data = cursor.fetchall()

            # Process raw data into a dictionary
            metrics = {row['metric_name']: row for row in raw_data}

            # Calculate KPIs
            kpis = {}

            # KPI 1: Click-Through Rate (CTR)
            total_clicks = metrics.get("total_clicks", {}).get("metric_value", 0)
            total_page_views = metrics.get("total_page_views", {}).get("metric_value", 1)
            kpis["Click-Through Rate"] = f'{round((total_clicks / total_page_views) * 100, 2)}%'

            # KPI 2: Bounce Rate
            single_page_sessions = metrics.get("single_page_sessions", {}).get("metric_value", 0)
            total_sessions = metrics.get("total_sessions", {}).get("metric_value", 1)
            kpis["Bounce Rate"] = f'{round((single_page_sessions / total_sessions) * 100, 2)}%'

            # KPI 3: Average Session Duration
            total_session_duration = metrics.get("total_session_duration", {}).get("metric_value", 0)
            kpis["Avg Session Duration"] = f'{round(total_session_duration / total_sessions / 1000 / 60, 2)} mins'

            # KPI 4: Average Time on Page
            total_time_on_page = metrics.get("total_time_on_page", {}).get("metric_value", 0)
            kpis["Avg Time On Page"] = f'{round(total_time_on_page / total_page_views / 1000 / 60, 2)} mins'

            # KPI 5: Pages Per Session
            kpis["Pages Per Session"] = round(total_page_views / total_sessions, 2)

            # KPI 6: Event Engagement Rate
            total_interactions = metrics.get("total_interactions", {}).get("metric_value", 0)
            kpis["Event Engagement Rate"] = round(total_interactions / total_sessions, 2)

            # KPI 7: Average Page Load Time
            total_page_load_time = metrics.get("total_page_load_time", {}).get("metric_value", 0)
            kpis["Avg Page Load Time"] = f'{round(total_page_load_time / total_page_views, 2)} ms'

            # KPI 8: Form Submission Rate
            total_form_submissions = metrics.get("total_form_submissions", {}).get("metric_value", 0)
            kpis["Form Submission Rate"] = f'{round((total_form_submissions / total_sessions) * 100, 2)}%'

            # KPI 9: Top Engaged Country
            kpis["Top Engaged Country"] = metrics.get("most_engaged_country", {}).get("metric_value_string", "N/A")

            # KPI 10: Top Engaged Region/State
            kpis["Top Engaged Region"] = metrics.get("most_engaged_state", {}).get("metric_value_string", "N/A")

            # KPI 11: Top Engaged City
            kpis["Top Engaged City"] = metrics.get("most_engaged_city", {}).get("metric_value_string", "N/A")

            # KPI 12: Average Interaction Per User
            total_users = metrics.get("total_users", {}).get("metric_value", 1)
            kpis["Avg Interactions Per User"] = round(total_interactions / total_users, 2)

            # KPI 13: Engaged User (more than 5 mins)
            kpis['Engaged Users'] = metrics.get("engaged_users", {}).get("metric_value", 0)

            # KPI 14: Average scroll depth
            kpis['Avg scroll depth'] = f'{round(metrics.get("avg_scroll_depth", {}).get("metric_value", 0), 2)}%'

            # KPI 15: Exit rate
            total_exit_pages = metrics.get("total_exit_pages", {}).get("metric_value", 0)
            kpis['Exit rate'] = f'{round(total_exit_pages / total_sessions * 100, 2)}%'
            
            # KPI 16: Top Landing Page
            kpis['Top Landing Page'] = metrics.get("top_landing_page", {}).get("metric_value_string", "N/A")
            
            # KPI 17: Top Exit Page
            kpis['Top Eixt Page'] = metrics.get("top_exit_page", {}).get("metric_value_string", "N/A")

            return kpis

    except Exception as e:
        logger.error(f"Error calculating KPIs: {e}")
        return {}

    finally:
        if connection:
            connection.close()


def get_campaign_kpi_data(DB_CONFIG):
    """
    Calculate the KPIs based on the data in kpi_aggregate_table.
    """
    try:
        connection = pymysql.connect(
            host=DB_CONFIG['db_host'],
            user=DB_CONFIG['db_user'],
            password=DB_CONFIG['db_password'],
            database=DB_CONFIG['db_name'],
            port=int(DB_CONFIG['db_port']),
            cursorclass=pymysql.cursors.DictCursor
        )

        with connection.cursor() as cursor:
            # Fetch required data from the kpi_aggregate_table
            cursor.execute("SELECT metric_name, metric_value, metric_value_string FROM kpi_aggregate_table;")
            raw_data = cursor.fetchall()

            # Process raw data into a dictionary
            metrics = {row['metric_name']: row for row in raw_data}

            # Calculate KPIs
            kpis = {}

            # KPI 1: Impressions - Total number of times a campaign or ad was viewed.
            impressions = metrics.get("impressions", {}).get("metric_value", 1)
            kpis["Impressions"] = impressions

            # KPI 2: Clicks on Campaign - Total clicks from users interacting with campaign-related links.
            campaign_clicks = metrics.get("campaign_clicks", {}).get("metric_value", 0)
            kpis["Clicks on Campaign"] = campaign_clicks

            # KPI 3: Click-Through Rate (CTR) - Formula: (Clicks / Impressions) * 100.
            kpis["Click-Through Rate (CTR)"] = f'{round(campaign_clicks / impressions * 100, 2)}%'

            # KPI 4: Campaign Conversion Rate - Percentage of sessions who completed a defined conversion action after interacting with a campaign.
            campaign_conversion = metrics.get("campaign_conversion", {}).get("metric_value", 0)
            campaign_sessions = metrics.get("campaign_sessions", {}).get("metric_value", 1)
            kpis["Campaign Conversion Rate (CCR)"] = f'{round(campaign_conversion / campaign_sessions * 100, 2)}%'

            # KPI 5: Campaign Engagement Rate - Percentage of users who engaged with a campaign out of total impressions.
            engaged_users = metrics.get("engaged_users", {}).get("metric_value", 0)
            kpis["Campaign Engagement Rate (CER)"] = f'{round(engaged_users / impressions * 100, 2)}%'

            # KPI 6: Bounce Rate from Campaigns - Percentage of users who left the site without interaction after arriving via a campaign.
            campaign_single_page_sessions = metrics.get("campaign_single_page_sessions", {}).get("metric_value", 0)
            kpis["Bounce Rate from Campaigns"] = f'{round(campaign_single_page_sessions / campaign_sessions * 100, 2)}%'

            # KPI 7: Average Session Duration from Campaigns - Average time spent on the website by users coming from campaign sources.
            campaign_session_duration = metrics.get("campaign_session_duration", {}).get("metric_value", 0)
            kpis["Average Session Duration from Campaigns"] = f'{round((campaign_session_duration / 1000 / 60) / campaign_sessions, 2)} mins'

            # KPI 8: Top Campaign Source - Identifies the campaign source driving the most traffic.
            kpis["Top Campaign Source"] = metrics.get("top_campaign_source", {}).get("metric_value_string", "N/A")

            # KPI 9: Top Campaign Medium - Identifies the campaign medium driving the most traffic.
            kpis["Top Campaign Medium"] = metrics.get("top_campaign_medium", {}).get("metric_value_string", "N/A")

            return kpis

    except Exception as e:
        logger.error(f"Error calculating KPIs: {e}")
        return {}

    finally:
        if connection:
            connection.close()
