import os
import sys
from datetime import datetime, timedelta
import random

# Ensure the backend directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine
from app import models, auth

def seed_database():
    print("データベースのシード処理を開始します...")
    db = SessionLocal()
    
    # テーブルが存在しない場合は作成
    models.Base.metadata.create_all(bind=engine)

    try:
        # demo_user が既に存在するかチェック
        existing_demo_user = db.query(models.User).filter(models.User.username == "demo_user").first()
        
        if existing_demo_user:
            print("既存のデモアカウントデータをクリーンアップしています...")
            db.query(models.FocusSession).filter(models.FocusSession.user_id == existing_demo_user.id).delete()
            db.query(models.Category).filter(models.Category.user_id == existing_demo_user.id).delete()
            db.delete(existing_demo_user)
            db.commit()

        # 1. デモユーザーの作成
        print("デモユーザーを作成しています...")
        hashed_pw = auth.get_password_hash("password123")
        demo_user = models.User(
            username="demo_user",
            email="demo@example.com",
            hashed_password=hashed_pw
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        # 2. カテゴリーの作成
        print("カテゴリーを作成しています...")
        categories = [
            {"name": "Work", "color_code": "#3B82F6"},   # Blue
            {"name": "Study", "color_code": "#10B981"},  # Green
            {"name": "Coding", "color_code": "#8B5CF6"}, # Purple
        ]
        
        db_categories = []
        for cat in categories:
            new_cat = models.Category(
                name=cat["name"],
                color_code=cat["color_code"],
                user_id=demo_user.id
            )
            db.add(new_cat)
            db_categories.append(new_cat)
        
        db.commit()
        for cat in db_categories:
            db.refresh(cat)

        # 3. フォーカスセッション(履歴)の作成
        print("学習履歴(セッション)を作成しています...")
        now = datetime.utcnow()
        # 多くを完了(COMPLETED)に、一部を中断(ABORTED)にする比率
        statuses = ["COMPLETED"] * 8 + ["ABORTED"] * 2
        
        # 過去7日間にランダムなセッションを15個散りばめる
        for i in range(15):
            days_ago = random.randint(0, 6)
            hours_ago = random.randint(1, 23)
            duration = random.choice([25, 50, 90, 15, 30])
            
            cat = random.choice(db_categories)
            status = random.choice(statuses)
            
            start_time = now - timedelta(days=days_ago, hours=hours_ago)
            end_time = start_time + timedelta(minutes=duration) if status == "COMPLETED" else start_time + timedelta(minutes=random.randint(1, duration-1))
            
            session = models.FocusSession(
                user_id=demo_user.id,
                category_id=cat.id,
                start_time=start_time,
                end_time=end_time,
                duration_minutes=duration,
                status=status,
                note=f"Demo session sample #{i+1}"
            )
            db.add(session)
            
        db.commit()
        print("\n✅ シード処理が完了しました！以下のデモアカウントでログイン可能です：")
        print("  Username: demo_user")
        print("  Password: password123")
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
