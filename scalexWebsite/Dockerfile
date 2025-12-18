# Step 1: Use an official Python runtime as a parent image
FROM python:3.11.8-slim

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the requirements file to the container
COPY requirements.txt /app/

# Step 4: Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the current directory contents into the container at /app
COPY . /app

# Step 6: Expose the port that FastAPI will run on
EXPOSE 8000

# Step 7: Define the command to run the FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
