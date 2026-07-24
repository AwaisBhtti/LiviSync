import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models  # Ensure models are loaded so they are created in the database
from .routers import auth

# Create tables in database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LiviSync Backend",
    description="Backend API for LiviSync Roommate Finder and Hostel Directory",
    version="1.0.0"
)

# Register routers
app.include_router(auth.router)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to specific domains (e.g. ["http://localhost:5173"]) in production
    allow_credentials=True,
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
