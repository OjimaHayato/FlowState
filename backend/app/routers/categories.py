from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import database, schemas, crud, auth, models

router = APIRouter(
    prefix="/categories",
    tags=["categories"]
)

@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.create_user_category(db=db, category=category, user_id=current_user.id)

@router.get("/", response_model=List[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_categories(db, user_id=current_user.id, skip=skip, limit=limit)

@router.put("/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, category: schemas.CategoryCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    updated_category = crud.update_user_category(db, category_id=category_id, category_update=category, user_id=current_user.id)
    if not updated_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    success = crud.delete_user_category(db, category_id=category_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
