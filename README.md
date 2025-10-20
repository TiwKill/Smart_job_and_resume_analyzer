# Smart Job & Resume Analyzer API

โปรแกรมวิเคราะห์ Resume และ Job Description ด้วย NLP รองรับภาษาไทยและอังกฤษ พร้อมสรุปสำหรับ HR เพิ่มการตรวจจับตำแหน่งงาน เงินเดือน สถานที่ ประเภทงาน และวันเริ่มงาน

## ✨ Features

### 🎯 การวิเคราะห์ Resume
- **OCR Support**: อ่านไฟล์ PDF แบบรูปภาพด้วย Tesseract OCR
- **รองรับหลายไฟล์**: PDF, DOCX, TXT
- **ข้อมูลที่ดึงได้**:
  - ข้อมูลส่วนตัว (อายุ, เพศ, สถานภาพ)
  - ข้อมูลติดต่อ (อีเมล, เบอร์โทร, ที่อยู่)
  - การศึกษา (วุฒิการศึกษา, สาขา, GPA, เกียรตินิยม)
  - ประสบการณ์ทำงาน (ตำแหน่ง, ระยะเวลา, เงินเดือน)
  - ทักษะ (Programming, Web, Database, Cloud, Business, UX/UI Design)
  - ภาษา (ไทย, อังกฤษ พร้อมคะแนนสอบ TOEIC, IELTS, TOEFL, CU-TEP)
  - ประกาศนียบัตร
  - ความสามารถพิเศษ
  - ลิงก์ต่างๆ (GitHub, LinkedIn, Portfolio)

### 🎯 ข้อมูลเพิ่มเติมที่ดึงได้
- **ตำแหน่งที่ต้องการ**: ระบุตำแหน่งงานที่ผู้สมัครต้องการ
- **เงินเดือนที่ต้องการ**: ช่วงเงินเดือนที่คาดหวัง
- **สถานที่ทำงาน**: จังหวัดหรือพื้นที่ที่ต้องการทำงาน
- **ประเภทงาน**: งานประจำ, Part-time, Contract, Freelance, Internship, Remote
- **วันที่เริ่มงาน**: วันที่สามารถเริ่มงานได้

### 📊 การจับคู่งาน (Job Matching)
- **Vector Similarity**: ใช้ TF-IDF + Cosine Similarity
- **Skill Matching**: เปรียบเทียบทักษะที่ตรงกัน
- **Language Score**: คะแนนทักษะทางภาษา (30%)
- **Experience Score**: คะแนนประสบการณ์
- **Education Score**: คะแนนการศึกษา
- **แนะนำผู้สมัคร**: โปรแกรมจะสแกนไฟล์ resume ทั้งหมดใน folder `data` และจัดอันดับผู้สมัครที่เหมาะสมที่สุด

### 🤖 สรุปสำหรับ HR
- สรุปข้อมูลผู้สมัครแบบกระชับ เหมาะสำหรับ HR
- แสดงข้อมูลสำคัญ: อายุ, เพศ, การศึกษา, ประสบการณ์, ทักษะหลัก, เงินเดือนที่ต้องการ

## 🚀 Installation

### Requirements
```bash
Python 3.8+
Tesseract OCR
Poppler (สำหรับ pdf2image)
```

### 1. ติดตั้ง Tesseract OCR

**Windows:**
```bash
# ดาวน์โหลดและติดตั้งจาก
https://github.com/UB-Mannheim/tesseract/wiki

# เพิ่ม path ใน environment variables
C:\Program Files\Tesseract-OCR
```

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # สำหรับภาษาไทย
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-tha  # สำหรับภาษาไทย
sudo apt-get install poppler-utils
```

### 2. ติดตั้ง Poppler

**Windows:**
```bash
# ดาวน์โหลดจาก
https://github.com/oschwartz10612/poppler-windows/releases

