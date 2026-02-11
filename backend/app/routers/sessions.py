from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, crud, auth, models

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)

@router.post("/", response_model=schemas.FocusSession)
def create_session(session: schemas.FocusSessionCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_focus_session(db=db, session=session, user_id=current_user.id)

@router.get("/", response_model=List[schemas.FocusSession])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_focus_sessions(db, user_id=current_user.id, skip=skip, limit=limit)

@router.put("/{session_id}", response_model=schemas.FocusSession)
def update_session(session_id: str, session: schemas.FocusSessionUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    updated_session = crud.update_focus_session(db, session_id=session_id, session_update=session, user_id=current_user.id)
    if not updated_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return updated_session
