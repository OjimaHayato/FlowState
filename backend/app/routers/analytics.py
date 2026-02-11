from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import database, analytics, crud, auth, models

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"]
)

@router.get("/dashboard")
def get_dashboard_data(category_id: int = None, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    daily_stats = analytics.get_daily_stats(db, str(current_user.id), category_id)
    weekly_stats = analytics.get_weekly_stats(db, str(current_user.id), category_id)
    heatmap_data = analytics.get_heatmap_data(db, str(current_user.id), category_id)
    category_distribution = analytics.get_category_distribution(db, str(current_user.id), category_id)
    recent_sessions = crud.get_focus_sessions(db, str(current_user.id), limit=5, category_id=category_id)
    
    return {
        "daily_stats": daily_stats,
        "weekly_stats": weekly_stats,
        "heatmap_data": heatmap_data,
        "category_distribution": category_distribution,
        "recent_sessions": recent_sessions
    }
