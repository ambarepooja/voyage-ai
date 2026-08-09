from app.database.session import SessionLocal
from app.models.user import User

def make_admin():
    db = SessionLocal()
    user = db.query(User).first()
    if user:
        user.is_superuser = True
        user.is_active = True
        db.commit()
        print(f"User {user.email} is now a superuser!")
    else:
        print("No users found. Please sign up first.")
    db.close()

if __name__ == "__main__":
    make_admin()
