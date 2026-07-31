from app.database import engine
from sqlalchemy import text

def add_column():
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE hostels ADD COLUMN IF NOT EXISTS photos TEXT[]'))
        conn.commit()
        print('Column added successfully')

if __name__ == "__main__":
    add_column()
