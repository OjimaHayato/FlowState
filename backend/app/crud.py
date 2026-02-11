from sqlalchemy.orm import Session
from . import models, schemas, auth
from datetime import datetime

# --- User ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Category ---
def get_categories(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return db.query(models.Category).filter(models.Category.user_id == user_id).offset(skip).limit(limit).all()

def create_user_category(db: Session, category: schemas.CategoryCreate, user_id: str):
    db_category = models.Category(**category.dict(), user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_user_category(db: Session, category_id: int, category_update: schemas.CategoryCreate, user_id: str):
    db_category = db.query(models.Category).filter(models.Category.id == category_id, models.Category.user_id == user_id).first()
    if db_category:
        for key, value in category_update.dict().items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_user_category(db: Session, category_id: int, user_id: str):
    db_category = db.query(models.Category).filter(models.Category.id == category_id, models.Category.user_id == user_id).first()
    if db_category:
        # Set category_id to NULL for associated sessions to preserve logs
        db.query(models.FocusSession).filter(models.FocusSession.category_id == category_id).update({"category_id": None})
        
        db.delete(db_category)
        db.commit()
        return True
    return False

# --- Focus Session ---
def get_focus_sessions(db: Session, user_id: str, skip: int = 0, limit: int = 100, category_id: int = None):
    query = db.query(models.FocusSession).filter(models.FocusSession.user_id == user_id)
    if category_id:
        query = query.filter(models.FocusSession.category_id == category_id)
    return query.order_by(models.FocusSession.start_time.desc()).offset(skip).limit(limit).all()

def create_focus_session(db: Session, session: schemas.FocusSessionCreate, user_id: str):
    # Calculate end_time based on duration if needed, or just set current time as completion time
    now = datetime.utcnow()
    # Assuming the session is created when it finishes for MVP simplicity, or started and updated.
    # Logic: Start time is now - duration, End time is now (simplified)
    # OR: receive explicit times. Let's assume simplifed creation "after the fact" or "start now"
    
    # For MVP: simpler is better. We record it when it's done? Or when it starts?
    # User's requirement says "Timer start..., Log save: start, end, status".
    # Implementation detail: We can just create it with status=COMPLETED when timer finishes.
    
    db_session = models.FocusSession(
        **session.dict(), 
        user_id=user_id,
        start_time=now - auth.timedelta(minutes=session.duration_minutes),
        end_time=now
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def update_focus_session(db: Session, session_id: str, session_update: schemas.FocusSessionUpdate, user_id: str):
    db_session = db.query(models.FocusSession).filter(models.FocusSession.id == session_id, models.FocusSession.user_id == user_id).first()
    if db_session:
        for key, value in session_update.dict(exclude_unset=True).items():
            setattr(db_session, key, value)
        db.commit()
        db.refresh(db_session)
    return db_session
