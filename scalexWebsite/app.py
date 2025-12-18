import secrets
import boto3
import json
from datetime import datetime, timezone
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from passlib.context import CryptContext
from analysis_logic import get_kpi_data
from analysis_logic import get_campaign_kpi_data
from logger_config import logger
from db_credentials import get_user_db_connection
from db_credentials import get_verfy_appID

# Initialize FastAPI app
app = FastAPI()

# Generate a secure secret key for session management
SECRET_KEY = secrets.token_urlsafe(32)

# Add SessionMiddleware with security configurations
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    max_age=300,  # Session expiration time in seconds (5 min)
    https_only=True,
    same_site="Strict"
)

# Set up Jinja2 templates
templates = Jinja2Templates(directory='templates')

# Serve static files
app.mount(path='/static', 
          app=StaticFiles(directory='static'), 
          name='static')

# Password hashing
pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_secret_db_cred(secret_name: str):
    """
    Fetch database credentials for the users login db from AWS Secrets Manager.
    :return: A dictionary containing database credentials.
    """
    try:
        secret_manager = boto3.client('secretsmanager', region_name='ap-south-1')
        response = secret_manager.get_secret_value(SecretId=secret_name)
        logger.info(f'Secret data fetched from {secret_name}')
        return json.loads(response['SecretString'])
    except Exception as e:
        logger.error(f'Fetching secret data error: {e}')


@app.get("/get-secret")
def get_secret():
    try:
        secret_name = 'prod/login/database/auth'
        region_name = 'ap-south-1'
        client = boto3.client(
            'secretsmanager',
            region_name=region_name,
        )
        response = client.get_secret_value(SecretId=secret_name)
        return {"secret20": json.loads(response['SecretString'])}
    except Exception as e:
        logger.error(f"Error fetching secret: {e}")
        return {"error": str(e)}


# Health check endpoint
@app.get('/health')
def health_check():
    return JSONResponse(content={'status': 'ok'}, status_code=200)


@app.get('/')
async def root():
    # Redirect to /login
    return RedirectResponse(url='/login')


