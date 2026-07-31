from sqlalchemy import text
from app.database import engine

def migrate():
    with engine.connect() as conn:
        print("Checking/adding curfew columns...")
        try:
            conn.execute(text("ALTER TABLE hostels ADD COLUMN has_curfew BOOLEAN DEFAULT FALSE;"))
            conn.execute(text("ALTER TABLE hostels ADD COLUMN curfew_time VARCHAR(20) NULL;"))
            conn.commit()
            print("Successfully added curfew columns!")
        except Exception as e:
            print("Error or columns already exist:", e)

if __name__ == "__main__":
    migrate()