# แตกไฟล์และเพิ่ม bin folder ใน PATH
C:\path\to\poppler\Library\bin
```

**macOS:**
```bash
brew install poppler
```

**Linux:**
```bash
sudo apt-get install poppler-utils
```

### 3. Clone Repository
```bash
git clone <repository-url>
cd smart-resume-analyzer
```

### 4. สร้าง Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 5. ติดตั้ง Dependencies
```bash
pip install -r requirements.txt
```

### 6. สร้าง Folder สำหรับเก็บ Resume
```bash
mkdir data
```

## 📦 Dependencies

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
PyPDF2==3.0.1
python-docx==1.1.0
pythainlp==4.0.2
scikit-learn==1.3.2
numpy==1.26.2
pydantic==2.5.0
pytesseract==0.3.10
pdf2image==1.16.3
opencv-python==4.8.1.78
Pillow==10.1.0
```

## 🎮 Usage

### เริ่มต้นใช้งาน

```bash
# เริ่ม server
python main.py

# หรือใช้ uvicorn โดยตรง
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

Server จะรันที่: `http://localhost:8002`

### API Endpoints

#### 1. **อัพโหลดและวิเคราะห์ Resume**
```http
POST /api/analyze-resume
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST "http://localhost:8002/api/analyze-resume" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "contact_info": {
    "email": "example@email.com",
    "phone": "0812345678",
    "name": "ชื่อ นามสกุล"
  },
  "personal_info": {
    "age": 25,
    "gender": "ชาย"
  },
  "education": [
    {
      "degree": "ปริญญาตรี",
      "field": "วิทยาการคอมพิวเตอร์",
      "gpa": 3.5
    }
  ],
  "work_experience": [
    {
      "position": "Software Developer",
      "start_date": "มกราคม 2020",
      "end_date": "ปัจจุบัน",
      "duration": "3 ปี 10 เดือน"
    }
  ],
  "skills": {
    "programming": ["python", "javascript"],
    "web": ["react", "node.js"],
    "design": ["figma", "ux/ui design"]
  },
  "salary_expectation": "40000",
  "desired_position": "Full-stack Developer",
  "expected_salary_details": {
    "min_salary": 35000,
    "max_salary": 45000,
    "salary_range": "35,000 - 45,000 บาท",
    "type": "monthly"
  },
  "preferred_location": {
    "provinces": ["กรุงเทพมหานคร"],
    "preferences": ["Remote/Work from home"]
  },
  "preferred_job_type": ["งานประจำ (Full-time)"],
  "available_start_date": {
    "availability": "ทันที",
    "date": "20/10/2025"
  },
  "language_skills": [
    {
      "language": "อังกฤษ",
      "speaking": "ดี",
      "reading": "ดีมาก",
      "writing": "ดี",
      "test_score": {
        "test": "TOEIC",
        "score": "750"
      }
    }
  ],
  "hr_summary": "👤 ชาย, อายุ 25 ปี\n🎯 ตำแหน่งที่ต้องการ: Full-stack Developer\n🎓 ปริญญาตรี วิทยาการคอมพิวเตอร์ (GPA 3.5)\n💼 ประสบการณ์: 3 ปี 10 เดือน\n💡 ทักษะ: python, javascript, react, node.js\n💰 เงินเดือน: 35,000-45,000 บาท\n📍 สถานที่: กรุงเทพมหานคร\n⏰ ประเภท: งานประจำ (Full-time)"
}
```

#### 2. **จับคู่งาน (Job Matching)**
```http
POST /api/match-job
Content-Type: application/json
```

**Request:**
```json
{
  "analysis": {
    // ผลการวิเคราะห์ resume จาก endpoint แรก
  },
  "job_description": "We are looking for a Full-stack Developer with experience in React, Node.js, and Python..."
}
```

