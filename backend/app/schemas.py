from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: UUID
    
    class Config:
        from_attributes = True # updated for Pydantic v2

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    color_code: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    user_id: UUID

    class Config:
        from_attributes = True

# --- Focus Session Schemas ---
class FocusSessionBase(BaseModel):
    duration_minutes: int
    status: str
    note: Optional[str] = None
    category_id: Optional[int] = None

class FocusSessionCreate(FocusSessionBase):
    pass # start_time is auto-generated, end_time is calculated or passed

class FocusSessionUpdate(BaseModel):
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    note: Optional[str] = None
    category_id: Optional[int] = None

class FocusSession(FocusSessionBase):
    id: UUID
    user_id: UUID
    start_time: datetime
    end_time: Optional[datetime]

    class Config:
        from_attributes = True

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
