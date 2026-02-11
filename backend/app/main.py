from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, categories, sessions, analytics

import os

# Create tables automatically (Simple migration for MVP initial run)
models.Base.metadata.create_all(bind=database.engine)

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
