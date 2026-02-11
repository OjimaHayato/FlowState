from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from datetime import datetime
from .database import Base

class SessionStatus(str, enum.Enum):
    COMPLETED = "COMPLETED"
    ABORTED = "ABORTED"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Relationships
    categories = relationship("Category", back_populates="user")
    focus_sessions = relationship("FocusSession", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    color_code = Column(String, default="#000000")
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Relationships
    user = relationship("User", back_populates="categories")
    focus_sessions = relationship("FocusSession", back_populates="category")

class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer)
    status = Column(String) # Enum as String for simplicity in MVP, or use Enum type
    note = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="focus_sessions")
    category = relationship("Category", back_populates="focus_sessions")