**Response:**
```json
{
  "input_resume_match": {
    "total_score": 85.5,
    "vector_similarity": 78.2,
    "basic_match_score": 82.0,
    "skill_match_rate": 75.0,
    "experience_score": 15,
    "education_score": 20,
    "language_score": 25.5,
    "matching_skills": ["python", "javascript", "react", "node.js"],
    "missing_skills": ["docker", "kubernetes"],
    "recommendation": "✅ แนะนำเรียกสัมภาษณ์ทันที - ผู้สมัครมีคุณสมบัติตรงตามความต้องการสูงมาก"
  },
  "matched_resumes": [
    {
      "filename": "candidate1.pdf",
      "match_score": {
        "total_score": 88.0,
        // ... คะแนนรายละเอียด
      },
      "analysis": {
        // ... ข้อมูล resume
      }
    }
  ],
  "total_matched": 5,
  "scanned_files": ["candidate1.pdf", "candidate2.pdf"],
  "total_scanned": 10
}
```

#### 3. **อัพโหลด Resume หลายไฟล์**
```http
POST /api/upload-resumes
Content-Type: multipart/form-data
```

**Request:**
```bash
curl -X POST "http://localhost:8002/api/upload-resumes" \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.docx" \
  -F "files=@resume3.pdf"
```

**Response:**
```json
{
  "uploaded": ["resume1.pdf", "resume2.docx", "resume3.pdf"],
  "errors": [],
  "total_uploaded": 3
}
```

#### 4. **แสดงรายการ Resume ทั้งหมด**
```http
GET /api/list-resumes
```

**Response:**
```json
{
  "resumes": [
    {
      "filename": "resume1.pdf",
      "size": 524288,
      "extension": ".pdf"
    },
    {
      "filename": "resume2.docx",
      "size": 245760,
      "extension": ".docx"
    }
  ],
  "total": 2
}
```

#### 5. **Health Check**
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0"
}
```

## 📊 คะแนนการจับคู่งาน

### การคำนวณคะแนน
1. **Vector Similarity (50%)**: ความคล้ายคลึงของทักษะโดยรวม
2. **Basic Match (30%)**: ทักษะที่ตรงกันโดยตรง
3. **Language Score (20%)**: ทักษะทางภาษา

### โบนัสคะแนน
- **Experience Bonus**: สูงสุด 8 คะแนน (5+ ปี)
- **Education Bonus**: สูงสุด 8 คะแนน (ปริญญาเอก)
- **Language Match Bonus**: สูงสุด 10 คะแนน

### เกณฑ์การแนะนำ
- **85-100**: ✅ แนะนำเรียกสัมภาษณ์ทันที
- **70-84**: ✅ แนะนำเรียกสัมภาษณ์ / ⚠️ พิจารณาเรียกสัมภาษณ์
- **55-69**: 🔶 พิจารณาได้ / ⚠️ พิจารณาอย่างรอบคอบ
- **0-54**: ⚠️ พิจารณาอย่างรอบคอบ / ❌ ไม่แนะนำ

## 🛠️ Configuration

### Tesseract OCR Path (Windows)
ถ้า Tesseract ไม่อยู่ใน PATH ให้เพิ่มใน `resume_analyzer.py`:

```python
import pytesseract

# Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### File Size Limit
แก้ไขใน `analyze_resume.py`:

```python
max_size = 10 * 1024 * 1024  # 10MB (default)
```

### Data Directory
ไฟล์ resume ทั้งหมดจะถูกเก็บใน folder `data/` ที่ root ของโปรเจค

## 🧪 Testing

### ทดสอบด้วย cURL

```bash
# 1. วิเคราะห์ resume
curl -X POST "http://localhost:8002/api/analyze-resume" \
  -F "file=@sample_resume.pdf"

# 2. อัพโหลด resume หลายไฟล์
curl -X POST "http://localhost:8002/api/upload-resumes" \
  -F "files=@resume1.pdf" \
  -F "files=@resume2.pdf"

# 3. ดูรายการ resume
curl "http://localhost:8002/api/list-resumes"

# 4. จับคู่งาน (ต้องมี analysis และ job_description)
curl -X POST "http://localhost:8002/api/match-job" \
  -H "Content-Type: application/json" \
  -d @match_request.json
```

### ทดสอบด้วย Python

