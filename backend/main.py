from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze_resume, match_job
from contextlib import asynccontextmanager
import uvicorn
import os

# Lifespan handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    data_dir = os.path.join(os.getcwd(), 'data')
    os.makedirs(data_dir, exist_ok=True)
    print(f"Data directory: {data_dir}")
    try:
        yield
    finally:
        print("Shutting down...")

app = FastAPI(
    title="Smart Job & Resume Analyzer", 
    description="โปรแกรมวิเคราะห์ Resume และ Job Description ด้วย NLP รองรับภาษาไทยและอังกฤษ พร้อมสรุปสำหรับ HR",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_resume.router, prefix="/api", tags=["Resume Analyzer"])
app.include_router(match_job.router, prefix="/api", tags=["Match Job"])

@app.get("/")
async def root():
    return {
        "message": "Smart Job & Resume Analyzer API",
        "version": "2.0.0",
        "endpoints": {
            "analyze_resume": "/api/analyze-resume",
            "match_job": "/api/match-job",
            "upload_resumes": "/api/upload-resumes",
            "list_resumes": "/api/list-resumes"
        },
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

# Run directly with Python
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=True)