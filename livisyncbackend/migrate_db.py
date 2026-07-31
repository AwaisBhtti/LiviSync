from sqlalchemy import text
from app.database import engine

def migrate():
    statements = [
        # Alter students table columns to drop NOT NULL constraint
        "ALTER TABLE students ALTER COLUMN age DROP NOT NULL;",
        "ALTER TABLE students ALTER COLUMN gender DROP NOT NULL;",
        "ALTER TABLE students ALTER COLUMN budget DROP NOT NULL;",
        "ALTER TABLE students ALTER COLUMN location DROP NOT NULL;",
        
        # Alter preferences table columns to drop NOT NULL constraint
        "ALTER TABLE preferences ALTER COLUMN sleep_schedule DROP NOT NULL;",
        "ALTER TABLE preferences ALTER COLUMN cleanliness DROP NOT NULL;",
        "ALTER TABLE preferences ALTER COLUMN smoking DROP NOT NULL;",
        "ALTER TABLE preferences ALTER COLUMN pets DROP NOT NULL;",
        "ALTER TABLE preferences ALTER COLUMN guest_tolerance DROP NOT NULL;",
        "ALTER TABLE preferences ALTER COLUMN noise_tolerance DROP NOT NULL;"
    ]

    with engine.connect() as conn:
        for stmt in statements:
            print(f"Executing: {stmt}")
            try:
                conn.execute(text(stmt))
                conn.commit()
                print("Success")
            except Exception as e:
                print(f"Error executing statement: {e}")

if __name__ == "__main__":
    migrate()
