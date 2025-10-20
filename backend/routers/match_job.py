from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
import os
import logging
import csv
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pythainlp import word_tokenize
from pythainlp.util import normalize
import numpy as np

logger = logging.getLogger(__name__)

router = APIRouter()

SUPPORTED_EXTS = {'.pdf', '.docx', '.txt', '.csv'}

class CookieData(BaseModel):
    phpsessid: str
    guest_id: str
    fcnec: str

class MatchJobRequest(BaseModel):
    cookies: CookieData
    analysis: Dict[str, Any]
    job_description: str

class EnhancedJobMatcher:
    """Enhanced job matcher with NLP capabilities for Thai and English"""
    
    def __init__(self):
        self.tech_skills = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'sql', 'swift', 'kotlin', 'typescript', 'rust', 'scala', 'tester', 'software tester', 'qa'],
            'web': ['html', 'css', 'react', 'vue', 'angular', 'node.js', 'django', 'flask', 'laravel', 'spring', 'express', 'next.js', 'nuxt.js'],
            'design': ['ux', 'ui', 'ux/ui', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'wireframe', 'prototype'],
            'mobile': ['android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic'],
            'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'sqlite', 'redis', 'firebase'],
            'cloud_devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ci/cd'],
            'data_science': ['machine learning', 'ai', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch'],
            'tools': ['git', 'github', 'gitlab', 'jira', 'confluence'],
        }
        
        self.thai_skills = [
            'คอมพิวเตอร์', 'โปรแกรม', 'ออกแบบ', 'ซ่อม', 'บำรุง', 'ติดตั้ง', 'ประสานงาน',
            'บริการลูกค้า', 'แก้ไขปัญหา', 'จัดการ', 'วิเคราะห์', 'พัฒนา', 'ทดสอบ',
            'ออกแบบเว็บ', 'ออกแบบแอป', 'ออกแบบยูไอ', 'ออกแบบยูเอ็กซ์'
        ]
        
        self.job_positions = {
            'developer': ['developer', 'programmer', 'software engineer', 'full stack', 'backend', 'frontend', 'พัฒนา', 'โปรแกรมเมอร์'],
            'tester': ['tester', 'qa', 'quality assurance', 'test engineer', 'ทดสอบ', 'qa engineer'],
            'designer': ['designer', 'ux', 'ui', 'graphic designer', 'นักออกแบบ'],
            'analyst': ['analyst', 'business analyst', 'data analyst', 'นักวิเคราะห์'],
            'manager': ['manager', 'project manager', 'product manager', 'ผู้จัดการ'],
            'support': ['support', 'it support', 'technical support', 'helpdesk', 'สนับสนุน'],
        }
        
        self.thai_provinces = [
            'กรุงเทพ', 'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร',
            'นครปฐม', 'ชลบุรี', 'ระยอง', 'เชียงใหม่', 'เชียงราย', 'ขอนแก่น', 'อุดรธานี',
            'นครราชสีมา', 'ภูเก็ต', 'สงขลา', 'หาดใหญ่'
        ]
        
        self.education_levels = {
            'ปริญญาเอก': 5,
            'ปริญญาโท': 4,
            'ปริญญาตรี': 3,
            'ปวส': 2,
            'ปวช': 1,
            'มัธยมศึกษา': 0
        }

    def parse_salary_range(self, salary_str: str) -> tuple[int, int]:
        """Parse salary string to min/max values"""
        if not salary_str or salary_str == "-":
            return (0, 0)
        
        # Remove commas and spaces
        salary_str = salary_str.replace(',', '').replace(' ', '')
        
        # Extract numbers
        numbers = re.findall(r'\d+', salary_str)
        
        if len(numbers) >= 2:
            return (int(numbers[0]), int(numbers[1]))
        elif len(numbers) == 1:
            val = int(numbers[0])
            return (val, val)
        return (0, 0)

    def extract_salary_from_job_desc(self, job_desc: str) -> Optional[int]:
        """Extract expected salary from job description"""
        patterns = [
            r'เงินเดือน[:\s]*(\d{1,3}(?:,\d{3})+|\d{5,6})',
            r'salary[:\s]*(\d{1,3}(?:,\d{3})+|\d{5,6})',
            r'(\d{1,3}(?:,\d{3})+|\d{5,6})\s*บาท',
            r'(\d{2,3})k',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, job_desc.lower())
            if match:
                val_str = match.group(1).replace(',', '')
                if 'k' in match.group(0):
                    return int(val_str) * 1000
                return int(val_str)
        return None

    def calculate_salary_score(self, resume_salary: str, job_desc: str) -> tuple[float, Dict]:
        """Calculate salary match score with detailed breakdown"""
        expected_salary = self.extract_salary_from_job_desc(job_desc)
        resume_min, resume_max = self.parse_salary_range(resume_salary)
        
        if not expected_salary or resume_min == 0:
            return 10.0, {"status": "no_data", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        # Perfect match
        if resume_min <= expected_salary <= resume_max:
            return 20.0, {"status": "perfect_match", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        # Within 10% tolerance
        if resume_min <= expected_salary * 1.1:
            return 18.0, {"status": "excellent_match", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        # Within 20% tolerance
        if resume_min <= expected_salary * 1.2:
            return 15.0, {"status": "good_match", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        # Within 30% tolerance
        if resume_min <= expected_salary * 1.3:
            return 12.0, {"status": "acceptable_match", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        # Too high expectation
        if resume_min > expected_salary * 1.5:
            return 5.0, {"status": "too_high", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}
        
        return 8.0, {"status": "moderate_match", "expected": expected_salary, "resume_range": f"{resume_min}-{resume_max}"}

    def calculate_position_similarity(self, resume_position: str, resume_experience: str, job_desc: str) -> tuple[float, List[str]]:
        """Calculate position match using semantic similarity"""
        resume_text = f"{resume_position} {resume_experience}".lower()
        job_text = job_desc.lower()
        
        matched_positions = []
        position_score = 0.0
        
        # Check for exact position matches
        for category, positions in self.job_positions.items():
            for pos in positions:
                if pos in resume_text or pos in job_text:
                    if pos in resume_text and pos in job_text:
                        position_score += 5.0
                        matched_positions.append(pos)
        
        # Use TF-IDF for semantic similarity
        try:
            vectorizer = TfidfVectorizer(
                lowercase=True,
                ngram_range=(1, 2),
                min_df=1,
                max_features=500
            )
            
            texts = [resume_text, job_text]
            tfidf_matrix = vectorizer.fit_transform(texts)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Add similarity bonus
            position_score += similarity * 15.0
            
        except Exception as e:
            logger.warning(f"TF-IDF calculation failed: {e}")
        
        return min(position_score, 25.0), matched_positions

    def calculate_skills_match(self, resume_data: Dict, analysis: Dict, job_desc: str) -> tuple[float, Dict]:
        """Calculate comprehensive skills match score"""
        job_desc_lower = job_desc.lower()
        matched_skills = []
        skill_categories = {}
        
        # Extract skills from analysis
        if "analysis" in analysis and "skills" in analysis["analysis"]:
            skills = analysis["analysis"]["skills"]
            
            for category, skill_list in skills.items():
                if isinstance(skill_list, list):
                    category_matches = []
                    for skill in skill_list:
                        skill_lower = skill.lower()
                        
                        # Check in job description
                        if skill_lower in job_desc_lower:
                            matched_skills.append(skill)
                            category_matches.append(skill)
                        
                        # Check Thai variations
                        for thai_skill in self.thai_skills:
                            if thai_skill in job_desc_lower and thai_skill in skill_lower:
                                matched_skills.append(skill)
                                category_matches.append(skill)
                                break
                    
                    if category_matches:
                        skill_categories[category] = category_matches
        
        # Calculate score based on number of matches
        base_score = min(len(matched_skills) * 4, 35.0)
        
        # Bonus for diverse skill categories
        category_bonus = min(len(skill_categories) * 2, 5.0)
        
        total_score = base_score + category_bonus
        
        return min(total_score, 40.0), {
            "matched_skills": matched_skills[:10],  # Top 10
            "skill_categories": skill_categories,
            "total_matched": len(matched_skills)
        }

    def calculate_education_score(self, resume_education: str, resume_field: str, job_desc: str) -> tuple[float, Dict]:
        """Calculate education relevance score"""
        score = 0.0
        details = {}
        
        # Education level score
        for level, points in self.education_levels.items():
            if level in resume_education:
                score += points * 2
                details["level"] = level
                break
        
        # Field relevance
        relevant_fields = [
            'สารสนเทศ', 'คอมพิวเตอร์', 'วิศวกรรม', 'it', 'computer', 'information',
            'software', 'engineering', 'วิทยาการคอมพิวเตอร์', 'เทคโนโลยี'
        ]
        
        field_lower = resume_field.lower()
        job_lower = job_desc.lower()
        
        for field in relevant_fields:
            if field in field_lower:
                score += 5.0
                details["field_relevant"] = True
                break
        
        details["field"] = resume_field
        return min(score, 15.0), details

    def calculate_location_score(self, resume_province: str, job_desc: str) -> tuple[float, Dict]:
        """Calculate location match score"""
        resume_province_lower = resume_province.lower()
        job_desc_lower = job_desc.lower()
        
        # Check if location is mentioned in job description
        location_mentioned = False
        matched_province = None
        
        for province in self.thai_provinces:
            if province in job_desc_lower:
                location_mentioned = True
                if province in resume_province_lower:
                    matched_province = province
                    return 10.0, {"status": "exact_match", "province": province}
        
        # If no specific location mentioned, give neutral score
        if not location_mentioned:
            return 5.0, {"status": "not_specified", "province": resume_province}
        
        # Location mismatch
        return 2.0, {"status": "mismatch", "resume_province": resume_province}

    def calculate_experience_score(self, resume_experience: str, job_desc: str) -> tuple[float, Dict]:
        """Calculate experience relevance score"""
        job_exp_required = 0
        exp_patterns = [
            r'(\d+)\s*(?:ปี|years?)\s*(?:ขึ้นไป|experience|ประสบการณ์)',
            r'experience[:\s]*(\d+)\s*(?:years?|ปี)',
            r'ประสบการณ์[:\s]*(\d+)\s*ปี'
        ]
        
        for pattern in exp_patterns:
            match = re.search(pattern, job_desc.lower())
            if match:
                job_exp_required = int(match.group(1))
                break
        
        # If no experience requirement, give neutral score
        if job_exp_required == 0:
            return 5.0, {"status": "not_specified", "experience": resume_experience}
        
        # Check if resume mentions experience
        if not resume_experience or resume_experience == "-":
            return 3.0, {"status": "no_experience", "required": job_exp_required}
        
        # Give score based on experience match
        if "ปี" in resume_experience or "year" in resume_experience.lower():
            return 10.0, {"status": "has_experience", "experience": resume_experience, "required": job_exp_required}
        
        return 5.0, {"status": "unclear", "experience": resume_experience}

    def calculate_match_score(
        self,
        resume_data: Dict[str, str],
        analysis: Dict[str, Any],
        job_description: str
    ) -> Dict[str, Any]:
        """
        Enhanced match score calculation with NLP and multi-factor analysis
        """
        
        # 1. Skills matching (40 points)
        skills_score, skills_details = self.calculate_skills_match(resume_data, analysis, job_description)
        
        # 2. Position matching (25 points)
        position_score, matched_positions = self.calculate_position_similarity(
            resume_data.get("ตำแหน่งที่สมัคร", ""),
            resume_data.get("ตำแหน่งที่เคยทำ", ""),
            job_description
        )
        
        # 3. Salary matching (20 points)
        salary_score, salary_details = self.calculate_salary_score(
            resume_data.get("เงินเดือน", ""),
            job_description
        )
        
        # 4. Education matching (15 points)
        education_score, education_details = self.calculate_education_score(
            resume_data.get("ระดับการศึกษา", ""),
            resume_data.get("สาขา", ""),
            job_description
        )
        
        # 5. Location matching (10 points)
        location_score, location_details = self.calculate_location_score(
            resume_data.get("จังหวัด", ""),
            job_description
        )
        
        # 6. Experience matching (10 points)
        experience_score, experience_details = self.calculate_experience_score(
            resume_data.get("ตำแหน่งที่เคยทำ", ""),
            job_description
        )
        
        # Calculate total score
        total_score = (
            skills_score +
            position_score +
            salary_score +
            education_score +
            location_score +
            experience_score
        )
        
        # Generate recommendation
        recommendation = self._generate_recommendation(total_score, skills_details, salary_details)
        
        return {
            "total_score": round(total_score, 2),
            "breakdown": {
                "skills": round(skills_score, 2),
                "position": round(position_score, 2),
                "salary": round(salary_score, 2),
                "education": round(education_score, 2),
                "location": round(location_score, 2),
                "experience": round(experience_score, 2)
            },
            "details": {
                "skills": skills_details,
                "matched_positions": matched_positions,
                "salary": salary_details,
                "education": education_details,
                "location": location_details,
                "experience": experience_details
            },
            "recommendation": recommendation,
            "resume_data": {
                "id": resume_data.get("เรซูเม่ ID"),
                "score": resume_data.get("คะแนน"),
                "age": resume_data.get("อายุ"),
                "position": resume_data.get("ตำแหน่งที่สมัคร"),
                "province": resume_data.get("จังหวัด"),
                "salary": resume_data.get("เงินเดือน"),
                "education": resume_data.get("ระดับการศึกษา"),
                "field": resume_data.get("สาขา"),
                "university": resume_data.get("มหาวิทยาลัย"),
                "experience": resume_data.get("ตำแหน่งที่เคยทำ"),
                "updated": resume_data.get("อัปเดตล่าสุด"),
                "profile_url": resume_data.get("ลิงก์โปรไฟล์")
            }
        }

    def _generate_recommendation(self, total_score: float, skills_details: Dict, salary_details: Dict) -> str:
        """Generate hiring recommendation based on score"""
        if total_score >= 85:
            return "🌟 แนะนำเรียกสัมภาษณ์ทันที - ผู้สมัครมีคุณสมบัติตรงตามความต้องการสูงมาก"
        elif total_score >= 75:
            return "✅ แนะนำเรียกสัมภาษณ์ - ผู้สมัครมีคุณสมบัติดีและตรงตามที่ต้องการ"
        elif total_score >= 65:
            if skills_details.get("total_matched", 0) >= 5:
                return "⚠️ พิจารณาเรียกสัมภาษณ์ - มีทักษะที่ตรงกัน แต่ควรประเมินเพิ่มเติม"
            else:
                return "🔶 พิจารณาได้ - คุณสมบัติพอใช้ อาจต้องฝึกอบรมเพิ่มเติม"
        elif total_score >= 50:
            if salary_details.get("status") == "too_high":
                return "⚠️ พิจารณาอย่างรอบคอบ - คาดหวังเงินเดือนสูงเกินไป"
            else:
                return "🔶 พิจารณาได้ - ขาดคุณสมบัติบางส่วน แต่อาจพัฒนาได้"
        else:
            return "❌ ไม่แนะนำ - คุณสมบัติไม่ตรงกับความต้องการของงาน"

# Initialize matcher
matcher = EnhancedJobMatcher()

@router.post("/match-job", response_model=Dict[str, Any])
async def match_job_endpoint(payload: MatchJobRequest):
    """
    Enhanced job matching with NLP analysis
    """
    if not payload.job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")
    
    logger.info("Starting enhanced job matching process...")
    
    # Step 1: Scrape JobThai resumes
    try:
        from controllers.jobthai_scraper import scrape_jobthai_resumes
        
        logger.info("Scraping JobThai resumes...")
        csv_path = scrape_jobthai_resumes(
            phpsessid=payload.cookies.phpsessid,
            guest_id=payload.cookies.guest_id,
            fcnec=payload.cookies.fcnec,
            max_pages=10
        )
        logger.info(f"CSV saved to: {csv_path}")
        
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to scrape JobThai: {str(e)}"
        )
    
    # Step 2: Read CSV and match with enhanced algorithm
    if not os.path.exists(csv_path):
        raise HTTPException(status_code=500, detail="CSV file not found after scraping")
    
    matched_resumes: List[Dict[str, Any]] = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                try:
                    match_result = matcher.calculate_match_score(
                        resume_data=row,
                        analysis=payload.analysis,
                        job_description=payload.job_description
                    )
                    matched_resumes.append(match_result)
                    
                except Exception as e:
                    logger.warning(f"Error matching resume {row.get('เรซูเม่ ID')}: {e}")
                    continue
        
        # Sort by score (descending)
        matched_resumes.sort(key=lambda x: x['total_score'], reverse=True)
        
        # Get top 20 matches
        top_matches = matched_resumes[:20]
        
        # Calculate statistics
        avg_score = sum(r['total_score'] for r in matched_resumes) / len(matched_resumes) if matched_resumes else 0
        high_quality_count = sum(1 for r in matched_resumes if r['total_score'] >= 75)
        
        logger.info(f"Matched {len(matched_resumes)} resumes, returning top {len(top_matches)}")
        
        return {
            "status": "success",
            "statistics": {
                "total_resumes_scanned": len(matched_resumes),
                "average_score": round(avg_score, 2),
                "high_quality_matches": high_quality_count,
                "top_matches_count": len(top_matches)
            },
            "top_matches": top_matches,
            "csv_file": csv_path,
            "job_description": payload.job_description,
            "matching_algorithm": "Enhanced NLP-based matching with multi-factor analysis"
        }
        
    except Exception as e:
        logger.error(f"Error reading CSV: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process CSV: {str(e)}"
        )

@router.post("/upload-resumes")
async def upload_resumes(files: List[UploadFile] = File(...)):
    """Upload multiple resume files"""
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
    """List all resume files in the system"""
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
