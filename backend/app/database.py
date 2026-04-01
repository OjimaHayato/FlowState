from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# DB Connection URL
# Docker Composeの環境変数から取得することを想定
# Default: postgresql://user:password@db/flowstate
db_url = os.getenv("DATABASE_URL", "postgresql://user:password@db/flowstate")
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Create SQLAlchemy engine
engine = create_engine(db_url)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