```python
import requests

# วิเคราะห์ resume
with open('resume.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8002/api/analyze-resume',
        files={'file': f}
    )
    analysis = response.json()
    print(analysis['hr_summary'])

# จับคู่งาน
job_desc = "Looking for Python developer with React experience..."
match_response = requests.post(
    'http://localhost:8002/api/match-job',
    json={
        'analysis': analysis,
        'job_description': job_desc
    }
)
match_result = match_response.json()
print(f"Score: {match_result['input_resume_match']['total_score']}")
print(f"Top Candidates: {len(match_result['matched_resumes'])}")
```

## 📁 Project Structure

```
smart-resume-analyzer/
│
├── main.py                 # FastAPI app หลัก
├── routers/
│   ├── analyze_resume.py   # Router สำหรับวิเคราะห์ resume
│   └── match_job.py        # Router สำหรับจับคู่งาน
├── controllers/
│   └── resume_analyzer.py  # Core logic สำหรับวิเคราะห์
├── data/                   # Folder เก็บ resume files
├── requirements.txt        # Python dependencies
└── README.md              # เอกสารนี้
```

## 🎯 Supported Skills Categories

### Technical Skills
- **Programming**: Python, Java, JavaScript, C++, C#, PHP, Ruby, Go, SQL, etc.
- **Web**: HTML, CSS, React, Vue, Angular, Node.js, Django, Flask, etc.
- **Design**: UX, UI, Figma, Adobe XD, Sketch, Wireframing, Prototyping, etc.
- **Mobile**: Android, iOS, React Native, Flutter, Xamarin, etc.
- **Database**: SQL, MySQL, PostgreSQL, MongoDB, Oracle, Redis, etc.
- **Cloud/DevOps**: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, etc.
- **Data Science**: Machine Learning, AI, Pandas, NumPy, TensorFlow, PyTorch, etc.

### Business Skills
- **Management**: Project Management, Team Management, Strategic Planning, etc.
- **Leadership**: Leadership, Team Building, Mentoring, Coaching, etc.
- **Finance**: Financial Analysis, Budgeting, Forecasting, ROI Analysis, etc.
- **Marketing/Sales**: Digital Marketing, SEO, SEM, CRM, Sales Strategy, etc.

### Thai Skills
- รองรับคำไทยกว่า 100 คำ เช่น: การจัดการ, การบริหาร, การตลาด, การเงิน, ฯลฯ

## 🐛 Troubleshooting

### Tesseract not found
```bash
# ตรวจสอบว่า Tesseract ติดตั้งแล้ว
tesseract --version

# ถ้าไม่พบ ให้ติดตั้งใหม่และเพิ่ม PATH
```

### PDF OCR ไม่ทำงาน
```bash
# ตรวจสอบว่า Poppler ติดตั้งแล้ว
pdftoppm -h

# ถ้าไม่พบ ให้ติดตั้ง Poppler
```

### Thai text ไม่ถูกต้อง
```bash
# ติดตั้ง Thai language data สำหรับ Tesseract
# Linux
sudo apt-get install tesseract-ocr-tha

# Windows - ดาวน์โหลด tha.traineddata จาก
# https://github.com/tesseract-ocr/tessdata
# และใส่ใน tessdata folder
```

### Import Error
```bash
# ติดตั้ง dependencies ใหม่
pip install -r requirements.txt --upgrade
```

## 🔒 Security Considerations

- **File Validation**: ตรวจสอบนามสกุลไฟล์และขนาดไฟล์
- **Temporary Files**: ลบไฟล์ชั่วคราวหลังการประมวลผล
- **Error Handling**: ไม่แสดงข้อมูล sensitive ใน error messages
- **CORS**: กำหนด allowed origins ตามความเหมาะสม

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

## 🎉 Credits

- **pythainlp**: Thai NLP library
- **Tesseract OCR**: OCR engine
- **FastAPI**: Modern web framework
- **scikit-learn**: Machine learning library

---

**Version**: 2.0.0  
**Last Updated**: October 2025
