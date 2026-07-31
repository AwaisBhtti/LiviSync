from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Checking/adding hostel_type column...")
        try:
            conn.execute(text("ALTER TABLE hostels ADD COLUMN hostel_type VARCHAR(50) DEFAULT 'boys';"))
            conn.commit()
            print("Successfully added hostel_type column!")
        except Exception as e:
            print("Error or column already exists:", e)

if __name__ == "__main__":
    migrate()
