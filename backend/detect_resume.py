"""
สคริปต์สำหรับตรวจจับและดึงข้อมูลทั้งหมดจาก Resume PDF
รองรับภาษาไทยและอังกฤษ
"""

import sys
import json
from controllers.resume_analyzer import ThaiResumeAnalyzer

def detect_all_data(file_path: str) -> dict:
    """
    ตรวจจับข้อมูลทั้งหมดจาก Resume
    
    Args:
        file_path: path ของไฟล์ PDF, DOCX หรือ TXT
    
    Returns:
        dict ที่มีข้อมูลทั้งหมดที่ตรวจจับได้
    """
    try:
        analyzer = ThaiResumeAnalyzer()
        
        # วิเคราะห์ Resume แบบครบวงจร
        analysis = analyzer.analyze_resume(file_path)
        
        if "error" in analysis:
            return {
                "success": False,
                "error": analysis["error"]
            }
        
        # จัดรูปแบบข้อมูลให้อ่านง่าย
        result = {
            "success": True,
            "data": {
                "สรุปสำหรับ HR": analysis.get('hr_summary', ''),
                "ข้อมูลติดต่อ": analysis.get('contact_info', {}),
                "ข้อมูลส่วนตัว": analysis.get('personal_info', {}),
                "การศึกษา": analysis.get('education', []),
                "ประสบการณ์การทำงาน": analysis.get('work_experience', []),
                "ประสบการณ์รวม": analysis.get('total_experience', ''),
                "หน้าที่รับผิดชอบ": analysis.get('responsibilities', []),
                "ทักษะ": analysis.get('skills', {}),
                "เงินเดือนที่ต้องการ": analysis.get('salary_expectation', ''),
                "ประกาศนียบัตร/การฝึกอบรม": analysis.get('certifications', []),
                "ความสามารถทางภาษา": analysis.get('language_skills', []),
                "ความสามารถในการขับขี่": analysis.get('driving_skills', {}),
                "ความสามารถพิเศษ": analysis.get('special_abilities', []),
                "ลิงค์": analysis.get('links', [])
            }
        }
        
        return result
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    file_path = "data/15.pdf"
    result = detect_all_data(file_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