@app.get(path='/login', response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse('login.html', {'request': request})


@app.post('/login', response_class=HTMLResponse)
async def login(request: Request, app_id: str = Form(...), password: str = Form(...)):
    """
    Handle user login by verifying credentials against the user database using app_id.

    Args:
        request (Request): The FastAPI request object.
        app_id (str): The unique application identifier (username).
        password (str): The user's password.

    Returns:
        HTMLResponse: Redirects to the dashboard on successful login, 
                      or renders the login page with an error message.
    """
    try:
        # Establish connection to the RDS database
        user_db_credentials = get_secret_db_cred('prod/login/database/auth')
        user_db_connection = get_user_db_connection(user_db_credentials)

        with user_db_connection.cursor() as cursor:
            # Query the database for the user with the given app_id
            cursor.execute("SELECT app_id, password_hash FROM users WHERE app_id = %s", (app_id,))
            user = cursor.fetchone()

        # Check if user exists
        if user:
            # Verify password
            if verify_password(password, user['password_hash']):
                # Store user information in the session (e.g., app_id)
                request.session.clear()
                request.session["user"] = app_id
                secret_name = f"app/{app_id}/database/credentials"
                db_config = get_secret_db_cred(secret_name)
                request.session["db_config"] = db_config
                request.session["last_active"] = datetime.now(timezone.utc).isoformat()
                logger.info(f'Session data: {request.session}')
                logger.info(f"User {user['app_id']} logged in successfully.")

                # Redirect to the dashboard on successful login
                return RedirectResponse(url='/dashboard', status_code=302)
            else:
                # If password is incorrect
                logger.warning(f"Incorrect password for app_id: {app_id}.")
                return RedirectResponse(url='/login?error=incorrect_password', status_code=302)
        else:
            # If app_id does not exist
            logger.warning(f"Login failed: app_id {app_id} does not exist.")
            return RedirectResponse(url='/login?error=user_not_exist', status_code=302)

    except Exception as e:
        logger.error(f"Login error: {e}")
        return RedirectResponse(url='/login?error=unexpected', status_code=302)

    finally:
        # Ensure the database connection is closed
        if 'user_db_connection' in locals():
            user_db_connection.close()


@app.get('/logout')
async def logout(request: Request):
    # Clear the session
    request.session.clear()
    # Redirect to the login page
    return RedirectResponse(url="/login", status_code=302)


@app.get('/register', response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse('register.html', {'request': request})


@app.post('/register', response_class=HTMLResponse)
async def register(request: Request, app_id: str = Form(...), 
                   password: str = Form(...), confirm_password: str = Form(...),
                   client_id: str = Form(...), email: str = Form(...)):
    """
    Handle user registration by verifying app_id in DynamoDB and checking for duplicate app_id in the RDS users table.

    Args:
        request (Request): The FastAPI request object.
        app_id (str): The unique application identifier.
        password (str): The user's password.
        confirm_password (str): The confirmation of the user's password.
        client_id (str): The client's identifier.
        email (str): The user's email address.

    Returns:
        HTMLResponse: Redirects to the login page on success, or renders the registration page with an error message.
    """
    # Check if passwords match
    if password != confirm_password:
        return RedirectResponse(url='/register?error=password_mismatch', status_code=302)
    
    # Verify app_id exists in DynamoDB
    if not get_verfy_appID(app_id):
        return RedirectResponse(url='/register?error=invalid_app', status_code=302)
    
    hashed_password = hash_password(password)

    try:
        # Connect to the RDS database
        logger.info('getting the user db credentials....')
        user_db_credentials = get_secret_db_cred('prod/login/database/auth')
        user_db_connection = get_user_db_connection(user_db_credentials)
        logger.info('user db connection established')

        with user_db_connection.cursor() as cursor:
            # Create the users table if it doesn't exist
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    app_id VARCHAR(50) PRIMARY KEY,
                    password_hash VARCHAR(255) NOT NULL,
                    client_id VARCHAR(50) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

            # Check if the app_id already exists in the users table
            cursor.execute("SELECT app_id FROM users WHERE app_id = %s", (app_id,))
            if cursor.fetchone():
                return RedirectResponse(url='/register?error=app_id_exists', status_code=302)

            # Insert user details into the table
            cursor.execute(
                "INSERT INTO users (app_id, password_hash, client_id, email) VALUES (%s, %s, %s, %s)",
                (app_id, hashed_password, client_id, email)
            )
            logger.info('User data inserted into the RDS users table')
        
        # Commit the transaction
        user_db_connection.commit()

        # Redirect to login page upon successful registration
        return RedirectResponse(url='/login', status_code=302)

    except Exception as general_error:
        logger.error(f"Unexpected error: {general_error}")
        return RedirectResponse(url='/register?error=unexpected', status_code=302)
    
    finally:
        # Ensure the connection is closed
        if 'user_db_connection' in locals():
            user_db_connection.close()


@app.get('/session')
async def session_data(request: Request):
    user = request.session.get('user', None)
    db_config = request.session.get('db_config', None)
    last_active = request.session.get('last_active', None)
    return {'session data': {'user': user, 'db_config': db_config, 'last_active': last_active}}


@app.get('/dashboard', response_class=HTMLResponse)
async def dashboard(request: Request):
    app_id = request.session.get('user')
    if not app_id:
        return RedirectResponse(url='/login', status_code=302)
    return templates.TemplateResponse('/analysis_main_pg.html', {'request': request, 'app_id': app_id})


# @app.post("/dboardash/api/kpi_data", response_class=JSONResponse)
# async def get_kpi_endpoint(analysis_types: list[str]):
#     """
#     API endpoint to fetch calculated KPIs based on user-selected analysis types.
#     """
#     DB_CONFIG = {
#         "db_host": "your-db-host",
#         "db_user": "your-db-user",
#         "db_password": "your-db-password",
#         "db_name": "your-db-name",
#         "db_port": 3306
#     }
#     try:
#         # Fetch KPI data for the requested analyses
#         all_kpis = get_kpi_data(DB_CONFIG)
#         selected_kpis = {k: all_kpis[k] for k in analysis_types if k in all_kpis}
        
#         return {"success": True, "data": selected_kpis}
#     except Exception as e:
#         logger.error(f"Error fetching KPI data: {e}")
#         return {"success": False, "message": "Failed to fetch KPI data."}


@app.get("/get_chart/{chart_id}", response_class=HTMLResponse)
async def get_analysis(request: Request, chart_id: str):
    app_id = request.session.get('user')
    if not app_id:
        return RedirectResponse(url='/login', status_code=302)
    db_config = request.session.get('db_config')
    logger.info(f"Chart ID: {chart_id}")

    if chart_id == 'business-kpis':
        kpi_data = get_kpi_data(DB_CONFIG=db_config)
        # kpi_data = {'CTR': '56.93', 'BounceRate': 95.23, 'AvgSessionDuration': 6105653.84, 'AvgTimeOnPage': 1366890.48, 'PagesPerSession': 1.25, 'EventEngagementRate': 4.88, 'AvgPageLoadTime': 5993.6, 'FormSubmissionRate': 0.0, 'TopEngagedCountry': 'India', 'TopEngagedRegion': 'Assam', 'TopEngagedCity': 'Guwahati', 'AvgInteractionsPerUser': 6.36}
        return templates.TemplateResponse("kpi_chart.html", {"request": request, "kpis": kpi_data})

    if chart_id == 'key-performance-indicators':
        kpi_data = get_campaign_kpi_data(DB_CONFIG=db_config)
        # kpi_data = {'CTR': '56.93', 'BounceRate': 95.23, 'AvgSessionDuration': 6105653.84, 'AvgTimeOnPage': 1366890.48, 'PagesPerSession': 1.25, 'EventEngagementRate': 4.88, 'AvgPageLoadTime': 5993.6, 'FormSubmissionRate': 0.0, 'TopEngagedCountry': 'India', 'TopEngagedRegion': 'Assam', 'TopEngagedCity': 'Guwahati', 'AvgInteractionsPerUser': 6.36}
        return templates.TemplateResponse("campaign_kpi_chart.html", {"request": request, "kpis": kpi_data})

