import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app import models, database, auth

def seed_data():
    db = database.SessionLocal()
    try:
        # 1. Create Demo User
        username = "demo"
        email = "demo@example.com"
        password = "password"
        
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            print(f"Creating user: {username}")
            hashed_password = auth.get_password_hash(password)
            user = models.User(username=username, email=email, hashed_password=hashed_password)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"User {username} already exists")

        # 2. Create Categories
        categories_data = [
            {"name": "Coding", "color_code": "#6366f1"}, # Indigo
            {"name": "Reading", "color_code": "#10b981"}, # Emerald
            {"name": "Writing", "color_code": "#f59e0b"}, # Amber
            {"name": "Meeting", "color_code": "#ef4444"}, # Red
        ]
        
        categories = []
        for cat_data in categories_data:
            cat = db.query(models.Category).filter(
                models.Category.user_id == user.id,
                models.Category.name == cat_data["name"]
            ).first()
            if not cat:
                print(f"Creating category: {cat_data['name']}")
                cat = models.Category(
                    user_id=user.id,
                    name=cat_data["name"],
                    color_code=cat_data["color_code"]
                )
                db.add(cat)
                db.commit()
                db.refresh(cat)
            categories.append(cat)

        # 3. Create Focus Sessions (Past 60 days)
        print("Generating sessions...")
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=60)
        
        current_date = start_date
        total_sessions = 0
        
        while current_date <= end_date:
            # 70% chance to have sessions on a day
            if random.random() < 0.7:
                num_sessions = random.randint(1, 5)
                for _ in range(num_sessions):
                    category = random.choice(categories)
                    duration = random.choice([25, 25, 25, 50]) # Mostly 25 mins
                    
                    # Random time during the day
                    hour = random.randint(8, 22)
                    minute = random.randint(0, 59)
                    session_start = current_date.replace(hour=hour, minute=minute)
                    
                    session = models.FocusSession(
                        user_id=user.id,
                        category_id=category.id,
                        start_time=session_start,
                        end_time=session_start + timedelta(minutes=duration),
                        duration_minutes=duration,
                        status="COMPLETED",
                        note=f"Dummy session for {category.name}"
                    )
                    db.add(session)
                    total_sessions += 1
            
            current_date += timedelta(days=1)
            
        db.commit()
        print(f"Successfully added {total_sessions} dummy sessions for user '{username}'.")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
