from typing import Dict, Any, Optional
import os
import tempfile
from fastapi import APIRouter, UploadFile, File, HTTPException
import logging

# Import your analyzer class
from controllers.resume_analyzer import ThaiResumeAnalyzer

router = APIRouter()
logger = logging.getLogger(__name__)

# Supported file extensions
SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.txt'}

@router.post("/analyze-resume", response_model=Dict[str, Any])
async def analyze_resume_endpoint(file: UploadFile = File(...)):
    """
    Upload resume file (PDF, DOCX, DOC, TXT) and get analysis.
    """
    # Validate file
    if not file or not file.filename:
        raise HTTPException(
            status_code=400, 
            detail="No file uploaded or invalid filename"
        )
    
    # Determine file extension
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported."
        )
    
    # Check file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {max_size // (1024*1024)}MB"
        )
    
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="File is empty"
        )
    
    temp_file_path: Optional[str] = None
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False, 
            suffix=file_extension,
            prefix="resume_"
        ) as temp_file:
            # Read and write file content
            content = await file.read()
            if not content:
                raise HTTPException(status_code=400, detail="File content is empty")
            
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        logger.info(f"Processing resume file: {file.filename}, size: {file_size} bytes")
        
        # Analyze resume
        analyzer = ThaiResumeAnalyzer()
        analysis = analyzer.analyze_resume(temp_file_path)
        
        # Validate analysis result
        if analysis is None:
            logger.error("Analysis returned None")
            raise HTTPException(
                status_code=500, 
                detail="Failed to analyze resume - no result returned"
            )
        
        if isinstance(analysis, dict) and "error" in analysis:
            error_msg = analysis["error"]
            logger.error(f"Analysis error: {error_msg}")
            raise HTTPException(
                status_code=500, 
                detail=f"Resume analysis failed: {error_msg}"
            )
        
        # Ensure the response has basic structure
        if not isinstance(analysis, dict):
            logger.error(f"Unexpected analysis type: {type(analysis)}")
            raise HTTPException(
                status_code=500,
                detail="Invalid analysis result format"
            )
        
        logger.info(f"Successfully analyzed resume: {file.filename}")
        return analysis
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error processing resume {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error while processing resume: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.debug(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as cleanup_error:
                logger.warning(f"Failed to clean up temp file {temp_file_path}: {cleanup_error}")