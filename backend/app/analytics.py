from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from . import models

def get_daily_stats(db: Session, user_id: str, category_id: int = None):
    """
    Get statistics for the current day (UTC).
    Returns:
        total_focus_time (int): Total minutes of focus today.
        session_count (int): Number of completed sessions today.
    """
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    query = db.query(
        func.sum(models.FocusSession.duration_minutes),
        func.count(models.FocusSession.id)
    ).filter(
        models.FocusSession.user_id == user_id,
        models.FocusSession.start_time >= today_start,
        models.FocusSession.status == "COMPLETED"
    )
    
    if category_id:
        query = query.filter(models.FocusSession.category_id == category_id)
        
    stats = query.first()

    total_minutes = stats[0] if stats[0] else 0
    count = stats[1] if stats[1] else 0
    
    return {
        "total_focus_minutes": total_minutes,
        "session_count": count
    }

def get_weekly_stats(db: Session, user_id: str, category_id: int = None):
    """
    Get daily focus time for the last 7 days.
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=6)
    start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)

    query = db.query(
        func.date(models.FocusSession.start_time).label("date"),
        func.sum(models.FocusSession.duration_minutes).label("minutes")
    ).filter(
        models.FocusSession.user_id == user_id,
        models.FocusSession.start_time >= start_date,
        models.FocusSession.status == "COMPLETED"
    )
    
    if category_id:
        query = query.filter(models.FocusSession.category_id == category_id)
        
    sessions = query.group_by(
        func.date(models.FocusSession.start_time)
    ).all()

    # Create a dict for easy lookup
    data_map = {str(r.date): r.minutes for r in sessions}

    # Fill in ease of the last 7 days with 0 if no data
    result = []
    current = start_date
    for _ in range(7):
        date_str = current.strftime("%Y-%m-%d")
        result.append({
            "date": date_str,
            "minutes": data_map.get(date_str, 0)
        })
        current += timedelta(days=1)
        
    return result

def get_heatmap_data(db: Session, user_id: str, category_id: int = None):
    """
    Get daily session counts for the activity heatmap (last 365 days).
    Format: [{ date: "YYYY-MM-DD", count: 5, level: 1-4 }]
    """
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=365)
    
    query = db.query(
        func.date(models.FocusSession.start_time).label("date"),
        func.count(models.FocusSession.id).label("count")
    ).filter(
        models.FocusSession.user_id == user_id,
        models.FocusSession.start_time >= start_date,
        models.FocusSession.status == "COMPLETED"
    )
    
    if category_id:
        query = query.filter(models.FocusSession.category_id == category_id)
        
    sessions = query.group_by(
        func.date(models.FocusSession.start_time)
    ).all()
    
    
    result = []
    # Create a map of date string to count
    stats_map = {str(r.date): r.count for r in sessions}

    # Generate entries for every day in the last 365 days
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        count = stats_map.get(date_str, 0)
        
        # Simple level calculation logic
        if count == 0: level = 0
        elif count <= 2: level = 1
        elif count <= 4: level = 2
        elif count <= 6: level = 3
        else: level = 4
        
        result.append({
            "date": date_str,
            "count": count,
            "level": level
        })
        current_date += timedelta(days=1)
        
    return result

def get_category_distribution(db: Session, user_id: str, category_id: int = None):
    """
    Get total focus duration per category.
    If category_id is provided, it will just return 100% for that category, 
    but for consistency we keep the interface.
    """
    query = db.query(
        models.Category.name,
        models.Category.color_code,
        func.sum(models.FocusSession.duration_minutes).label("total_minutes")
    ).join(
        models.FocusSession, models.FocusSession.category_id == models.Category.id
    ).filter(
        models.FocusSession.user_id == user_id,
        models.FocusSession.status == "COMPLETED"
    )
    
    if category_id:
        query = query.filter(models.FocusSession.category_id == category_id)

    results = query.group_by(
        models.Category.id, models.Category.name, models.Category.color_code
    ).all()
    
    data = []
    for r in results:
        data.append({
            "name": r.name,
            "value": r.total_minutes,
            "color": r.color_code
        })
        
    return data
