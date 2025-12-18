import logging

# # Remove existing handlers to avoid duplicate logs
# for handler in logging.root.handlers[:]:
#     logging.root.removeHandler(handler)

# Set up logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(filename)s - %(funcName)s - %(lineno)d - %(message)s'
)

logger = logging.getLogger(__name__)