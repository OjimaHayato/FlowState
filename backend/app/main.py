from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, categories, sessions, analytics

import os
import time
from sqlalchemy.exc import OperationalError

# Create tables automatically (Simple migration for MVP initial run)
# Retry logic for DB connection
max_retries = 5
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("Database connected and tables created successfully.")
        break
    except OperationalError as e:
        if i == max_retries - 1:
            print("Failed to connect to the database after multiple retries.")
            raise e
        print(f"Database connection failed. Retrying in 3 seconds... ({i+1}/{max_retries})")
        time.sleep(3)

app = FastAPI(title="Flowstate API", version="0.1.0", root_path=os.getenv("ROOT_PATH", ""))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(sessions.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Flowstate API"}
