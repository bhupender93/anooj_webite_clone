# import json
# import subprocess
import boto3
import botocore
import pymysql
from logger_config import logger

# secrets_manager = boto3.client('secretsmanager', region_name='ap-south-1')
dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
    

# def get_secret_via_aws_cli(secret_name):
#     try:
#         # Construct the AWS CLI command
#         command = [
#             "aws",
#             "secretsmanager",
#             "get-secret-value",
#             "--secret-id",
#             secret_name,
#             "--region",
#             "ap-south-1",
#             "--output",
#             "json"
#         ]
        
#         # Run the command using subprocess
#         result = subprocess.run(command, capture_output=True, text=True, check=True)
        
#         # Parse the output as JSON
#         secret_value = json.loads(result.stdout)
#         print("Secret Value:", secret_value['SecretString'])
#         return secret_value
        
#     except subprocess.CalledProcessError as e:
#         print("Error executing AWS CLI command:")
#         print(e.stderr)
#     except json.JSONDecodeError as e:
#         print("Error decoding JSON response:", e)


# def get_user_db_cred():
#     """
#     Fetch database credentials for the users login db from AWS Secrets Manager.
#     :return: A dictionary containing database credentials.
#     """
#     try:
#         secret_name = 'prod/login/database/auth'
#         print(f"Connecting to secret name: {secret_name}................")
#         secret_data = get_secret_via_aws_cli(secret_name)
#         print(f'login details: {secret_data}')
#         return secret_data
#     except Exception as e:
#         raise RuntimeError(f"Error fetching secrets from {secret_name} for users login: {e}")
    

# Function to verify app_id in DynamoDB
def get_verfy_appID(app_id: str) -> bool:
    """
    Check if the given app_id exists in the DynamoDB table 'ClientDatabaseConfig'.
    Args: app_id (str): The app_id to verify.
    Returns: bool: True if app_id exists in DynamoDB, False otherwise.
    """
    try:
        print(f"Connecting to dynamodb............")
        table_cdc = dynamodb.Table("ClientDatabaseConfig")
        response = table_cdc.get_item(Key={'app_id': app_id})
        if 'Item' in response:
            return True
        else:
            return False
    except botocore.exceptions.ClientError as e:
        logger.error(f"Error checking DynamoDB: {e}")
        return False


def get_user_db_connection(db_credentials):
    """
    Establish a connection to the RDS MySQL database for user authentication.
    Returns:
        pymysql.connections.Connection: A connection object to the RDS database.
    Raises:
        Exception: If the connection to the database fails.
    """
    try:
        # user_db_credentials = {"db_host": "rds-instance-login-auth.cns8o4gqkb7p.ap-south-1.rds.amazonaws.com", "db_user": "app_login_auth_admin", "db_password": "08aZAyfy9NXiGQS", "db_name": "app_login_auth_db", "db_port": "3306"}

        # Connect to the RDS database
        user_db_connection = pymysql.connect(
            host=db_credentials['db_host'],
            user=db_credentials['db_user'],
            password=db_credentials['db_password'],
            database=db_credentials['db_name'],
            port=int(db_credentials['db_port']),
            cursorclass=pymysql.cursors.DictCursor
        )

        return user_db_connection
    
    except Exception as e:
        logger.error('User DB connection is not established.')



# def fetch_client_db_config(app_id):
#     """
#     Fetch database credentials for a client from AWS Secrets Manager.
#     :param app_id: The app ID of the client.
#     :return: A dictionary containing database credentials.
#     """
#     try:
#         secret_name = f"app/{app_id}/database/credentials"
#         logger.info(f"Connecting to secret name: {secret_name}................")
#         db_config = get_secret_via_aws_cli(secret_name)
#         logger.info(f'login details: {db_config}')
#         return db_config
#     except Exception as e:
#         raise RuntimeError(f"Error fetching secrets for app ID {app_id}: {e}")

