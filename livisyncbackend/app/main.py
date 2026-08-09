import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, admin, students, owners, hostels, chat

from sqlalchemy import text

# Create tables in database
Base.metadata.create_all(bind=engine)

# Auto-migrate: add nearby_locations column and update status constraint if needed
with engine.begin() as conn:
    conn.execute(text("ALTER TABLE hostels ADD COLUMN IF NOT EXISTS nearby_locations TEXT[] DEFAULT '{}';"))
    conn.execute(text("ALTER TABLE students DROP CONSTRAINT IF EXISTS student_status_check;"))
    conn.execute(text("ALTER TABLE students ADD CONSTRAINT student_status_check CHECK (status IN ('active', 'suspended', 'inactive'));"))

app = FastAPI(
    title="LiviSync Backend",
    description="Backend API for LiviSync Roommate Finder and Hostel Directory",
    version="1.0.0"
)

# Register routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(owners.router)
app.include_router(hostels.router)
app.include_router(admin.router)
app.include_router(chat.router)


# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True if allowed_origins and "*" not in allowed_origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "message": "Welcome to the LiviSync API backend"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
