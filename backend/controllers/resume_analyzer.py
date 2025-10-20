""" Smart Job & Resume Analyzer - Enhanced Thai Optimized 
โปรแกรมวิเคราะห์ Resume และ Job Description ด้วย NLP 
รองรับภาษาไทยและอังกฤษ พร้อมสรุปสำหรับ HR 
เพิ่มการตรวจจับตำแหน่งงาน เงินเดือน สถานที่ ประเภทงาน และวันเริ่มงาน
"""

import re
import string
from collections import Counter
from typing import Dict, List, Tuple, Optional, Any
import PyPDF2
import docx
from pythainlp import word_tokenize
from pythainlp.corpus import thai_stopwords
from pythainlp.util import normalize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from datetime import datetime, timedelta

# Import OCR libraries
import pytesseract
from pdf2image import convert_from_path
import cv2
import numpy as np
from PIL import Image
import os

class ThaiResumeAnalyzer:
    def __init__(self):
        """Initialize analyzer with Thai-optimized patterns"""
        # ทักษะด้าน IT และเทคโนโลยี
        self.tech_skills = {
            'programming': ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go', 'sql', 'swift', 'kotlin', 'typescript', 'rust', 'scala', 'tester'],
            'web': ['html', 'css', 'react', 'vue', 'angular', 'node.js', 'django', 'flask', 'laravel', 'spring', 'express', 'next.js', 'nuxt.js'],
            'design': [
                'ux', 'ui', 'ux/ui design', 'user experience', 'user interface', 'wireframing', 
                'prototyping', 'interaction design', 'visual design', 'graphic design', 
                'responsive design', 'mobile design', 'web design', 'app design', 
                'user research', 'usability testing', 'design thinking', 'design system',
                'material design', 'human interface guidelines', 'adobe xd', 'sketch', 
                'figma', 'invision', 'marvel', 'principle', 'zeplin', 'balsamiq', 
                'axure', 'mockup', 'storyboard', 'information architecture', 
                'user journey', 'user flow', 'persona', 'heuristic evaluation',
                'accessibility design', 'ui components', 'design patterns'
            ],
            'mobile': ['android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova'],
            'database': ['sql', 'sql server', 'mysql', 'postgresql', 'mongodb', 'oracle', 'sqlite', 'redis', 'cassandra', 'dynamodb', 'firebase'],
            'cloud_devops': ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible', 'gitlab ci', 'github actions'],
            'data_science': ['machine learning', 'ai', 'deep learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'scikit-learn', 'keras'],
            'tools': ['git', 'github', 'gitlab', 'jira', 'confluence', 'photoshop', 'illustrator', 'figma', 'sketch', 'xd'],
            'networking': ['tcp/ip', 'vpn', 'firewall', 'router', 'switch', 'lan', 'wan', 'dns', 'dhcp'],
            'security': ['cybersecurity', 'encryption', 'authentication', 'authorization', 'ssl/tls', 'penetration testing', 'security audit']
        }
        
        # ทักษะภาษาไทย
        self.thai_skills = [
            'คอมพิวเตอร์', 'โปรแกรม', 'ออกแบบ', 'ซ่อม', 'บำรุง', 'ติดตั้ง', 'ลงโปรแกรม', 'ลงวินโดว์', 
            'รีโมท', 'ไดร์เวอร์', 'ปรินเตอร์', 'สแกนเนอร์', 'ฮาร์ดแวร์', 'ซอฟต์แวร์', 'ประสานงาน', 
            'บริการลูกค้า', 'แก้ไขปัญหา', 'จัดการ', 'admin', 'it', 'support', 'เอกสาร', 'ธุรการ',
            'บัญชี', 'การเงิน', 'การตลาด', 'ขาย', 'บริการ', 'ฝึกอบรม', 'สอน', 'แนะนำ', 'วิเคราะห์',
            'รายงาน', 'นำเสนอ', 'เจรจา', 'ติดต่อ', 'ประสานงาน', 'ดูแล', 'ควบคุม', 'พัฒนา',
            'ออกแบบเว็บ', 'ออกแบบแอป', 'ออกแบบยูไอ', 'ออกแบบยูเอ็กซ์', 'ออกแบบกราฟิก', 
            'ออกแบบภาพ', 'ออกแบบส่วนต่อประสาน', 'ออกแบบประสบการณ์ผู้ใช้', 'สร้างต้นแบบ',
            'สร้างแบบจำลอง', 'ออกแบบอนิเมชั่น', 'อนิเมชั่น', 'ออกแบบมือถือ', 'วิจัยผู้ใช้', 'ทดสอบการใช้งาน',
            'คิดเชิงออกแบบ', 'ระบบการออกแบบ', 'เส้นทางผู้ใช้', 'ลำดับการใช้งาน'
        ]

        self.technical_requirements = {
            'it_support': ['it support', 'technical support', 'helpdesk', 'service desk'],
            'customer_service': ['customer service', 'client support', 'user support'],
            'management': ['team management', 'supervision', 'leadership'],
            'troubleshooting': ['troubleshooting', 'problem solving', 'incident management'],
            'tools': ['crm', 'ticketing system', 'remote support', 'service now']
        }
        
        # ทักษะด้านธุรกิจและการจัดการ
        self.business_skills = {
            'management': [
                'project management', 'team management', 'strategic planning', 'budget management',
                'resource allocation', 'performance management', 'risk management', 'change management',
                'crisis management', 'time management', 'conflict resolution', 'decision making'
            ],
            'leadership': [
                'leadership', 'team building', 'mentoring', 'coaching', 'motivation', 'delegation',
                'strategic leadership', 'visionary leadership', 'transformational leadership'
            ],
            'business_analysis': [
                'business analysis', 'requirements gathering', 'process improvement', 'workflow analysis',
                'business process modeling', 'swot analysis', 'gap analysis', 'root cause analysis',
                'kpi monitoring', 'metrics tracking', 'data driven decision making'
            ],
            'strategy': [
                'business strategy', 'market analysis', 'competitive analysis', 'strategic planning',
                'business development', 'market research', 'feasibility study', 'strategic partnerships'
            ],
            'finance': [
                'financial analysis', 'budgeting', 'forecasting', 'financial modeling', 'cost benefit analysis',
                'roi analysis', 'investment analysis', 'financial reporting', 'cash flow management'
            ],
            'marketing_sales': [
                'digital marketing', 'content marketing', 'social media marketing', 'seo', 'sem',
                'email marketing', 'brand management', 'customer acquisition', 'sales strategy',
                'customer relationship management', 'crm', 'market segmentation', 'product positioning'
            ],
            'communication': [
                'business communication', 'presentation skills', 'negotiation', 'public speaking',
                'stakeholder management', 'client relations', 'corporate communication', 'cross cultural communication'
            ],
            'entrepreneurship': [
                'startup', 'business planning', 'venture capital', 'fundraising', 'pitch presentation',
                'product development', 'market validation', 'business model innovation'
            ],
            'operations': [
                'supply chain management', 'logistics', 'inventory management', 'quality control',
                'process optimization', 'lean management', 'six sigma', 'operational excellence'
            ]
        }
        
        # ตำแหน่งงานทั่วไป
        self.job_positions = {
            'it_tech': ['it support', 'programmer', 'developer', 'software engineer', 'web developer', 
                    'mobile developer', 'data analyst', 'data scientist', 'database administrator',
                    'system administrator', 'server', 'server engineer', 'network', 'network engineer', 'devops', 'devops engineer', 'qa', 'qa engineer',
                    'ux/ui designer', 'front-end developer', 'back-end developer', 'full-stack developer'],
            'admin': ['admin', 'ธุรการ', 'เจ้าหน้าที่', 'พนักงาน', 'secretary', 'office manager', 
                    'administrative assistant', 'coordinator'],
            'management': ['manager', 'supervisor', 'director', 'head', 'chief', 'lead', 'ผู้จัดการ', 
                        'หัวหน้า', 'ผู้บริหาร'],
            'engineering': ['engineer', 'วิศวกร', 'ช่างเทคนิค', 'ช่าง', 'technician'],
            'sales_marketing': ['sales', 'marketing', 'นักการตลาด', 'พนักงานขาย', 'account executive',
                            'business development', 'sales representative'],
            'finance': ['accountant', 'นักบัญชี', 'financial analyst', 'auditor', 'finance officer'],
            'hr': ['hr', 'human resources', 'recruiter', 'talent acquisition', 'บุคคล', 'ทรัพยากรบุคคล'],
            'customer_service': ['customer service', 'call center', 'support staff', 'บริการลูกค้า'],
            'business': [
                'business analyst', 'project manager', 'product manager', 'business development manager',
                'strategic planner', 'management consultant', 'operations manager', 'supply chain manager',
                'logistics manager', 'quality manager', 'process improvement specialist'
            ],
            'other': ['consultant', 'specialist', 'analyst', 'officer', 'assistant']
        }
        
        # ประเภทงาน
        self.job_types = {
            'full_time': ['full-time', 'full time', 'ประจำ', 'งานประจำ', 'เต็มเวลา'],
            'part_time': ['part-time', 'part time', 'พาร์ทไทม์', 'งานพาร์ทไทม์', 'ชั่วคราว'],
            'contract': ['contract', 'สัญญาจ้าง', 'contract basis', 'fixed-term'],
            'freelance': ['freelance', 'ฟรีแลนซ์', 'independent contractor', 'งานอิสระ'],
            'internship': ['intern', 'internship', 'ฝึกงาน', 'trainee', 'นักศึกษาฝึกงาน'],
            'remote': ['remote', 'work from home', 'wfh', 'ทำงานที่บ้าน', 'ทำงานระยะไกล']
        }
        
        # ทักษะธุรกิจภาษาไทย
        self.thai_business_skills = [
            'การจัดการ', 'การบริหาร', 'การวางแผน', 'การตลาด', 'การขาย', 'การบริการ', 'การเงิน', 'การบัญชี',
            'การวิเคราะห์', 'การเจรจา', 'การนำเสนอ', 'การสื่อสาร', 'การประสานงาน', 'การพัฒนาธุรกิจ',
            'การจัดการโครงการ', 'การจัดการทีม', 'การจัดการความเสี่ยง', 'การจัดการเวลา', 'การตัดสินใจ',
            'การสร้างทีม', 'การฝึกอบรม', 'การโค้ช', 'การสร้างแรงจูงใจ', 'การมอบหมายงาน',
            'การวิเคราะห์ตลาด', 'การวิจัยตลาด', 'การวิเคราะห์คู่แข่ง', 'การวางแผนกลยุทธ์',
            'การพัฒนาผลิตภัณฑ์', 'การจัดการลูกค้าสัมพันธ์', 'การจัดการซัพพลายเชน', 'การจัดการโลจิสติกส์',
            'การควบคุมคุณภาพ', 'การปรับปรุงกระบวนการ', 'การลดต้นทุน', 'การเพิ่มประสิทธิภาพ',
            'การวิเคราะห์ทางการเงิน', 'การจัดทำงบประมาณ', 'การพยากรณ์', 'การวิเคราะห์ roi',
            'การจัดการการเงิน', 'การรายงานทางการเงิน', 'การวิเคราะห์การลงทุน'
        ]
        
        # Stop words
        self.thai_stopwords = thai_stopwords()
        self.english_stopwords = set([
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 
            'in', 'with', 'to', 'for', 'of', 'as', 'by', 'from', 'that', 'this'
        ])
        
        # ข้อมูลจังหวัดไทย (เพิ่มเติม)
        self.thai_provinces = [
            'กรุงเทพ', 'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'สมุทรสาคร',
            'นครปฐม', 'พระนครศรีอยุธยา', 'อ่างทอง', 'ลพบุรี', 'สิงห์บุรี', 'ชัยนาท',
            'สระบุรี', 'ชลบุรี', 'ระยอง', 'จันทบุรี', 'ตราด', 'ฉะเชิงเทรา', 'ปราจีนบุรี',
            'นครนายก', 'สระแก้ว', 'เชียงใหม่', 'เชียงราย', 'ลำปาง', 'ลำพูน', 'พะเยา',
            'แพร่', 'น่าน', 'แม่ฮ่องสอน', 'อุตรดิตถ์', 'ตาก', 'สุโขทัย', 'พิษณุโลก',
            'พิจิตร', 'เพชรบูรณ์', 'กำแพงเพชร', 'นครสวรรค์', 'อุทัยธานี', 'ชัยภูมิ',
            'ขอนแก่น', 'อุดรธานี', 'เลย', 'หนองคาย', 'หนองบัวลำภู', 'มหาสารคาม',
            'ร้อยเอ็ด', 'กาฬสินธุ์', 'สกลนคร', 'นครพนม', 'มุกดาหาร', 'ยโสธร',
            'อำนาจเจริญ', 'บุรีรัมย์', 'สุรินทร์', 'ศรีสะเกษ', 'อุบลราชธานี', 'นครราชสีมา',
            'ราชบุรี', 'กาญจนบุรี', 'สุพรรณบุรี', 'เพชรบุรี', 'ประจวบคีรีขันธ์',
            'นครศรีธรรมราช', 'กระบี่', 'พังงา', 'ภูเก็ต', 'สุราษฎร์ธานี', 'ระนอง',
            'ชุมพร', 'สงขลา', 'สตูล', 'ตรัง', 'พัทลุง', 'ปัตตานี', 'ยะลา', 'นราธิวาส'
        ]
        
        # คำที่บอกถึงพื้นที่ทำงาน
        self.location_keywords = [
            'จังหวัด', 'เขต', 'อำเภอ', 'ตำบล', 'แขวง', 'ถนน', 'ซอย', 
            'สถานที่ทำงาน', 'สถานที่', 'ทำงานที่', 'ปฏิบัติงานที่'
        ]

    def read_pdf_with_ocr(self, file_path: str) -> str:
        """อ่านไฟล์ PDF ด้วย OCR สำหรับไฟล์ที่ข้อความไม่สามารถคัดลอกได้"""
        try:
            text = ""
            
            # ลองอ่านด้วย PyPDF2 ก่อน (สำหรับ PDF ที่มีข้อความ)
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text and len(page_text.strip()) > 50:  # ตรวจสอบว่ามีข้อความเพียงพอ
                            text += page_text + "\n"
                
                # ถ้าอ่านได้ข้อความเพียงพอ (> 100 ตัวอักษร) ให้ใช้วิธีนี้
                if len(text.strip()) > 100:
                    print("Using PyPDF2 text extraction (text-based PDF)")
                    return text
            except Exception as e:
                print(f"PyPDF2 extraction failed: {e}")
            
            # ถ้า PyPDF2 อ่านไม่ได้หรือได้ข้อความน้อย ให้ใช้ OCR
            print("Using OCR for PDF text extraction")
            
            # แปลง PDF เป็น images
            images = convert_from_path(file_path, dpi=300)
            
            for i, image in enumerate(images):
                print(f"Processing page {i+1}/{len(images)} with OCR...")
                
                # แปลง PIL Image เป็น OpenCV format
                open_cv_image = np.array(image)
                open_cv_image = open_cv_image[:, :, ::-1].copy()  # Convert RGB to BGR
                
                # Pre-process image สำหรับ OCR
                processed_image = self.preprocess_image_for_ocr(open_cv_image)
                
                # ใช้ Tesseract OCR ด้วยภาษาไทยและอังกฤษ
                page_text = pytesseract.image_to_string(
                    processed_image, 
                    lang='tha+eng',
                    config='--psm 6 -c preserve_interword_spaces=1'
                )
                
                if page_text:
                    text += page_text + "\n"
            
            return text
            
        except Exception as e:
            print(f"Error reading PDF with OCR: {e}")
            return ""

    def preprocess_image_for_ocr(self, image):
        """Pre-process image เพื่อเพิ่มความแม่นยำของ OCR"""
        try:
            # แปลงเป็น grayscale
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # ใช้ adaptive threshold เพื่อจัดการกับแสงที่ไม่สม่ำเสมอ
            thresh = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
            )
            
            # ลบ noise ด้วย morphological operations
            kernel = np.ones((1, 1), np.uint8)
            cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
            cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel)
            
            return cleaned
            
        except Exception as e:
            print(f"Image preprocessing error: {e}")
            return image

    def read_pdf(self, file_path: str) -> str: 
        """อ่านไฟล์ PDF - เวอร์ชันปรับปรุงให้ใช้ OCR เมื่อจำเป็น""" 
        return self.read_pdf_with_ocr(file_path)

    def read_docx(self, file_path: str) -> str:
        """อ่านไฟล์ Word"""
        try:
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"Error reading DOCX: {e}")
            return ""

    def read_file(self, file_path: str) -> str:
        """อ่านไฟล์ตามนามสกุล - เวอร์ชันแก้ไข"""
        try:
            if file_path.endswith('.pdf'):
                text = self.read_pdf_with_ocr(file_path)  # ใช้ OCR สำหรับ PDF
            elif file_path.endswith('.docx'):
                text = self.read_docx(file_path)
            elif file_path.endswith('.txt'):
                with open(file_path, 'r', encoding='utf-8') as f:
                    text = f.read()
            else:
                raise ValueError("รองรับเฉพาะไฟล์ .pdf, .docx, .txt")
            
            # ทำความสะอาดเบื้องต้นก่อน normalize
            text = self.clean_text(text)
            
            # Debug: แสดงข้อความก่อนและหลัง normalize
            print(f"DEBUG: Text length: {len(text)}")
            print(f"DEBUG: Text sample (first 200 chars): {text[:200]}")
            
            # Normalize ข้อความภาษาไทย
            text = self.normalize_thai_text(text)
            
            print(f"DEBUG: Normalized text sample (first 200 chars): {text[:200]}")
            
            return text
            
        except Exception as e:
            print(f"Error reading file: {e}")
            return ""

    def extract_desired_position(self, text: str) -> Optional[str]:
        """ดึงตำแหน่งงานที่ต้องการสมัคร"""
        patterns = [
            r'ตำแหน่งที่สนใจ[:\s]*([^\n\r]+)',
            r'ตำแหน่งที่ต้องการสมัคร[:\s]*([^\n\r]+)',
            r'ตำแหน่งงานที่สมัคร[:\s]*([^\n\r]+)',
            r'สมัครตำแหน่ง[:\s]*([^\n\r]+)',
            r'ตำแหน่งที่สมัคร[:\s]*([^\n\r]+)',
            r'desired position[:\s]*([^\n\r]+)',
            r'position applied[:\s]*([^\n\r]+)',
            r'applying for[:\s]*([^\n\r]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                position = match.group(1).strip()
                position = re.sub(r'[:\(\)\[\]{}]', '', position)
                position = position.split('\n')[0].strip()
                if len(position) > 3 and len(position) < 100:
                    return self.normalize_thai_text(position)
        
        return None

    def extract_expected_salary(self, text: str) -> Optional[Dict[str, Any]]:
        """ดึงเงินเดือนที่ต้องการแบบละเอียด"""
        salary_info = {}
        
        patterns = [
            r'เงินเดือนที่ต้องการ[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?\s*บาท',
            r'เงินเดือนที่คาดหวัง[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?\s*บาท',
            r'ค่าจ้างที่คาดหวัง[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?\s*บาท',
            r'expected salary[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?',
            r'salary expectation[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?',
            r'desired salary[:\s]*([0-9,]+)\s*(?:-\s*([0-9,]+))?',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                min_salary = match.group(1).replace(',', '')
                max_salary = match.group(2).replace(',', '') if match.group(2) else None
                
                # ตรวจสอบว่าเป็นตัวเลขที่สมเหตุสมผล
                if min_salary.isdigit():
                    salary_info['min_salary'] = int(min_salary)
                    if max_salary and max_salary.isdigit():
                        salary_info['max_salary'] = int(max_salary)
                        salary_info['salary_range'] = f"{int(min_salary):,} - {int(max_salary):,} บาท"
                    else:
                        salary_info['salary_range'] = f"{int(min_salary):,} บาท"
                    
                    # ตรวจสอบประเภทเงินเดือน
                    context = text[max(0, match.start()-50):match.end()+50]
                    if any(keyword in context.lower() for keyword in ['ต่อชั่วโมง', 'per hour', '/hour', '/hr']):
                        salary_info['type'] = 'hourly'
                    else:
                        salary_info['type'] = 'monthly'
                    
                    return salary_info
        
        # ถ้าไม่เจอรูปแบบที่ระบุชัดเจน
        return None

    def extract_work_location(self, text: str) -> Dict[str, Any]:
        """ดึงสถานที่ที่ต้องการทำงาน"""
        location_info = {
            'provinces': [],
            'areas': [],
            'specific_locations': [],
            'preferences': []
        }
        
        # หาจังหวัดที่ต้องการทำงาน
        patterns = [
            r'สถานที่ทำงานที่ต้องการ[:\s]*([^\n\r]+)',
            r'จังหวัดที่ต้องการทำงาน[:\s]*([^\n\r]+)',
            r'สถานที่ที่สามารถทำงานได้[:\s]*([^\n\r]+)',
            r'พื้นที่ที่ต้องการ[:\s]*([^\n\r]+)',
            r'preferred location[:\s]*([^\n\r]+)',
            r'work location[:\s]*([^\n\r]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                location_text = match.group(1).strip()
                # หาจังหวัดในข้อความ
                for province in self.thai_provinces:
                    if province in location_text:
                        if province not in location_info['provinces']:
                            location_info['provinces'].append(province)
                
                # เก็บข้อความทั้งหมดไว้
                location_info['specific_locations'].append(self.normalize_thai_text(location_text))
        
        # หาคำที่บ่งบอกความต้องการพิเศษ
        if 'ทำงานที่บ้าน' in text or 'work from home' in text.lower() or 'remote' in text.lower():
            location_info['preferences'].append('Remote/Work from home')
        
        if 'ทำงานในต่างประเทศ' in text or 'work abroad' in text.lower():
            location_info['preferences'].append('ต่างประเทศ')
        
        if 'ย้ายได้' in text or 'relocate' in text.lower():
            location_info['preferences'].append('สามารถย้ายที่ทำงานได้')
        
        # ถ้าไม่มีข้อมูลที่ระบุชัดเจน หาจังหวัดจากบริบท
        if not location_info['provinces']:
            for province in self.thai_provinces:
                # หาบริบทรอบๆ จังหวัด
                pattern = rf'(.{{0,30}}{re.escape(province)}.{{0,30}})'
                matches = re.findall(pattern, text)
                for match_text in matches:
                    # ตรวจสอบว่ามีคำที่บ่งบอกถึงการทำงาน
                    if any(keyword in match_text for keyword in ['ทำงาน', 'ปฏิบัติงาน', 'สนใจ', 'ต้องการ']):
                        if province not in location_info['provinces']:
                            location_info['provinces'].append(province)
        
        return location_info

    def extract_job_type(self, text: str) -> List[str]:
        """ดึงประเภทงานที่ต้องการ"""
        found_types = []
        
        for job_type, keywords in self.job_types.items():
            for keyword in keywords:
                if keyword in text.lower() or keyword in text:
                    type_name = {
                        'full_time': 'งานประจำ (Full-time)',
                        'part_time': 'งานพาร์ทไทม์ (Part-time)',
                        'contract': 'สัญญาจ้าง (Contract)',
                        'freelance': 'ฟรีแลนซ์ (Freelance)',
                        'internship': 'ฝึกงาน (Internship)',
                        'remote': 'ทำงานระยะไกล (Remote)'
                    }
                    if type_name[job_type] not in found_types:
                        found_types.append(type_name[job_type])
                    break
        
        return found_types if found_types else ['ไม่ระบุ']

    def extract_start_date(self, text: str) -> Optional[Dict[str, Any]]:
        """ดึงวันที่สามารถเริ่มงานได้"""
        start_date_info = {}
        
        patterns = [
            r'สามารถเริ่มงานได้[:\s]*([^\n\r]+)',
            r'วันที่สามารถเริ่มงาน[:\s]*([^\n\r]+)',
            r'เริ่มงานได้[:\s]*([^\n\r]+)',
            r'available (?:to start|from)[:\s]*([^\n\r]+)',
            r'start date[:\s]*([^\n\r]+)',
            r'can start[:\s]*([^\n\r]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_text = match.group(1).strip()
                start_date_info['raw_text'] = self.normalize_thai_text(date_text)
                
                # ตรวจสอบคำสำคัญ
                if 'ทันที' in date_text or 'immediate' in date_text.lower():
                    start_date_info['availability'] = 'ทันที'
                    start_date_info['date'] = datetime.now().strftime('%d/%m/%Y')
                    return start_date_info
                
                if 'ตามที่บริษัทกำหนด' in date_text or 'as per company' in date_text.lower():
                    start_date_info['availability'] = 'ตามที่บริษัทกำหนด'
                    return start_date_info
                
                # หาตัวเลขวันที่
                date_patterns = [
                    r'(\d{1,2})[/\-\.](\d{1,2})[/\-\.](\d{2,4})',  # 31/12/2024
                    r'(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})',
                ]
                
                for date_pattern in date_patterns:
                    date_match = re.search(date_pattern, date_text)
                    if date_match:
                        start_date_info['date'] = date_match.group(0)
                        start_date_info['availability'] = 'วันที่ระบุ'
                        return start_date_info
                
                # หาจำนวนสัปดาห์/เดือน
                period_match = re.search(r'(\d+)\s*(สัปดาห์|เดือน|week|month)', date_text, re.IGNORECASE)
                if period_match:
                    number = int(period_match.group(1))
                    unit = period_match.group(2).lower()
                    
                    if 'สัปดาห์' in unit or 'week' in unit:
                        days = number * 7
                        start_date_info['availability'] = f'{number} สัปดาห์'
                    else:
                        days = number * 30
                        start_date_info['availability'] = f'{number} เดือน'
                    
                    estimated_date = datetime.now() + timedelta(days=days)
                    start_date_info['estimated_date'] = estimated_date.strftime('%d/%m/%Y')
                    return start_date_info
                
                return start_date_info
        
        return None

    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """ดึงข้อมูลติดต่อแบบละเอียด"""
        contact = {}
        
        # Email
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact['email'] = emails[0]
            contact['emails'] = emails
        
        # เบอร์โทรไทย
        phone_patterns = [
            r'0[0-9]{1,2}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
            r'\+66[-.\s]?[0-9]{1,2}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
            r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}'
        ]
        
        all_phones = []
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            for phone in phones:
                clean_phone = re.sub(r'[^\d+]', '', phone)
                if len(clean_phone) >= 9 and clean_phone not in all_phones:
                    all_phones.append(clean_phone)
        
        if all_phones:
            contact['phone'] = all_phones[0]
            contact['phones'] = all_phones
        
        # ที่อยู่
        address_info = self.extract_address(text)
        if address_info:
            contact.update(address_info)
        
        # ชื่อ-นามสกุล
        name = self.extract_name(text)
        if name:
            contact['name'] = name
        
        return contact
    
    def extract_name(self, text: str) -> Optional[str]:
        """ดึงชื่อ-นามสกุล"""
        name_patterns = [
            r'ชื่อ[:\s]*([^\n\r\t]{2,20})\s+นามสกุล[:\s]*([^\n\r\t]{2,20})',
            r'ชื่อ-นามสกุล[:\s]*([^\n\r\t]{2,40})',
            r'Name[:\s]*([A-Za-z\s]{5,30})',
            r'Full Name[:\s]*([A-Za-z\s]{5,30})'
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if len(match.groups()) > 1:
                    return f"{match.group(1)} {match.group(2)}".strip()
                else:
                    return match.group(1).strip()
        
        return None
    
    def extract_address(self, text: str) -> Dict[str, str]:
        """ดึงข้อมูลที่อยู่"""
        address_info = {}
        
        for province in self.thai_provinces:
            if province in text:
                address_info['province'] = province
                break
        
        zip_pattern = r'\b[1-9][0-9]{4}\b'
        zip_match = re.search(zip_pattern, text)
        if zip_match:
            address_info['zip_code'] = zip_match.group()
        
        address_match = re.search(r'ที่อยู่[:\s]*([^\n]{10,100})', text)
        if address_match:
            address_info['address'] = address_match.group(1).strip()
        
        return address_info

    def extract_personal_info(self, text: str) -> Dict[str, Any]:
        """ดึงข้อมูลส่วนตัว"""
        info = {}
        
        age_match = re.search(r'อายุ\s*(\d+)\s*ปี', text)
        if age_match:
            info['age'] = int(age_match.group(1))
        
        if 'เพศ หญิง' in text or 'เพศหญิง' in text:
            info['gender'] = 'หญิง'
        elif 'เพศ ชาย' in text or 'เพศชาย' in text:
            info['gender'] = 'ชาย'
        
        if 'โสด' in text:
            info['marital_status'] = 'โสด'
        elif 'สมรส' in text:
            info['marital_status'] = 'สมรส'
        
        return info

    def extract_education(self, text: str) -> List[Dict[str, str]]:
        """ดึงข้อมูลการศึกษาแบบละเอียด - เวอร์ชันปรับปรุง"""
        education_list = []
        
        clean_text = self.normalize_thai_text(text)
        
        # Pattern ที่เฉพาะเจาะจงมากขึ้นสำหรับการศึกษา
        patterns = {
            'ปริญญาเอก': r'ปริญญาเอก.*?(?:สาขา|คณะ)\s*([^\n,]{5,80})',
            'ปริญญาโท': r'ปริญญาโท.*?(?:สาขา|คณะ)\s*([^\n,]{5,80})',
            'ปริญญาตรี': r'ปริญญาตรี.*?(?:สาขา|คณะ)\s*([^\n,]{5,80})',
            'ปวส': r'ปวส\.?.*?(?:สาขา|แผนก)\s*([^\n,]{5,80})',
            'ปวช': r'ปวช\.?.*?(?:สาขา|แผนก)\s*([^\n,]{5,80})',
            'มัธยมศึกษา': r'ม\.\s*[0-9].*?(?:สาย|แผนก)\s*([^\n,]{5,80})'
        }
        
        for degree, pattern in patterns.items():
            matches = re.finditer(pattern, clean_text, re.IGNORECASE)
            for match in matches:
                field = match.group(1).strip()
                
                # ทำความสะอาด field
                field = self.clean_education_field(field)
                
                if len(field) > 3:  # ตรวจสอบว่ามีข้อมูลเพียงพอ
                    edu_entry = {'degree': degree, 'field': field}
                    
                    # หา GPA จากบริบทใกล้เคียง
                    context_start = max(0, match.start() - 100)
                    context_end = min(len(clean_text), match.end() + 100)
                    context = clean_text[context_start:context_end]
                    
                    gpa_match = re.search(r'เกรดเฉลี่ย\s*(\d+\.\d+)', context)
                    if not gpa_match:
                        gpa_match = re.search(r'GPA\s*(\d+\.\d+)', context)
                    if gpa_match:
                        try:
                            edu_entry['gpa'] = float(gpa_match.group(1))
                        except:
                            pass
                    
                    # หาเกียรตินิยม
                    if 'เกียรตินิยม' in context:
                        honor_match = re.search(r'เกียรตินิยม.*?อันดับ\s*(\d+)', context)
                        if honor_match:
                            edu_entry['honor'] = f"เกียรตินิยมอันดับ {honor_match.group(1)}"
                    
                    # ตรวจสอบว่าไม่ซ้ำก่อนเพิ่ม
                    if not any(e['field'] == edu_entry['field'] and e['degree'] == edu_entry['degree'] for e in education_list):
                        education_list.append(edu_entry)
        
        return education_list

    def extract_salary_expectation(self, text: str) -> Optional[str]:
        """ดึงเงินเดือนที่ต้องการแบบละเอียด"""
        # ทำความสะอาดข้อความก่อน
        clean_text = self.normalize_thai_text(text)
        
        # รูปแบบต่างๆ ของเงินเดือนที่ต้องการ
        patterns = [
            # รูปแบบภาษาไทย
            r'เงินเดือนที่ต้องการ[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            r'ค่าจ้างที่คาดหวัง[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            r'เงินเดือนเบื้องต้น[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            r'เงินเดือน[:\s]*ที่ต้องการ[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            r'expected salary[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            r'salary expectation[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            
            # รูปแบบที่มีเฉพาะตัวเลข
            r'เงินเดือนที่ต้องการ[:\s]*([0-9,]+)',
            r'ค่าจ้างที่คาดหวัง[:\s]*([0-9,]+)',
            r'expected salary[:\s]*([0-9,]+)',
            r'salary[:\s]*([0-9,]+)[\s-]*([0-9,]*)\s*บาท',
            
            # รูปแบบช่วงเงินเดือน
            r'([0-9,]+)[\s-]*ถึง[\s-]*([0-9,]+)\s*บาท',
            r'([0-9,]+)[\s-]*-\s*([0-9,]+)\s*บาท',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, clean_text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    # กรณีเป็นช่วงเงินเดือน
                    if len(match) == 2 and match[0] and match[1]:
                        start_salary = match[0].replace(',', '')
                        end_salary = match[1].replace(',', '')
                        if start_salary.isdigit() and end_salary.isdigit():
                            return f"{start_salary}-{end_salary}"
                    # กรณีมีค่าเดียว
                    elif len(match) >= 1 and match[0]:
                        salary = match[0].replace(',', '')
                        if salary.isdigit():
                            return salary
                else:
                    # กรณี match เป็น string เดียว
                    salary = match.replace(',', '')
                    if salary.isdigit():
                        return salary
        
        # หาจากบริบทรอบๆ คำว่าเงินเดือน
        salary_context_patterns = [
            r'เงินเดือน\D{0,50}?([0-9,]{4,})',
            r'salary\D{0,50}?([0-9,]{4,})',
            r'ประมาณ\D{0,30}?([0-9,]{4,})\s*บาท',
            r'อยู่ที่\D{0,30}?([0-9,]{4,})\s*บาท'
        ]
        
        for pattern in salary_context_patterns:
            match = re.search(pattern, clean_text, re.IGNORECASE)
            if match:
                salary = match.group(1).replace(',', '')
                if salary.isdigit():
                    # ตรวจสอบว่าเป็นเงินเดือนที่สมเหตุสมผล (ไม่ต่ำกว่า 9,000 ไม่สูงกว่า 500,000)
                    salary_num = int(salary)
                    if 9000 <= salary_num <= 500000:
                        return salary
        
        # หาจากประสบการณ์การทำงานล่าสุด (ถ้ามี)
        work_exp = self.extract_work_experience(text)
        if work_exp:
            latest_exp = work_exp[0]
            if latest_exp.get('salary'):
                return latest_exp['salary']
        
        return None

    def extract_work_experience(self, text: str) -> List[Dict[str, Any]]:
        """ดึงประสบการณ์การทำงานแบบละเอียด - ปรับปรุง"""
        experiences = []
        clean_text = self.normalize_thai_text(text)
        
        # หาช่วงเวลาทำงาน (เดือน ปี - เดือน ปี)
        date_patterns = [
            r'((?:มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s*\d{4})\s*[-–]\s*((?:มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ปัจจุบัน)\s*\d{0,4})',
        ]
        
        for pattern in date_patterns:
            matches = re.finditer(pattern, clean_text)
            for match in matches:
                start_date = match.group(1).strip()
                end_date = match.group(2).strip()
                
                # ตรวจสอบว่าเป็นวันที่ที่สมเหตุสมผล
                if not self._is_valid_date_range(start_date, end_date):
                    continue
                    
                # หาตำแหน่งงาน (มองหาบริเวณรอบๆ ช่วงเวลา)
                start_pos = max(0, match.start() - 150)
                end_pos = min(len(clean_text), match.end() + 150)
                context_text = clean_text[start_pos:end_pos]
                
                # หาตำแหน่งจากรูปแบบต่างๆ
                position = "ไม่ระบุ"
                position_patterns = [
                    r'ตำแหน่ง[:\s]*([^\n,]{3,50})',
                    r'position[:\s]*([^\n,]{3,50})',
                    r'หน้าที่[:\s]*([^\n,]{3,50})',
                    r'เป็น[:\s]*([^\n,]{3,50})',
                    r'ทำงานเป็น[:\s]*([^\n,]{3,50})'
                ]
                
                for pos_pattern in position_patterns:
                    pos_match = re.search(pos_pattern, context_text, re.IGNORECASE)
                    if pos_match:
                        position = self.normalize_thai_text(pos_match.group(1).strip())
                        if len(position) > 2:  # ตรวจสอบว่ามีข้อมูลเพียงพอ
                            break
                
                # หาเงินเดือนจากประสบการณ์นั้นๆ
                salary = None
                salary_patterns = [
                    r'เงินเดือน[:\s]*([0-9,]+)',
                    r'salary[:\s]*([0-9,]+)',
                    r'ค่าจ้าง[:\s]*([0-9,]+)'
                ]
                
                for salary_pattern in salary_patterns:
                    salary_match = re.search(salary_pattern, context_text)
                    if salary_match:
                        salary = salary_match.group(1)
                        break
                
                # คำนวณระยะเวลา
                duration = self._calculate_duration(start_date, end_date)
                
                experiences.append({
                    'position': position,
                    'start_date': start_date,
                    'end_date': end_date,
                    'duration': duration,
                    'salary': salary
                })
        
        return experiences
    
    def _is_valid_date_range(self, start_date: str, end_date: str) -> bool:
        """ตรวจสอบว่าช่วงวันที่สมเหตุสมผล"""
        try:
            # ตรวจสอบรูปแบบพื้นฐาน
            if not start_date or not end_date:
                return False
                
            # ตรวจสอบว่ามีปีอยู่ในช่วงสมเหตุสมผล (2500-ปัจจุบัน)
            year_pattern = r'(\d{4})'
            start_year_match = re.search(year_pattern, start_date)
            end_year_match = re.search(year_pattern, end_date)
            
            if not start_year_match or not end_year_match:
                return False
                
            start_year = int(start_year_match.group(1))
            end_year = int(end_year_match.group(1)) if end_year_match.group(1).isdigit() else datetime.now().year
            
            # ตรวจสอบปี
            if start_year < 2500 or start_year > datetime.now().year + 5:
                return False
            if end_year < 2500 or end_year > datetime.now().year + 5:
                return False
            if start_year > end_year:
                return False
                
            return True
        except:
            return False

    def _calculate_duration(self, start: str, end: str) -> str:
        """คำนวณระยะเวลาการทำงาน"""
        months_thai = {
            'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4,
            'พฤษภาคม': 5, 'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8,
            'กันยายน': 9, 'ตุลาคม': 10, 'พฤศจิกายน': 11, 'ธันวาคม': 12
        }
        
        try:
            start_parts = start.split()
            if len(start_parts) >= 2:
                start_month = months_thai.get(start_parts[0], 1)
                start_year = int(start_parts[1]) - 543
            
            if 'ปัจจุบัน' in end:
                end_month = datetime.now().month
                end_year = datetime.now().year
            else:
                end_parts = end.split()
                if len(end_parts) >= 2:
                    end_month = months_thai.get(end_parts[0], 12)
                    end_year = int(end_parts[1]) - 543
                else:
                    return "ไม่ทราบ"
            
            total_months = (end_year - start_year) * 12 + (end_month - start_month)
            years = total_months // 12
            months = total_months % 12
            
            if years > 0 and months > 0:
                return f"{years} ปี {months} เดือน"
            elif years > 0:
                return f"{years} ปี"
            else:
                return f"{months} เดือน"
        except:
            return "ไม่ทราบ"

    def extract_skills_detailed(self, text: str) -> Dict[str, List[str]]:
        """ดึงทักษะแบบละเอียด - เวอร์ชันปรับปรุง"""
        # ใช้ทั้ง text เดิมและ normalized text
        text_lower = text.lower()
        normalized_text = self.normalize_thai_text(text)
        
        print(f"DEBUG extract_skills - Original text sample: {text_lower[:200]}...")
        print(f"DEBUG extract_skills - Normalized text sample: {normalized_text[:200]}...")
        
        found_skills = {}
        
        # ค้นหาทักษะภาษาอังกฤษ (IT + Business)
        for category, skills in {**self.tech_skills, **self.business_skills}.items():
            found = []
            for skill in skills:
                # ค้นหาใน text เดิม (ภาษาอังกฤษ)
                if skill in text_lower:
                    found.append(skill)
                    print(f"DEBUG: Found English skill '{skill}' in category '{category}'")
                
                # ค้นหาใน normalized text (ภาษาไทยที่ถูกต้อง)
                thai_skill_variations = self.get_thai_skill_variations(skill)
                for thai_skill in thai_skill_variations:
                    if thai_skill in normalized_text:
                        found.append(skill)  # เก็บเป็นภาษาอังกฤษเพื่อความสม่ำเสมอ
                        print(f"DEBUG: Found Thai variation '{thai_skill}' for skill '{skill}'")
                        break
            
            # เอาเฉพาะที่ไม่ซ้ำ
            found = list(set(found))
            if found:
                found_skills[category] = found

        # ค้นหาทักษะทาง Technical Requirements
        for category, skills in self.technical_requirements.items():
            found = []
            for skill in skills:
                if skill in text_lower:
                    found.append(skill)
            if found:
                found_skills[category] = found
        
        # ค้นหาทักษะภาษาไทย (ทั่วไป + ธุรกิจ)
        thai_found = []
        for skill in self.thai_skills + self.thai_business_skills:  # ใช้เฉพาะ lists
            if skill in normalized_text:
                thai_found.append(skill)
                print(f"DEBUG: Found Thai skill '{skill}'")
    
        if thai_found:
            found_skills['thai_skills'] = thai_found
    
        print(f"DEBUG: Final found skills: {found_skills}")
        return found_skills
    
    def get_thai_skill_variations(self, english_skill: str) -> List[str]:
        """แปลงทักษะภาษาอังกฤษเป็นรูปแบบภาษาไทยที่อาจพบ"""
        skill_variations = {
            'python': ['ไพธอน', 'python'],
            'java': ['จาวา', 'java'],
            'javascript': ['จาวาสคริปต์', 'javascript', 'js'],
            'sql': ['เอสคิวแอล', 'sql'],
            'html': ['เอชทีเอ็มแอล', 'html'],
            'css': ['ซีเอสเอส', 'css'],
            'react': ['รีแอคต์', 'react'],
            'angular': ['แองกูลาร์', 'angular'],
            'vue': ['วิว', 'vue'],
            'node.js': ['โนดเจเอส', 'node.js', 'nodejs'],
            'docker': ['ด็อกเกอร์', 'docker'],
            'kubernetes': ['คิวเบอร์เนตส์', 'kubernetes'],
            'aws': ['เอดับเบิลยูเอส', 'aws'],
            'azure': ['อาซูร์', 'azure'],
            'git': ['กิต', 'git'],
            'github': ['กิตฮับ', 'github'],
            'machine learning': ['แมชชีนเลิร์นนิง', 'machine learning'],
            'ai': ['เอไอ', 'ปัญญาประดิษฐ์', 'ai'],
            'data analysis': ['วิเคราะห์ข้อมูล', 'data analysis'],
            'flutter': ['ฟลัทเทอร์', 'flutter'],
            'android': ['แอนดรอยด์', 'android'],
            'ios': ['ไอโอเอส', 'ios'],
            'project management': ['การจัดการโครงการ', 'project management'],
            'business analysis': ['การวิเคราะห์ธุรกิจ', 'business analysis'],
            'strategic planning': ['การวางแผนกลยุทธ์', 'strategic planning'],
            'financial analysis': ['การวิเคราะห์ทางการเงิน', 'financial analysis'],
            'team management': ['การจัดการทีม', 'team management'],
            'leadership': ['ภาวะผู้นำ', 'leadership'],
            'business development': ['การพัฒนาธุรกิจ', 'business development'],
            'marketing': ['การตลาด', 'marketing'],
            'sales': ['การขาย', 'sales'],
            'communication': ['การสื่อสาร', 'communication'],
            'negotiation': ['การเจรจาต่อรอง', 'negotiation'],
            'budgeting': ['การจัดทำงบประมาณ', 'budgeting'],
            'risk management': ['การจัดการความเสี่ยง', 'risk management'],
            'quality control': ['การควบคุมคุณภาพ', 'quality control'],
            'process improvement': ['การปรับปรุงกระบวนการ', 'process improvement'],
            'supply chain management': ['การจัดการซัพพลายเชน', 'supply chain management'],
            'customer relationship management': ['การจัดการลูกค้าสัมพันธ์', 'customer relationship management'],
            'ux': ['ยูเอ็กซ์', 'ux', 'user experience', 'ประสบการณ์ผู้ใช้'],
            'ui': ['ยูไอ', 'ui', 'user interface', 'ส่วนต่อประสานผู้ใช้'],
            'ux/ui design': ['การออกแบบยูเอ็กซ์/ยูไอ', 'ux/ui design', 'การออกแบบประสบการณ์ผู้ใช้'],
            'user experience': ['ประสบการณ์ผู้ใช้', 'user experience', 'ยูเอ็กซ์'],
            'user interface': ['ส่วนต่อประสานผู้ใช้', 'user interface', 'ยูไอ'],
            'wireframing': ['การสร้างไวร์เฟรม', 'wireframing', 'การออกแบบโครงร่าง'],
            'prototyping': ['การสร้างต้นแบบ', 'prototyping', 'โปรโตไทป์'],
            'interaction design': ['การออกแบบอันตราเคชัน', 'interaction design', 'การออกแบบปฏิสัมพันธ์'],
            'visual design': ['การออกแบบภาพ', 'visual design', 'การออกแบบ视觉效果'],
            'graphic design': ['การออกแบบกราฟิก', 'graphic design', 'กราฟิกดีไซน์'],
            'responsive design': ['การออกแบบตอบสนอง', 'responsive design', 'การออกแบบสำหรับอุปกรณ์ต่างๆ'],
            'mobile design': ['การออกแบบมือถือ', 'mobile design', 'การออกแบบสำหรับมือถือ'],
            'web design': ['การออกแบบเว็บ', 'web design', 'ออกแบบเว็บไซต์'],
            'app design': ['การออกแบบแอป', 'app design', 'ออกแบบแอปพลิเคชัน'],
            'user research': ['การวิจัยผู้ใช้', 'user research', 'วิจัยผู้ใช้งาน'],
            'usability testing': ['การทดสอบการใช้งาน', 'usability testing', 'ทดสอบความใช้ง่าย'],
            'design thinking': ['การคิดเชิงออกแบบ', 'design thinking', 'กระบวนการออกแบบ'],
            'design system': ['ระบบการออกแบบ', 'design system', 'ระบบดีไซน์'],
            'material design': ['เมเทเรียลดีไซน์', 'material design', 'การออกแบบวัสดุ'],
            'figma': ['ฟิกมา', 'figma', 'ฟิกม่า'],
            'adobe xd': ['อะโดบี เอ็กซ์ดี', 'adobe xd', 'เอโดบี เอ็กซ์ดี'],
            'sketch': ['สเก็ตช์', 'sketch', 'สเกตช์'],
            'invision': ['อินวิชัน', 'invision', 'อินวิชั่น'],
            'mockup': ['ม็อคอัพ', 'mockup', 'แบบจำลอง'],
            'user journey': ['เส้นทางผู้ใช้', 'user journey', 'การเดินทางของผู้ใช้'],
            'user flow': ['โฟลว์ผู้ใช้', 'user flow', 'ลำดับการใช้งาน'],
            'accessibility design': ['การออกแบบสำหรับทุกคน', 'accessibility design', 'การออกแบบที่เข้าถึงได้']
        }
        
        return skill_variations.get(english_skill.lower(), [english_skill])

    def extract_responsibilities(self, text: str) -> List[str]:
        """ดึงหน้าที่รับผิดชอบ"""
        responsibilities = []
        
        resp_section = re.search(r'หน้าที่รับผิดชอบ[:\s]*(.*?)(?=ตำแหน่ง|ชื่อบริษัท|$)', text, re.DOTALL)
        if resp_section:
            resp_text = resp_section.group(1)
            items = re.split(r'\d+\.|\n-|\n•', resp_text)
            for item in items:
                item = item.strip()
                if len(item) > 10:
                    responsibilities.append(item[:200])
        
        return responsibilities[:5]

    def calculate_total_experience(self, experiences: List[Dict]) -> str:
        """คำนวณประสบการณ์รวม"""
        total_months = 0
        
        for exp in experiences:
            duration = exp.get('duration', '')
            years = re.search(r'(\d+)\s*ปี', duration)
            months = re.search(r'(\d+)\s*เดือน', duration)
            
            if years:
                total_months += int(years.group(1)) * 12
            if months:
                total_months += int(months.group(1))
        
        years = total_months // 12
        months = total_months % 12
        
        if years > 0 and months > 0:
            return f"{years} ปี {months} เดือน"
        elif years > 0:
            return f"{years} ปี"
        else:
            return f"{months} เดือน"
    
    def extract_certifications(self, text: str) -> List[Dict[str, str]]:
        """ดึงประวัติการฝึกอบรม/ประกาศนียบัตร - เวอร์ชันเดียว"""
        certifications = []
        
        # หาส่วนของการฝึกอบรมแบบเจาะจงมากขึ้น
        cert_section_patterns = [
            r'ประวัติการฝึกอบรม[^\n]{0,500}',
            r'ประกาศนียบัตร[^\n]{0,500}',
            r'หลักสูตรที่ผ่าน[^\n]{0,500}',
            r'Training[^\n]{0,500}',
            r'Certification[^\n]{0,500}'
        ]
        
        all_cert_text = ""
        for pattern in cert_section_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                all_cert_text += " " + match
        
        if not all_cert_text:
            # ถ้าไม่เจอส่วนเฉพาะ ลองหาจากทั้งเอกสาร
            all_cert_text = text
        
        # แยกแต่ละรายการ
        cert_items = re.split(r'\n\s*\d+\.|\n\s*[-•*]|\n\s*(?=หลักสูตร|ประกาศนียบัตร|Certificat)', all_cert_text)
        
        for item in cert_items:
            item = item.strip()
            
            # หาชื่อหลักสูตร
            name_patterns = [
                r'หลักสูตร\s*([^\n,]{5,100})',
                r'ประกาศนียบัตร\s*([^\n,]{5,100})',
                r'Certificat\w*\s*([^\n,]{5,100})',
                r'Training\s*in\s*([^\n,]{5,100})'
            ]
            
            cert_name = None
            for pattern in name_patterns:
                match = re.search(pattern, item, re.IGNORECASE)
                if match:
                    cert_name = match.group(1).strip()
                    break
            
            if not cert_name and len(item) > 10 and len(item) < 100:
                # ลองหาชื่อจากข้อความที่สั้นพอ
                cert_name = item
            
            if cert_name:
                # ทำความสะอาดชื่อ
                cert_name = self.normalize_thai_text(cert_name)
                cert_name = re.sub(r'\s+', ' ', cert_name).strip()
                
                # ตัดข้อความที่ยาวเกินไป
                if len(cert_name) > 80:
                    cert_name = cert_name[:80] + "..."
                
                # หาปีที่ได้รับ
                year_match = re.search(r'(20\d{2}|25\d{2})', item)
                year = year_match.group(1) if year_match else None
                
                # ตรวจสอบว่าไม่ซ้ำ
                if not any(c.get('name') == cert_name for c in certifications):
                    certifications.append({
                        'name': cert_name,
                        'year': year
                    })
        
        return certifications[:8]  # จำกัดไม่เกิน 8 รายการ

    def extract_language_skills(self, text: str) -> List[Dict[str, Any]]:
        """ดึงความสามารถทางภาษา"""
        languages = []
        
        clean_text = self.normalize_thai_text(text)
        
        lang_section = re.search(r'ความสามารถทางภาษา(.*?)(?=ความสามารถ|$)', clean_text, re.DOTALL | re.IGNORECASE)
        
        if lang_section:
            section_text = self.normalize_thai_text(lang_section.group(1))
            
            thai_match = re.search(r'ไทย\s*(\S+)\s*(\S+)\s*(\S+)', section_text)
            if thai_match:
                languages.append({
                    'language': 'ไทย',
                    'speaking': self.normalize_thai_text(thai_match.group(1)),
                    'reading': self.normalize_thai_text(thai_match.group(2)),
                    'writing': self.normalize_thai_text(thai_match.group(3))
                })
            
            eng_match = re.search(r'อังกฤษ\s*(\S+)\s*(\S+)\s*(\S+)', section_text)
            if eng_match:
                lang_entry = {
                    'language': 'อังกฤษ',
                    'speaking': self.normalize_thai_text(eng_match.group(1)),
                    'reading': self.normalize_thai_text(eng_match.group(2)),
                    'writing': self.normalize_thai_text(eng_match.group(3))
                }
                
                test_patterns = [
                    (r'TOEIC[:\s]*(\d+)', 'TOEIC'),
                    (r'IELTS[:\s]*(\d+\.?\d*)', 'IELTS'),
                    (r'CU-TEP[:\s]*(\d+)', 'CU-TEP'),
                    (r'TOEFL[:\s]*(\d+)', 'TOEFL')
                ]
                
                for pattern, test_name in test_patterns:
                    test_match = re.search(pattern, clean_text, re.IGNORECASE)
                    if test_match:
                        lang_entry['test_score'] = {
                            'test': test_name,
                            'score': test_match.group(1)
                        }
                        break
                
                languages.append(lang_entry)
        
        return languages

    def extract_driving_skills(self, text: str) -> Dict[str, Any]:
        """ดึงความสามารถในการขับขี่และรถที่มี"""
        driving_info = {
            'can_drive': [],
            'owns_vehicle': []
        }
        
        driving_patterns = [
            r'ความสามารถในการขับขี่[:\s]*([^\n]+)',
            r'สามารถขับ[:\s]*([^\n]+)',
            r'ขับขี่ได้[:\s]*([^\n]+)'
        ]
        
        for pattern in driving_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vehicles_text = match.group(1)
                if 'รถจักรยานยนต์' in vehicles_text or 'มอเตอร์ไซค์' in vehicles_text:
                    driving_info['can_drive'].append('รถจักรยานยนต์')
                if 'รถยนต์' in vehicles_text:
                    driving_info['can_drive'].append('รถยนต์')
                if 'รถกระบะ' in vehicles_text:
                    driving_info['can_drive'].append('รถกระบะ')
                break
        
        own_vehicle_patterns = [
            r'มี[:\s]*รถ([^\n]+)เป็นของตัวเอง',
            r'มีรถ([^\n]+)ส่วนตัว'
        ]
        
        for pattern in own_vehicle_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                vehicles_text = match.group(1)
                if 'รถจักรยานยนต์' in vehicles_text or 'มอเตอร์ไซค์' in vehicles_text:
                    driving_info['owns_vehicle'].append('รถจักรยานยนต์')
                if 'รถยนต์' in vehicles_text:
                    driving_info['owns_vehicle'].append('รถยนต์')
                if 'รถกระบะ' in vehicles_text:
                    driving_info['owns_vehicle'].append('รถกระบะ')
                break
        
        return driving_info

    def extract_special_abilities(self, text: str) -> List[str]:
        """ดึงความสามารถพิเศษอื่นๆ"""
        special_abilities = []
        
        special_section = re.search(
            r'ความสามารถพิเศษ(?:อื่น\s*ๆ)?[:\s]*(.*?)(?=\n\n|$)', 
            text, 
            re.DOTALL | re.IGNORECASE
        )
        
        if special_section:
            section_text = special_section.group(1).strip()
            items = re.split(r'\n[-•*]|\n\d+\.', section_text)
            for item in items:
                item = item.strip()
                if len(item) > 5 and len(item) < 200:
                    special_abilities.append(item)
        
        project_section = re.search(
            r'โครงการ\s*ผลงาน\s*เกียรติประวัติ[:\s]*(.*?)(?=\n\n|$)', 
            text, 
            re.DOTALL | re.IGNORECASE
        )
        
        if project_section:
            section_text = project_section.group(1).strip()
            if len(section_text) > 10:
                special_abilities.append(f"โครงการและผลงาน: {section_text[:200]}")
        
        return special_abilities[:5]

    def extract_links(self, text: str) -> List[str]:
        """ดึงลิงค์ต่างๆ และทำความสะอาด URL"""
        links = []
        
        # Pattern สำหรับ URL
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        
        urls = re.findall(url_pattern, text)
        
        for url in urls:
            try:
                # ทำความสะอาด URL
                cleaned_url = self._clean_and_validate_url(url)
                if cleaned_url and cleaned_url not in links:
                    links.append(cleaned_url)
            except Exception as e:
                print(f"Error cleaning URL {url}: {e}")
                continue
        
        return links

    def _clean_and_validate_url(self, url: str) -> str:
        """ทำความสะอาดและตรวจสอบความถูกต้องของ URL"""
        if not url:
            return ""
        
        # ทำความสะอาดเบื้องต้น - ตัดอักขระพิเศษท้ายออก
        url = re.sub(r'[,;.!?)\]\s]+$', '', url)
        url = url.strip()
        
        # ตรวจสอบว่าเป็น URL ที่ถูกต้อง
        if not re.match(r'^https?://', url, re.IGNORECASE):
            return ""
        
        # ลบข้อความภาษาไทยที่อยู่ด้านหลัง URL
        url = self._remove_thai_text_from_url(url)
        
        # แยกส่วนของ URL
        try:
            from urllib.parse import urlparse, urlunparse
            
            parsed = urlparse(url)
            
            # ทำความสะอาด path - ลบอักขระที่ไม่เหมาะสมและข้อความภาษาไทย
            if parsed.path:
                # ลบช่องว่างและอักขระพิเศษใน path
                clean_path = re.sub(r'[\s<>"{}|\\^`\[\]]', '', parsed.path)
                # ลบข้อความภาษาไทยจาก path
                clean_path = self._remove_thai_text_from_path(clean_path)
                # ตรวจสอบว่า path ลงท้ายด้วย / หรือไม่
                if clean_path and not clean_path.endswith('/'):
                    # ตรวจสอบว่าเป็นไฟล์หรือไม่ (มี extension)
                    if not re.search(r'\.[a-zA-Z]{2,4}$', clean_path):
                        clean_path = clean_path + '/'
            else:
                clean_path = '/'
            
            # ทำความสะอาด query parameters
            clean_query = ""
            if parsed.query:
                # ลบ query parameters ที่มีอักขระพิเศษ
                clean_query = re.sub(r'[\s<>"{}|\\^`\[\]]', '', parsed.query)
                # ลบข้อความภาษาไทยจาก query
                clean_query = self._remove_thai_text_from_query(clean_query)
            
            # สร้าง URL ใหม่ที่สะอาด
            cleaned_url = urlunparse((
                parsed.scheme,
                parsed.netloc,
                clean_path,
                parsed.params,
                clean_query,
                parsed.fragment
            ))
            
            # ตรวจสอบความยาวของ URL
            if len(cleaned_url) > 500:
                print(f"Warning: URL too long, truncating: {cleaned_url[:100]}...")
                cleaned_url = cleaned_url[:500]
            
            # ตรวจสอบรูปแบบสุดท้าย
            if self._is_valid_url_format(cleaned_url):
                return cleaned_url
            else:
                return ""
                
        except Exception as e:
            print(f"Error parsing URL {url}: {e}")
            # ถ้า parsing ล้มเหลว ให้ทำความสะอาดแบบพื้นฐาน
            return self._basic_url_cleanup(url)
        
    def _remove_thai_text_from_url(self, url: str) -> str:
        """ลบข้อความภาษาไทยออกจาก URL"""
        # รูปแบบสำหรับหาตำแหน่งที่ข้อความภาษาไทยเริ่มต้นใน URL
        thai_text_patterns = [
            # หาตำแหน่งที่ข้อความภาษาไทยเริ่มต้น (หลังจาก domain/path)
            r'(https?://[^\s]+?)([\u0E00-\u0E7F].*)$',
            # หาตำแหน่งที่ข้อความภาษาไทยเริ่มต้นใน path
            r'(https?://[^/]+)(/[^\u0E00-\u0E7F]*)([\u0E00-\u0E7F].*)$'
        ]
        
        for pattern in thai_text_patterns:
            match = re.search(pattern, url)
            if match:
                # เก็บเฉพาะส่วนที่ไม่ใช่ภาษาไทย
                if len(match.groups()) >= 1:
                    clean_part = match.group(1)
                    # ตรวจสอบว่า clean_part ลงท้ายด้วย / หรือไม่
                    if not clean_part.endswith('/'):
                        clean_part += '/'
                    return clean_part
        
        return url
    
    def _remove_thai_text_from_path(self, path: str) -> str:
        """ลบข้อความภาษาไทยออกจาก path"""
        if not path:
            return path
        
        # หาตำแหน่งที่ข้อความภาษาไทยเริ่มต้นใน path
        thai_pattern = r'^([^\u0E00-\u0E7F]*)([\u0E00-\u0E7F].*)$'
        match = re.search(thai_pattern, path)
        
        if match:
            clean_part = match.group(1)
            # ตรวจสอบว่า clean_part ลงท้ายด้วย / หรือไม่
            if clean_part and not clean_part.endswith('/'):
                # ตรวจสอบว่าเป็นไฟล์หรือไม่
                if not re.search(r'\.[a-zA-Z]{2,4}$', clean_part):
                    clean_part += '/'
            return clean_part
        
        return path

    def _remove_thai_text_from_query(self, query: str) -> str:
        """ลบข้อความภาษาไทยออกจาก query parameters"""
        if not query:
            return query
        
        # แยก query parameters
        params = query.split('&')
        clean_params = []
        
        for param in params:
            # ตรวจสอบแต่ละ parameter ว่ามีข้อความภาษาไทยหรือไม่
            if '=' in param:
                key, value = param.split('=', 1)
                # ถ้า value มีข้อความภาษาไทย ให้ข้าม parameter นี้
                if not re.search(r'[\u0E00-\u0E7F]', value):
                    clean_params.append(f"{key}={value}")
            else:
                # ถ้า parameter ไม่มี = และไม่มีข้อความภาษาไทย
                if not re.search(r'[\u0E00-\u0E7F]', param):
                    clean_params.append(param)
        
        return '&'.join(clean_params)

    def _is_valid_url_format(self, url: str) -> bool:
        """ตรวจสอบว่า URL มีรูปแบบถูกต้อง"""
        # ตรวจสอบรูปแบบพื้นฐาน
        url_pattern = r'^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s<>"{}|\\^`\[\]]*)?$'
        if not re.match(url_pattern, url, re.IGNORECASE):
            return False
        
        # ตรวจสอบความยาว
        if len(url) < 8 or len(url) > 500:
            return False
        
        # ตรวจสอบอักขระต้องห้าม
        forbidden_chars = ['<', '>', '"', '{', '}', '|', '\\', '^', '`', '[', ']', '\t', '\n', '\r']
        if any(char in url for char in forbidden_chars):
            return False
        
        return True

    def _basic_url_cleanup(self, url: str) -> str:
        """ทำความสะอาด URL แบบพื้นฐาน"""
        # ตัดอักขระพิเศษท้าย URL
        url = re.sub(r'[,\s.!?;)\]]+$', '', url)
        
        # ตัดอักขระพิเศษที่อาจอยู่กลาง URL
        url = re.sub(r'[\s<>"{}|\\^`\[\]]', '', url)
        
        # ลบข้อความภาษาไทยจาก URL
        url = self._remove_thai_text_from_url(url)
        
        # ตรวจสอบว่า URL ลงท้ายด้วย / หรือไม่
        if url and not url.endswith('/'):
            # ถ้าไม่มี extension และไม่ใช่ไฟล์ ให้เพิ่ม /
            if not re.search(r'\.[a-zA-Z]{2,4}$', url):
                url = url + '/'
        
        return url

    def extract_links_with_validation(self, text: str) -> Dict[str, Any]:
        """ดึงลิงค์พร้อมข้อมูลเพิ่มเติมและการตรวจสอบ"""
        raw_links = self.extract_links(text)
        validated_links = []
        
        for link in raw_links:
            link_info = {
                'url': link,
                'type': self._classify_link_type(link),
                'is_valid_format': self._is_valid_url_format(link),
                'domain': self._extract_domain(link)
            }
            validated_links.append(link_info)
        
        return {
            'all_links': validated_links,
            'total_count': len(validated_links),
            'by_type': self._categorize_links_by_type(validated_links)
        }

    def _classify_link_type(self, url: str) -> str:
        """จำแนกประเภทของลิงก์"""
        url_lower = url.lower()
        
        if 'github.com' in url_lower:
            return 'github'
        elif 'linkedin.com' in url_lower or 'linked.in' in url_lower:
            return 'linkedin'
        elif 'portfolio' in url_lower or 'personal' in url_lower:
            return 'portfolio'
        elif 'behance.net' in url_lower:
            return 'behance'
        elif 'dribbble.com' in url_lower:
            return 'dribbble'
        elif 'facebook.com' in url_lower:
            return 'facebook'
        elif 'instagram.com' in url_lower:
            return 'instagram'
        elif 'twitter.com' in url_lower or 'x.com' in url_lower:
            return 'twitter'
        elif 'youtube.com' in url_lower:
            return 'youtube'
        elif 'medium.com' in url_lower:
            return 'medium'
        elif 'stackoverflow.com' in url_lower:
            return 'stackoverflow'
        elif any(domain in url_lower for domain in ['.edu', 'ac.th', 'university']):
            return 'education'
        elif any(keyword in url_lower for keyword in ['blog', 'article', 'writing']):
            return 'blog'
        else:
            return 'website'

    def _extract_domain(self, url: str) -> str:
        """ดึง domain name จาก URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc
        except:
            return ""

    def _categorize_links_by_type(self, links: List[Dict]) -> Dict[str, List[str]]:
        """จัดกลุ่มลิงก์ตามประเภท"""
        categorized = {}
        for link_info in links:
            link_type = link_info['type']
            if link_type not in categorized:
                categorized[link_type] = []
            categorized[link_type].append(link_info['url'])
        return categorized

    def clean_text(self, text: str) -> str:
        """ทำความสะอาดข้อความและลบอักขระพิเศษ - เวอร์ชันแก้ไข"""
        if not text:
            return ""
        
        # ลบอักขระควบคุมและอักขระพิเศษ แต่รักษาตัวอักษรภาษาไทย
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        text = re.sub(r'[\u200b\u200c\u200d\uFEFF]', '', text)
        
        # แทนที่ช่องว่างหลายๆ ช่องด้วยช่องว่างเดียว (เฉพาะช่องว่างระหว่างคำ)
        # แต่ไม่ลบช่องว่างภายในคำภาษาไทย
        text = re.sub(r'(?<!\S)\s+(?!\S)', ' ', text)  # ช่องว่างระหว่างคำเท่านั้น
        text = re.sub(r'\n+', '\n', text)  # ลบบรรทัดใหม่ซ้ำ
        
        # ลบช่องว่างหัวท้าย
        text = text.strip()
        
        return text

    def normalize_thai_text(self, text: str) -> str:
        """ปรับปรุงข้อความภาษาไทยให้เป็นมาตรฐาน - เวอร์ชันแก้ไข"""
        try:
            # ใช้ pythainlp เพื่อ normalize ข้อความไทย (จะแก้ไขช่องว่างในคำ)
            text = normalize(text)
            
            # แก้ไขคำไทยที่พบบ่อย - รักษาช่องว่างที่ถูกต้อง
            replacements = {
                'จ ัดการ': 'จัดการ',
                'ท ัu0000วไป': 'ทั่วไป',
                'เยีu0000ยม': 'เยี่ยม',
                'คอมพ ิวเตอร ์': 'คอมพิวเตอร์',
                'เทคโนโลย ี': 'เทคโนโลยี',
                'สารสนเทศ': 'สารสนเทศ',
                'ใช ้': 'ใช้',
                'เกรดเฉล ีย': 'เกรดเฉลี่ย',
                'ประว ัติ': 'ประวัติ',
                'พน ักงาน': 'พนักงาน',
                'บร ิษัท': 'บริษัท',
                'แผนก': 'แผนก',
                'ประสานงาน': 'ประสานงาน',
                'การศ ึกษา': 'การศึกษา',
                'ว ิทยาศาสตร์': 'วิทยาศาสตร์',
                'ว ิชาการ': 'วิชาการ',
                'การเง ิน': 'การเงิน',
                'การบ ัญชี': 'การบัญชี',
                'เทคน ิก': 'เทคนิค',
                'คอมพ ิวเตอร์': 'คอมพิวเตอร์',
                'โปรแกรม': 'โปรแกรม',
                'ซอฟต ์แวร์': 'ซอฟต์แวร์',
                'ฮาร์ดแวร ์': 'ฮาร์ดแวร์'
            }
            
            for wrong, correct in replacements.items():
                text = text.replace(wrong, correct)
                
            return text
        except Exception as e:
            print(f"Error normalizing Thai text: {e}")
            return text

    def clean_contact_info(self, contact: Dict) -> Dict:
        """ทำความสะอาดข้อมูลติดต่อ"""
        cleaned = {}
        for key, value in contact.items():
            if isinstance(value, str):
                cleaned[key] = self.normalize_thai_text(value)
            elif isinstance(value, list):
                cleaned[key] = [self.normalize_thai_text(str(item)) for item in value]
            else:
                cleaned[key] = value
        return cleaned

    def clean_work_experience_list(self, work_exp: List[Dict]) -> List[Dict]:
        """ทำความสะอาดรายการประสบการณ์ทำงาน"""
        cleaned = []
        for exp in work_exp:
            cleaned_exp = {}
            for key, value in exp.items():
                if isinstance(value, str):
                    cleaned_exp[key] = self.normalize_thai_text(value)
                else:
                    cleaned_exp[key] = value
            cleaned.append(cleaned_exp)
        return cleaned

    def clean_skills_dict(self, skills: Dict) -> Dict:
        """ทำความสะอาดทักษะ"""
        cleaned = {}
        for category, skill_list in skills.items():
            cleaned[category] = [self.normalize_thai_text(skill) for skill in skill_list]
        return cleaned

    def clean_certifications_list(self, certifications: List[Dict]) -> List[Dict]:
        """ทำความสะอาดรายการประกาศนียบัตร"""
        cleaned = []
        for cert in certifications:
            cleaned_cert = {}
            for key, value in cert.items():
                if isinstance(value, str):
                    cleaned_cert[key] = self.normalize_thai_text(value)
                else:
                    cleaned_cert[key] = value
            cleaned.append(cleaned_cert)
        return cleaned

    def clean_language_skills_list(self, language_skills: List[Dict]) -> List[Dict]:
        """ทำความสะอาดรายการความสามารถทางภาษา"""
        cleaned = []
        for lang in language_skills:
            cleaned_lang = {}
            for key, value in lang.items():
                if isinstance(value, str):
                    cleaned_lang[key] = self.normalize_thai_text(value)
                elif isinstance(value, dict):
                    cleaned_lang[key] = {
                        k: self.normalize_thai_text(str(v)) for k, v in value.items()
                    }
                else:
                    cleaned_lang[key] = value
            cleaned.append(cleaned_lang)
        return cleaned
    
    def clean_education_field(self, field: str) -> str:
        """ทำความสะอาดข้อมูลสาขาการศึกษา"""
        if not field:
            return "ไม่ระบุ"
        
        # ลบข้อมูลที่ไม่เกี่ยวข้อง
        patterns_to_remove = [
            r'เกรดเฉลี่ย.*',
            r'GPA.*', 
            r'ประวัติการทำงาน.*',
            r'ตำแหน่ง.*',
            r'เงินเดือน.*',
            r'หน้าที่รับผิดชอบ.*',
            r'ระดับ.*',
            r'ชื่อบริษัท.*',
            r'ที่อยู่.*',
            r'ติดต่อ.*',
            r'นักศึกษาฝึกงาน.*',
            r'เจ้าหน้าที่.*',
            r'Microsoft Office.*',
            r'Create Testcase.*',
            r'Manual Test.*',
            r'Scenario.*',
            r'Log Issue.*',
            r'สรรหาบุคลากร.*',
            r'อบรมปฐมนิเทศ.*',
            r'บันทึกประวัติ.*',
            r'ดูแล.*',
            r'จัดทำKPI.*',
            r'สวัสดิการ.*',
            r'ลงทะเบียน.*',
            r'ทำบัตร.*',
            r'ดูแลเงินสด.*',
            r'บิลน้ำมัน.*',
            r'.*256[0-9].*',  # ลบปีต่างๆ
        ]
        
        cleaned_field = field
        for pattern in patterns_to_remove:
            cleaned_field = re.sub(pattern, '', cleaned_field)
        
        # ทำความสะอาดช่องว่าง
        cleaned_field = re.sub(r'\s+', ' ', cleaned_field).strip()
        
        # ตัดให้มีความยาวเหมาะสม
        if len(cleaned_field) > 50:
            cleaned_field = cleaned_field[:50] + "..."
        
        return self.normalize_thai_text(cleaned_field)
    
    def clean_education_list(self, education_list: List[Dict]) -> List[Dict]:
        """ทำความสะอาดรายการการศึกษา - เวอร์ชันแก้ไข"""
        cleaned = []
        for edu in education_list:
            cleaned_edu = {}
            for key, value in edu.items():
                if key == 'field' and isinstance(value, str):
                    # ใช้ฟังก์ชันทำความสะอาด field โดยเฉพาะ
                    cleaned_edu[key] = self.clean_education_field(value)
                elif isinstance(value, str):
                    cleaned_edu[key] = self.normalize_thai_text(value)
                else:
                    cleaned_edu[key] = value
            cleaned.append(cleaned_edu)
        return cleaned

    def generate_hr_summary(self, analysis: Dict) -> str:
        """สร้างสรุปสำหรับ HR แบบกระชับ - แก้ไขเวอร์ชัน"""
        summary_parts = []
        
        # ข้อมูลพื้นฐาน
        personal = analysis.get('personal_info', {})
        if personal:
            age = personal.get('age', 'N/A')
            gender = personal.get('gender', 'N/A')
            summary_parts.append(f"👤 {gender}, อายุ {age} ปี")
        
        # ตำแหน่งที่ต้องการ
        desired_position = analysis.get('desired_position')
        if desired_position:
            # ตัดให้สั้นลงถ้ายาวเกิน
            if len(desired_position) > 40:
                desired_position = desired_position[:40] + "..."
            summary_parts.append(f"🎯 ตำแหน่งที่ต้องการ: {desired_position}")
        
        # การศึกษา - แก้ไขให้แสดงเฉพาะข้อมูลสำคัญ
        education = analysis.get('education', [])
        if education:
            highest = education[0]
            clean_degree = self.normalize_thai_text(highest['degree'])
            clean_field = self.normalize_thai_text(highest['field'])
            
            # ตัด field ให้สั้นลง
            if len(clean_field) > 30:
                clean_field = clean_field[:30] + "..."
            
            edu_text = f"🎓 {clean_degree} {clean_field}"
            if 'gpa' in highest:
                edu_text += f" (GPA {highest['gpa']})"
            summary_parts.append(edu_text)
        
        # ประสบการณ์
        total_exp = analysis.get('total_experience', '')
        if total_exp and total_exp != "ไม่มีประสบการณ์":
            summary_parts.append(f"💼 ประสบการณ์: {total_exp}")
        
        # ตำแหน่งล่าสุด
        experiences = analysis.get('work_experience', [])
        if experiences:
            latest = experiences[0]
            clean_position = self.normalize_thai_text(latest['position'])
            if clean_position != "ไม่ระบุ":
                # ตัดให้สั้นลง
                if len(clean_position) > 30:
                    clean_position = clean_position[:30] + "..."
                summary_parts.append(f"📌 ตำแหน่งล่าสุด: {clean_position}")
        
        # ทักษะหลัก - แสดงเฉพาะ 3-4 ทักษะหลัก
        skills = analysis.get('skills', {})
        top_skills = []
        
        # ให้ความสำคัญกับ technical skills ก่อน
        for category in ['programming', 'web', 'database', 'tools']:
            if category in skills:
                top_skills.extend(skills[category][:2])
        
        # ถ้ามีทักษะน้อยเกินไป ให้เพิ่มจากหมวดอื่น
        if len(top_skills) < 3 and 'thai_skills' in skills:
            top_skills.extend(skills['thai_skills'][:2])
        
        # เอาเฉพาะที่ไม่ซ้ำและไม่เกิน 4 อัน
        unique_skills = []
        for skill in top_skills[:4]:
            if skill not in unique_skills:
                unique_skills.append(skill)
        
        if unique_skills:
            summary_parts.append(f"💡 ทักษะ: {', '.join(unique_skills)}")
        
        # เงินเดือนที่ต้องการ
        salary_details = analysis.get('expected_salary_details')
        if salary_details:
            summary_parts.append(f"💰 เงินเดือน: {salary_details.get('salary_range', 'N/A')}")
        else:
            salary = analysis.get('salary_expectation')
            if salary:
                if '-' in str(salary):
                    salary_parts = str(salary).split('-')
                    if len(salary_parts) == 2:
                        formatted_salary = f"{int(salary_parts[0]):,}-{int(salary_parts[1]):,}"
                    else:
                        formatted_salary = f"{int(salary):,}"
                else:
                    try:
                        formatted_salary = f"{int(salary):,}"
                    except:
                        formatted_salary = str(salary)
                summary_parts.append(f"💰 เงินเดือน: {formatted_salary} บาท")
        
        # สถานที่ทำงานที่ต้องการ - แสดงเฉพาะ 1-2 จังหวัด
        location = analysis.get('preferred_location', {})
        if location.get('provinces'):
            provinces = location['provinces'][:2]  # เอาแค่ 2 จังหวัดแรก
            if 'กรุงเทพมหานคร' in provinces and 'กรุงเทพ' in provinces:
                provinces = ['กรุงเทพ']  # หลีกเลี่ยงการซ้ำ
            summary_parts.append(f"📍 สถานที่: {', '.join(provinces)}")
        
        # ประเภทงาน - แสดงเฉพาะประเภทหลัก
        job_types = analysis.get('preferred_job_type', [])
        if job_types and job_types != ['ไม่ระบุ']:
            # เลือกเฉพาะประเภทที่สำคัญ
            main_types = [jt for jt in job_types if any(x in jt for x in ['ประจำ', 'Part-time', 'Contract', 'Internship'])]
            if main_types:
                summary_parts.append(f"⏰ ประเภท: {main_types[0]}")
        
        return "\n".join(summary_parts)

    def analyze_resume(self, file_path: str) -> Dict:
        """วิเคราะห์ Resume แบบครบวงจร"""
        try:
            text = self.read_file(file_path)
            if not text:
                return {"error": "ไม่สามารถอ่านไฟล์ได้"}
            
            desired_position = self.extract_desired_position(text)
            expected_salary = self.extract_expected_salary(text)
            preferred_location = self.extract_work_location(text)
            preferred_job_type = self.extract_job_type(text)
            available_start_date = self.extract_start_date(text)
            contact = self.extract_contact_info(text)
            personal = self.extract_personal_info(text)
            education = self.extract_education(text)
            work_exp = self.extract_work_experience(text)
            skills = self.extract_skills_detailed(text)
            responsibilities = self.extract_responsibilities(text)
            total_exp = self.calculate_total_experience(work_exp)
            salary_expectation = self.extract_salary_expectation(text)
            certifications = self.extract_certifications(text)
            language_skills = self.extract_language_skills(text)
            driving_skills = self.extract_driving_skills(text)
            special_abilities = self.extract_special_abilities(text)
            links_info = self.extract_links_with_validation(text)
            basic_links = self.extract_links(text)
            
            # ทำความสะอาดข้อมูลทั้งหมด
            analysis = {
                'contact_info': self.clean_contact_info(contact),
                'personal_info': personal,
                'education': self.clean_education_list(education),
                'work_experience': self.clean_work_experience_list(work_exp),
                'total_experience': total_exp,
                'skills': self.clean_skills_dict(skills),
                'responsibilities': [self.normalize_thai_text(resp) for resp in responsibilities],
                'salary_expectation': salary_expectation,
                'certifications': self.clean_certifications_list(certifications),
                'language_skills': self.clean_language_skills_list(language_skills),
                'driving_skills': driving_skills,
                'special_abilities': [self.normalize_thai_text(ability) for ability in special_abilities],
                'links': basic_links,
                'links_detailed': links_info,
                'desired_position': desired_position,
                'expected_salary_details': expected_salary,
                'preferred_location': preferred_location,
                'preferred_job_type': preferred_job_type,
                'available_start_date': available_start_date
            }
            
            # สรุปสำหรับ HR
            analysis['hr_summary'] = self.generate_hr_summary(analysis)
            
            return analysis
            
        except Exception as e:
            print(f"Error analyzing resume: {e}")
            return {"error": f"เกิดข้อผิดพลาดในการวิเคราะห์: {str(e)}"}

    def calculate_job_match_score(self, resume_analysis: Dict, job_description: str) -> Dict:
        """คำนวณคะแนนความเหมาะสมกับงานแบบ Vector-based + ภาษา"""
        # ดึงทักษะจาก Resume และ Job Description
        resume_skills = self.extract_skills_detailed_from_analysis(resume_analysis)
        job_skills = self.extract_skills_detailed(job_description)
        
        # คำนวณคะแนนภาษา
        language_score = self._calculate_language_score(resume_analysis)
        
        # แปลงทักษะเป็นข้อความสำหรับ Vectorization
        resume_skills_text = self._skills_to_text(resume_skills)
        job_skills_text = self._skills_to_text(job_skills)
        
        # คำนวณความคล้ายคลึงด้วย TF-IDF + Cosine Similarity
        vector_similarity = self._calculate_skills_similarity(resume_skills_text, job_skills_text)
        
        # คำนวณคะแนนแบบดั้งเดิม
        basic_match_result = self._calculate_basic_match_score(resume_skills, job_skills, resume_analysis)
        
        # รวมคะแนนจากทั้งสองวิธี + ภาษา
        final_score = self._combine_scores(vector_similarity, basic_match_result, resume_analysis, job_description)
        
        return {
            'total_score': round(final_score, 2),
            'vector_similarity': round(vector_similarity * 100, 2),
            'basic_match_score': basic_match_result['total_score'],
            'skill_match_rate': basic_match_result['skill_match_rate'],
            'experience_score': basic_match_result['experience_score'],
            'education_score': basic_match_result['education_score'],
            'language_score': round(language_score, 2),
            'matching_skills': basic_match_result['matching_skills'],
            'missing_skills': basic_match_result['missing_skills'],
            'skill_categories_match': self._analyze_skill_categories(resume_skills, job_skills),
            'recommendation': self._get_recommendation(final_score, basic_match_result, vector_similarity)
        }
    
    def extract_skills_detailed_from_analysis(self, analysis: Dict) -> Dict[str, List[str]]:
        """ดึงทักษะจากผลการวิเคราะห์ Resume"""
        return analysis.get('skills', {})
    
    def _skills_to_text(self, skills_dict: Dict[str, List[str]]) -> str:
        """แปลง dictionary ของทักษะเป็นข้อความสำหรับ Vectorization"""
        all_skills = []
        for category, skills in skills_dict.items():
            all_skills.extend(skills)
        
        # รวมทักษะทั้งหมดเป็นข้อความเดียว
        skills_text = " ".join(all_skills)
        
        # เพิ่ม weight ให้กับ technical skills
        technical_categories = ['programming', 'web', 'database', 'cloud_devops', 'data_science']
        for category in technical_categories:
            if category in skills_dict:
                # เพิ่มซ้ำเพื่อให้มีน้ำหนักมากขึ้นใน TF-IDF
                skills_text += " " + " ".join(skills_dict[category])
        
        return skills_text
    
    def _calculate_skills_similarity(self, resume_skills_text: str, job_skills_text: str) -> float:
        """คำนวณความคล้ายคลึงของทักษะด้วย TF-IDF + Cosine Similarity"""
        if not resume_skills_text.strip() or not job_skills_text.strip():
            return 0.0
        
        try:
            # สร้าง TF-IDF Vectorizer
            vectorizer = TfidfVectorizer(
                lowercase=True,
                stop_words=list(self.english_stopwords),
                ngram_range=(1, 2),  # รับทั้งคำเดียวและคู่คำ
                min_df=1,
                max_features=1000
            )
            
            # รวมข้อความทั้งหมด
            all_texts = [resume_skills_text, job_skills_text]
            
            # สร้าง TF-IDF matrix
            tfidf_matrix = vectorizer.fit_transform(all_texts)
            
            # คำนวณ Cosine Similarity
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            
            similarity_score = cosine_sim[0][0]
            
            print(f"DEBUG: Vector similarity score: {similarity_score}")
            
            return max(0.0, min(1.0, similarity_score))
            
        except Exception as e:
            print(f"Error calculating vector similarity: {e}")
            return 0.0
        
    def _calculate_basic_match_score(self, resume_skills: Dict, job_skills: Dict, resume_analysis: Dict) -> Dict:
        """คำนวณคะแนนแบบดั้งเดิม (Set-based)"""
        # รวมทักษะทั้งหมด
        job_skill_set = set()
        for skills in job_skills.values():
            job_skill_set.update(skills)
        
        resume_skill_set = set()
        for skills in resume_skills.values():
            resume_skill_set.update(skills)
        
        # หาทักษะที่ตรงกัน
        matching_skills = list(job_skill_set & resume_skill_set)
        missing_skills = list(job_skill_set - resume_skill_set)
        
        # คำนวณคะแนนทักษะ
        if len(job_skill_set) > 0:
            skill_match_rate = (len(matching_skills) / len(job_skill_set)) * 100
        else:
            skill_match_rate = 0
        
        # ให้น้ำหนักตามประสบการณ์
        total_exp = resume_analysis.get('total_experience', '')
        exp_score = 0
        if 'ปี' in total_exp:
            years_match = re.search(r'(\d+)\s*ปี', total_exp)
            if years_match:
                years = int(years_match.group(1))
                exp_score = min(years * 10, 30)
        
        # ให้น้ำหนักตามการศึกษา
        edu_score = 0
        education = resume_analysis.get('education', [])
        if education:
            highest = education[0]
            if 'ปริญญาตรี' in highest['degree']:
                edu_score = 15
            elif 'ปริญญาโท' in highest['degree']:
                edu_score = 20
            elif 'ปริญญาเอก' in highest['degree']:
                edu_score = 25
            elif 'ปวส' in highest['degree']:
                edu_score = 15
            elif 'ปวช' in highest['degree']:
                edu_score = 20
            elif 'มัธยมศึกษา' in highest['degree']:
                edu_score = 15
            
            if 'gpa' in highest and highest['gpa'] >= 3.5:
                edu_score += 5
            if 'honor' in highest:
                edu_score += 10
        
        # คะแนนรวมแบบดั้งเดิม
        total_score = min(skill_match_rate * 0.6 + exp_score + edu_score, 100)
        
        return {
            'total_score': round(total_score, 2),
            'skill_match_rate': round(skill_match_rate, 2),
            'experience_score': exp_score,
            'education_score': edu_score,
            'matching_skills': matching_skills,
            'missing_skills': missing_skills
        }
        
    def _calculate_language_score(self, resume_analysis: Dict) -> float:
        """คำนวณคะแนนทักษะทางภาษา"""
        language_skills = resume_analysis.get('language_skills', [])
        if not language_skills:
            return 0.0
        
        total_score = 0.0
        max_possible_score = 0.0
        
        for lang in language_skills:
            language = lang.get('language', '')
            speaking = lang.get('speaking', '')
            reading = lang.get('reading', '')
            writing = lang.get('writing', '')
            test_score = lang.get('test_score', {})
            
            # คะแนนพื้นฐานสำหรับแต่ละภาษา
            lang_base_score = 0.0
            
            # ภาษาไทย (ให้คะแนนพื้นฐาน)
            if language == 'ไทย':
                if any(level in speaking for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 10
                elif any(level in speaking for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 5
                
                if any(level in reading for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 10
                elif any(level in reading for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 5
                
                if any(level in writing for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 10
                elif any(level in writing for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 5
            
            # ภาษาอังกฤษ (ให้น้ำหนักมากกว่า)
            elif language == 'อังกฤษ':
                english_score = 0.0
                
                # คะแนนจากระดับความสามารถ
                if any(level in speaking for level in ['ดีมาก', 'ดีเยี่ยม', 'Native', 'Fluent']):
                    english_score += 15
                elif any(level in speaking for level in ['ดี', 'ปานกลาง', 'Intermediate']):
                    english_score += 10
                elif any(level in speaking for level in ['พอใช้', 'Beginner']):
                    english_score += 5
                
                if any(level in reading for level in ['ดีมาก', 'ดีเยี่ยม', 'Native', 'Fluent']):
                    english_score += 15
                elif any(level in reading for level in ['ดี', 'ปานกลาง', 'Intermediate']):
                    english_score += 10
                elif any(level in reading for level in ['พอใช้', 'Beginner']):
                    english_score += 5
                
                if any(level in writing for level in ['ดีมาก', 'ดีเยี่ยม', 'Native', 'Fluent']):
                    english_score += 15
                elif any(level in writing for level in ['ดี', 'ปานกลาง', 'Intermediate']):
                    english_score += 10
                elif any(level in writing for level in ['พอใช้', 'Beginner']):
                    english_score += 5
                
                # โบนัสจากคะแนนทดสอบมาตรฐาน
                if test_score:
                    test_name = test_score.get('test', '').upper()
                    score_value = self._parse_test_score(test_score.get('score', ''))
                    
                    if test_name == 'TOEIC':
                        if score_value >= 800:
                            english_score += 20
                        elif score_value >= 600:
                            english_score += 15
                        elif score_value >= 450:
                            english_score += 10
                    elif test_name == 'IELTS':
                        if score_value >= 7.0:
                            english_score += 25
                        elif score_value >= 6.0:
                            english_score += 15
                        elif score_value >= 5.0:
                            english_score += 10
                    elif test_name == 'TOEFL':
                        if score_value >= 100:
                            english_score += 25
                        elif score_value >= 80:
                            english_score += 15
                        elif score_value >= 60:
                            english_score += 10
                    elif test_name == 'CU-TEP':
                        if score_value >= 100:
                            english_score += 20
                        elif score_value >= 80:
                            english_score += 15
                        elif score_value >= 60:
                            english_score += 10
                
                lang_base_score = min(english_score, 50)  # จำกัดสูงสุด 50 คะแนนสำหรับภาษาอังกฤษ
            
            # ภาษาอื่นๆ
            else:
                if any(level in speaking for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 8
                elif any(level in speaking for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 4
                
                if any(level in reading for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 8
                elif any(level in reading for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 4
                
                if any(level in writing for level in ['ดีมาก', 'ดีเยี่ยม', 'Native']):
                    lang_base_score += 8
                elif any(level in writing for level in ['ดี', 'ปานกลาง']):
                    lang_base_score += 4
            
            total_score += lang_base_score
            max_possible_score += 50  # สูงสุด 50 คะแนนต่อภาษา
        
        # คำนวณคะแนนรวม (สูงสุด 30 คะแนนสำหรับทักษะภาษา)
        if max_possible_score > 0:
            normalized_score = (total_score / max_possible_score) * 30
            return min(normalized_score, 30)  # จำกัดสูงสุด 30 คะแนน
        else:
            return 0.0

    def _parse_test_score(self, score_str: str) -> float:
        """แปลงคะแนนทดสอบเป็นตัวเลข"""
        try:
            # ลบช่องว่างและอักขระพิเศษ
            clean_score = re.sub(r'[^\d.]', '', str(score_str))
            if clean_score:
                return float(clean_score)
            return 0.0
        except:
            return 0.0

    def _analyze_language_requirements(self, job_description: str) -> Dict[str, Any]:
        """วิเคราะห์ความต้องการทักษะทางภาษาจาก Job Description"""
        job_lower = job_description.lower()
        requirements = {
            'english_required': False,
            'english_level': 'basic',
            'other_languages': [],
            'priority_score': 0
        }
        
        # ตรวจสอบความต้องการภาษาอังกฤษ
        english_keywords = {
            'high': ['fluent english', 'native english', 'excellent english', 'proficient english', 'english mandatory'],
            'medium': ['good english', 'english communication', 'english skill', 'english required'],
            'basic': ['basic english', 'english preferred', 'english is a plus']
        }
        
        for level, keywords in english_keywords.items():
            for keyword in keywords:
                if keyword in job_lower:
                    requirements['english_required'] = True
                    requirements['english_level'] = level
                    if level == 'high':
                        requirements['priority_score'] += 3
                    elif level == 'medium':
                        requirements['priority_score'] += 2
                    else:
                        requirements['priority_score'] += 1
                    break
        
        # ตรวจสอบภาษาอื่นๆ
        other_languages = ['chinese', 'japanese', 'korean', 'french', 'german', 'spanish']
        for lang in other_languages:
            if lang in job_lower:
                requirements['other_languages'].append(lang)
                requirements['priority_score'] += 1
        
        return requirements

    def _calculate_language_match_bonus(self, resume_analysis: Dict, job_requirements: Dict) -> float:
        """คำนวณโบนัสความตรงกันของทักษะภาษา"""
        if not job_requirements['english_required']:
            return 0.0
        
        language_skills = resume_analysis.get('language_skills', [])
        english_skills = None
        
        # หาทักษะภาษาอังกฤษจาก resume
        for lang in language_skills:
            if lang.get('language') == 'อังกฤษ':
                english_skills = lang
                break
        
        if not english_skills:
            return 0.0
        
        # ตรวจสอบความตรงกันตามระดับที่ต้องการ
        job_level = job_requirements['english_level']
        speaking = english_skills.get('speaking', '').lower()
        reading = english_skills.get('reading', '').lower()
        writing = english_skills.get('writing', '').lower()
        test_score = english_skills.get('test_score', {})
        
        match_score = 0.0
        
        # กำหนดเกณฑ์การ match ตามระดับ
        if job_level == 'high':
            # ต้องการระดับสูง
            high_level_keywords = ['ดีมาก', 'ดีเยี่ยม', 'native', 'fluent']
            if any(keyword in speaking for keyword in high_level_keywords):
                match_score += 2.0
            if any(keyword in reading for keyword in high_level_keywords):
                match_score += 2.0
            if any(keyword in writing for keyword in high_level_keywords):
                match_score += 2.0
            
            # โบนัสคะแนนทดสอบสูง
            if test_score:
                test_name = test_score.get('test', '').upper()
                score_value = self._parse_test_score(test_score.get('score', ''))
                
                if test_name == 'TOEIC' and score_value >= 800:
                    match_score += 3.0
                elif test_name == 'IELTS' and score_value >= 7.0:
                    match_score += 3.0
                elif test_name == 'TOEFL' and score_value >= 100:
                    match_score += 3.0
        
        elif job_level == 'medium':
            # ต้องการระดับปานกลาง
            medium_level_keywords = ['ดี', 'ปานกลาง', 'intermediate']
            if any(keyword in speaking for keyword in medium_level_keywords):
                match_score += 1.5
            if any(keyword in reading for keyword in medium_level_keywords):
                match_score += 1.5
            if any(keyword in writing for keyword in medium_level_keywords):
                match_score += 1.5
            
            # โบนัสคะแนนทดสอบปานกลาง
            if test_score:
                test_name = test_score.get('test', '').upper()
                score_value = self._parse_test_score(test_score.get('score', ''))
                
                if test_name == 'TOEIC' and score_value >= 600:
                    match_score += 2.0
                elif test_name == 'IELTS' and score_value >= 6.0:
                    match_score += 2.0
                elif test_name == 'TOEFL' and score_value >= 80:
                    match_score += 2.0
        
        else:  # basic
            # ต้องการระดับพื้นฐาน
            basic_level_keywords = ['พอใช้', 'beginner']
            if any(keyword in speaking for keyword in basic_level_keywords):
                match_score += 1.0
            if any(keyword in reading for keyword in basic_level_keywords):
                match_score += 1.0
            if any(keyword in writing for keyword in basic_level_keywords):
                match_score += 1.0
            
            # โบนัสคะแนนทดสอบพื้นฐาน
            if test_score:
                test_name = test_score.get('test', '').upper()
                score_value = self._parse_test_score(test_score.get('score', ''))
                
                if test_name == 'TOEIC' and score_value >= 450:
                    match_score += 1.0
                elif test_name == 'IELTS' and score_value >= 5.0:
                    match_score += 1.0
                elif test_name == 'TOEFL' and score_value >= 60:
                    match_score += 1.0
        
        return min(match_score, 10.0)  # จำกัดโบนัสสูงสุด 10 คะแนน

    def _combine_scores(self, vector_similarity: float, basic_match: Dict, resume_analysis: Dict, job_description: str) -> float:
        """รวมคะแนนจากทั้งสองวิธี + คะแนนภาษา"""
        vector_weight = 0.5  # ปรับน้ำหนักใหม่
        basic_weight = 0.3
        language_weight = 0.2
        
        # คำนวณคะแนนภาษา
        language_score = self._calculate_language_score(resume_analysis)
        
        # วิเคราะห์ความต้องการภาษาจาก Job Description
        job_language_requirements = self._analyze_language_requirements(job_description)
        language_match_bonus = self._calculate_language_match_bonus(resume_analysis, job_language_requirements)
        
        # โบนัสประสบการณ์
        experience_bonus = 0
        total_exp = resume_analysis.get('total_experience', '')
        if 'ปี' in total_exp:
            years_match = re.search(r'(\d+)\s*ปี', total_exp)
            if years_match:
                years = int(years_match.group(1))
                if years >= 5:
                    experience_bonus = 8
                elif years >= 3:
                    experience_bonus = 5
        
        # โบนัสการศึกษา
        education_bonus = 0
        education = resume_analysis.get('education', [])
        if education:
            highest = education[0]
            if 'ปริญญาโท' in highest['degree']:
                education_bonus = 5
            elif 'ปริญญาเอก' in highest['degree']:
                education_bonus = 8
        
        # คำนวณคะแนนรวม
        vector_score = vector_similarity * 100
        basic_score = basic_match['total_score']
        
        # รวมคะแนนด้วยน้ำหนักใหม่
        combined_score = (
            (vector_score * vector_weight) + 
            (basic_score * basic_weight) + 
            (language_score * language_weight)
        )
        
        # เพิ่มโบนัสต่างๆ
        final_score = (
            combined_score + 
            experience_bonus + 
            education_bonus + 
            language_match_bonus
        )
        
        print(f"DEBUG: Language score: {language_score}")
        print(f"DEBUG: Language match bonus: {language_match_bonus}")
        print(f"DEBUG: Experience bonus: {experience_bonus}")
        print(f"DEBUG: Education bonus: {education_bonus}")
        print(f"DEBUG: Final combined score: {final_score}")
        
        return min(final_score, 100)

    def _analyze_skill_categories(self, resume_skills: Dict, job_skills: Dict) -> Dict[str, float]:
        """วิเคราะห์ความตรงกันในแต่ละหมวดหมู่ทักษะ"""
        category_scores = {}
        
        for category in self.tech_skills.keys():
            if category in job_skills and category in resume_skills:
                job_skills_in_category = set(job_skills[category])
                resume_skills_in_category = set(resume_skills[category])
                
                if len(job_skills_in_category) > 0:
                    match_rate = len(job_skills_in_category & resume_skills_in_category) / len(job_skills_in_category)
                    category_scores[category] = round(match_rate * 100, 2)
        
        return category_scores

    def _get_recommendation(self, total_score: float, basic_match: Dict, vector_similarity: float) -> str:
        """สร้างคำแนะนำแบบละเอียด"""
        matching_skills = basic_match['matching_skills']
        missing_skills = basic_match['missing_skills']
        
        if total_score >= 85:
            return "✅ แนะนำเรียกสัมภาษณ์ทันที - ผู้สมัครมีคุณสมบัติตรงตามความต้องการสูงมาก"
        elif total_score >= 70:
            if vector_similarity >= 0.7:
                return "✅ แนะนำเรียกสัมภาษณ์ - ทักษะตรงตามที่ต้องการและมีความคล้ายคลึงสูง"
            else:
                return "⚠️ พิจารณาเรียกสัมภาษณ์ - ผู้สมัครมีคุณสมบัติดี แต่ควรประเมินทักษะเพิ่มเติม"
        elif total_score >= 55:
            if len(missing_skills) <= 3:
                return "🔶 พิจารณาได้ - ขาดทักษะเพียงเล็กน้อย สามารถฝึกอบรมได้"
            else:
                return f"⚠️ พิจารณาอย่างรอบคอบ - ขาดทักษะสำคัญ {len(missing_skills)} รายการ"
        elif vector_similarity >= 0.1:
            if len(matching_skills) >= 2 and len(missing_skills) == 0:
                return "✅ แนะนำเรียกสัมภาษณ์ - ทักษะตรงตามที่ต้องการและมีความคล้ายคลึงสูง"
            elif len(matching_skills) >= 2 and len(missing_skills) <= 2:
               return "⚠️ พิจารณาเรียกสัมภาษณ์ - ผู้สมัครมีคุณสมบัติดี แต่ควรประเมินทักษะเพิ่มเติม"
            elif len(missing_skills) > 5:
               return "❌ ไม่แนะนำ - ทักษะไม่ตรงกับความต้องการของงาน"
            else:
                return "❌ ไม่แนะนำ - ทักษะไม่ตรงกับความต้องการของงาน"
        else:
            if vector_similarity < 0.1:
                return "❌ ไม่แนะนำ - ทักษะไม่ตรงกับความต้องการของงาน"
            else:
                return "❌ ไม่แนะนำ - คุณสมบัติโดยรวมไม่ตรงตามที่ต้องการ"
            
    def explain_match(self, match_result: Dict) -> str:
        """อธิบายเหตุผลแบบละเอียด - เวอร์ชันปรับปรุง"""
        parts = []
        
        parts.append(f"🎯 {match_result.get('recommendation', '')}")
        parts.append(f"📊 คะแนนรวม: {match_result.get('total_score', 0)}%")
        parts.append(f"🔢 ความคล้ายคลึงทักษะ: {match_result.get('vector_similarity', 0)}%")
        
        matching = match_result.get('matching_skills', [])
        if matching:
            parts.append(f"✅ ทักษะที่ตรง: {', '.join(matching[:5])}" + ("..." if len(matching) > 5 else ""))
        
        missing = match_result.get('missing_skills', [])
        if missing:
            parts.append(f"❌ ทักษะที่ขาด: {', '.join(missing[:3])}" + ("..." if len(missing) > 3 else ""))
        
        # แสดงคะแนนในแต่ละหมวดหมู่
        categories = match_result.get('skill_categories_match', {})
        if categories:
            category_texts = []
            for category, score in categories.items():
                if score > 0:
                    category_texts.append(f"{category}: {score}%")
            if category_texts:
                parts.append(f"📈 ความตรงกันตามหมวดหมู่: {', '.join(category_texts)}")
        
        parts.append(f"🎓 คะแนนการศึกษา: {match_result.get('education_score', 0)}")
        parts.append(f"💼 คะแนนประสบการณ์: {match_result.get('experience_score', 0)}")
        
        # เพิ่มข้อมูลคะแนนภาษา
        if match_result.get('language_score'):
            parts.append(f"🌐 คะแนนภาษา: {match_result.get('language_score', 0)}")
        
        return " | ".join(parts)
    
    def print_resume_report(self, analysis: Dict):
        """พิมพ์รายงานวิเคราะห์ Resume"""
        print("\n" + "="*80)
        print("📊 RESUME ANALYSIS REPORT")
        print("="*80)
        
        # สรุปสำหรับ HR
        print("\n" + "🎯 สรุปด่วนสำหรับ HR ".center(80, "="))
        print(analysis['hr_summary'])
        
        # ข้อมูลติดต่อ
        if analysis.get('contact_info'):
            print("\n" + "-"*80)
            print("📞 ข้อมูลติดต่อ")
            print("-"*80)
            for key, value in analysis['contact_info'].items():
                print(f" • {key}: {value}")
        
        # ข้อมูลส่วนตัว
        if analysis.get('personal_info'):
            print("\n" + "-"*80)
            print("👤 ข้อมูลส่วนตัว")
            print("-"*80)
            for key, value in analysis['personal_info'].items():
                print(f" • {key}: {value}")
        
        # การศึกษา
        if analysis.get('education'):
            print("\n" + "-"*80)
            print("🎓 การศึกษา")
            print("-"*80)
            for i, edu in enumerate(analysis['education'], 1):
                print(f"\n {i}. {edu['degree']} - {edu['field']}")
                if 'gpa' in edu:
                    print(f" GPA: {edu['gpa']}")
                if 'honor' in edu:
                    print(f" {edu['honor']}")
        
        # ประสบการณ์การทำงาน
        if analysis.get('work_experience'):
            print("\n" + "-"*80)
            print(f"💼 ประสบการณ์การทำงาน (รวม: {analysis['total_experience']})")
            print("-"*80)
            for i, exp in enumerate(analysis['work_experience'], 1):
                print(f"\n {i}. {exp['position']}")
                print(f" ระยะเวลา: {exp['start_date']} - {exp['end_date']} ({exp['duration']})")
                if exp.get('salary'):
                    print(f" เงินเดือน: {exp['salary']} บาท")
        
        # หน้าที่รับผิดชอบ
        if analysis.get('responsibilities'):
            print("\n" + "-"*80)
            print("📋 หน้าที่รับผิดชอบที่สำคัญ")
            print("-"*80)
            for i, resp in enumerate(analysis['responsibilities'], 1):
                print(f" {i}. {resp}")
        
        # ทักษะ
        if analysis.get('skills'):
            print("\n" + "-"*80)
            print("💡 ทักษะ")
            print("-"*80)
            for category, skills in analysis['skills'].items():
                print(f" • {category}: {', '.join(skills)}")
        
        # เงินเดือนที่ต้องการ
        if analysis.get('salary_expectation'):
            print("\n" + "-"*80)
            print(f"💰 เงินเดือนที่ต้องการ: {analysis['salary_expectation']} บาท")
        
        # ประวัติการฝึกอบรม/ประกาศนียบัตร
        if analysis.get('certifications'):
            print("\n" + "-"*80)
            print("📜 ประวัติการฝึกอบรม/ประกาศนียบัตร")
            print("-"*80)
            for i, cert in enumerate(analysis['certifications'], 1):
                print(f"\n {i}. {cert['name']}")
                if cert.get('year'):
                    print(f" ปีที่ได้รับ: {cert['year']}")
        
        # ความสามารถทางภาษา
        if analysis.get('language_skills'):
            print("\n" + "-"*80)
            print("🌐 ความสามารถทางภาษา")
            print("-"*80)
            for lang in analysis['language_skills']:
                print(f"\n • ภาษา: {lang['language']}")
                print(f"  • การพูด: {lang['speaking']}")
                print(f"  • การอ่าน: {lang['reading']}")
                print(f"  • การเขียน: {lang['writing']}")
                if 'test_score' in lang:
                    print(f"  • {lang['test_score']['test']}: {lang['test_score']['score']}")
        
        # ความสามารถในการขับขี่และรถที่มี
        if analysis.get('driving_skills'):
            print("\n" + "-"*80)
            print("🚗 ความสามารถในการขับขี่และรถที่มี")
            print("-"*80)
            print(f" • สามารถขับขี่ได้: {', '.join(analysis['driving_skills']['can_drive'])}")
            print(f" • มีรถส่วนตัว: {', '.join(analysis['driving_skills']['owns_vehicle'])}")
        
        # ความสามารถพิเศษอื่นๆ
        if analysis.get('special_abilities'):
            print("\n" + "-"*80)
            print("🌟 ความสามารถพิเศษอื่นๆ")
            print("-"*80)
            for i, ability in enumerate(analysis['special_abilities'], 1):
                print(f"\n {i}. {ability}")
        
        # ลิงค์ต่างๆ
        if analysis.get('links'):
            print("\n" + "-"*80)
            print("🔗 ลิงค์ต่างๆ")
            print("-"*80)
            for i, link in enumerate(analysis['links'], 1):
                print(f"\n {i}. {link}")