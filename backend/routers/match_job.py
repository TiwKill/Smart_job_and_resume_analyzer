from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from controllers.resume_analyzer import ThaiResumeAnalyzer
import os
import logging

# ตั้งค่า logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SUPPORTED_EXTS = {'.pdf', '.docx', '.txt'}

router = APIRouter()

class MatchJobRequest(BaseModel):
    analysis: Dict[str, Any]
    job_description: str

@router.post("/match-job", response_model=Dict[str, Any])
async def match_job_endpoint(payload: MatchJobRequest):
    """
    วิเคราะห์ความเหมาะสมของ resume กับ job description
    และสแกนไฟล์ resume ทั้งหมดใน folder data เพื่อหาผู้สมัครที่เหมาะสม
    """
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    analyzer = ThaiResumeAnalyzer()
    
    logger.info(f"Starting job matching process...")
    logger.info(f"Job description length: {len(payload.job_description)}")
    
    # วิเคราะห์ resume ที่ส่งเข้ามา
    input_match = analyzer.calculate_job_match_score(payload.analysis, payload.job_description)
    logger.info(f"Input resume score: {input_match.get('total_score')}")
    logger.info(f"Input resume language score: {input_match.get('language_score', 0)}")

    # สแกนไฟล์ resume ทั้งหมดใน folder data
    data_dir = os.path.join(os.getcwd(), 'data')
    matched_files: List[Dict[str, Any]] = []
    scanned: List[str] = []

    if not os.path.isdir(data_dir):
        logger.warning(f"Data directory not found: {data_dir}")
        return {
            'input_resume_match': input_match,
            'matched_resumes': [],
            'total_matched': 0,
            'scanned_files': [],
            'total_scanned': 0
        }

    logger.info(f"Scanning directory: {data_dir}")
    
    for name in os.listdir(data_dir):
        file_path = os.path.join(data_dir, name)
        if not os.path.isfile(file_path):
            continue
            
        ext = os.path.splitext(name)[1].lower()
        if ext not in SUPPORTED_EXTS:
            continue
            
        scanned.append(name)
        logger.info(f"Processing file: {name}")
        
        try:
            analysis = analyzer.analyze_resume(file_path)
            if not analysis or 'error' in analysis:
                logger.warning(f"Failed to analyze {name}: {analysis.get('error', 'Unknown error')}")
                continue
                
            match_score = analyzer.calculate_job_match_score(analysis, payload.job_description)
            logger.info(f"File {name} score: {match_score.get('total_score')}")
            
            matched_files.append({
                'filename': name,
                'match_score': match_score,
                'analysis': analysis
            })
            
        except Exception as e:
            logger.error(f"Error processing {name}: {str(e)}")
            continue

    # เรียงลำดับตามคะแนน
    matched_files.sort(key=lambda x: x['match_score'].get('total_score', 0), reverse=True)
    
    # จำกัดจำนวนผลลัพธ์
    top_matches = matched_files[:10]
    
    result = {
        'input_resume_match': input_match,
        'matched_resumes': top_matches,
        'total_matched': len(top_matches),
        'scanned_files': scanned,
        'total_scanned': len(scanned)
    }
    
    logger.info(f"Job matching completed. Total scanned: {len(scanned)}, Matched: {len(top_matches)}")
    return result

@router.post("/upload-resumes")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """
    อัพโหลดไฟล์ resume หลายไฟล์พร้อมกัน
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")
    
    data_dir = os.path.join(os.getcwd(), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    uploaded = []
    errors = []
    
    for file in files:
        if not file.filename:
            errors.append("Empty filename")
            continue
            
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in SUPPORTED_EXTS:
            errors.append(f"Unsupported file type: {file.filename}")
            continue
            
        try:
            file_path = os.path.join(data_dir, file.filename)
            content = await file.read()
            
            with open(file_path, 'wb') as f:
                f.write(content)
                
            uploaded.append(file.filename)
            logger.info(f"Uploaded: {file.filename}")
            
        except Exception as e:
            errors.append(f"Error uploading {file.filename}: {str(e)}")
    
    return {
        'uploaded': uploaded,
        'errors': errors,
        'total_uploaded': len(uploaded)
    }

@router.get("/list-resumes")
async def list_resumes():
    """
    แสดงรายการไฟล์ resume ทั้งหมดในระบบ
    """
    data_dir = os.path.join(os.getcwd(), 'data')
    if not os.path.isdir(data_dir):
        return {'resumes': [], 'total': 0}
    
    resumes = []
    for name in os.listdir(data_dir):
        file_path = os.path.join(data_dir, name)
        if os.path.isfile(file_path):
            ext = os.path.splitext(name)[1].lower()
            if ext in SUPPORTED_EXTS:
                resumes.append({
                    'filename': name,
                    'size': os.path.getsize(file_path),
                    'extension': ext
                })
    
    return {
        'resumes': resumes,
        'total': len(resumes)
    }