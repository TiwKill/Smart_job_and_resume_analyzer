# Smart Job & Resume Analyzer

ระบบวิเคราะห์ Resume และจับคู่งานอัจฉริยะด้วย NLP รองรับภาษาไทยและอังกฤษ พร้อม OCR สำหรับการอ่าน PDF ที่เป็นรูปภาพ

## ✨ คุณสมบัติหลัก

### 📄 Resume Analysis
- **รองรับหลายรูปแบบไฟล์**: PDF, DOCX, DOC, TXT
- **OCR สำหรับ PDF**: อ่านได้ทั้ง PDF ที่เป็นข้อความและรูปภาพ (รองรับภาษาไทย+อังกฤษ)
- **การวิเคราะห์ครบวงจร**:
  - ข้อมูลติดต่อ (อีเมล, เบอร์โทร, ที่อยู่)
  - ข้อมูลส่วนตัว (อายุ, เพศ, สถานภาพ)
  - การศึกษา (ระดับ, สาขา, GPA, เกียรตินิยม)
  - ประสบการณ์ทำงาน (ตำแหน่ง, ระยะเวลา, เงินเดือน)
  - ทักษะ (Programming, Web, Design, Database, Cloud/DevOps, Data Science, Business, Management)
  - เงินเดือนที่ต้องการ
  - ประกาศนียบัตร/การฝึกอบรม
  - ความสามารถทางภาษา (พูด, อ่าน, เขียน + คะแนนสอบ TOEIC, IELTS, TOEFL, CU-TEP)
  - ความสามารถในการขับขี่และรถที่มี
  - ตำแหน่งที่ต้องการสมัคร
  - สถานที่ทำงานที่ต้องการ
  - ประเภทงานที่ต้องการ
  - วันที่สามารถเริ่มงานได้
  - ลิงก์ต่างๆ (GitHub, LinkedIn, Portfolio, ฯลฯ)

### 🎯 Job Matching (Enhanced NLP-based)
- **Scraping จาก JobThai**: ดึงข้อมูล Resume จาก JobThai.com อัตโนมัติ
- **การจับคู่แบบ Multi-factor Analysis**:
  - **Skills Matching (40%)**: ใช้ TF-IDF + Cosine Similarity วิเคราะห์ความคล้ายคลึงของทักษะ
  - **Position Similarity (25%)**: วิเคราะห์ความตรงกันของตำแหน่งงาน
  - **Salary Matching (20%)**: เปรียบเทียบเงินเดือนที่ต้องการกับที่เสนอ
  - **Education Relevance (15%)**: ประเมินความเหมาะสมของการศึกษา
  - **Location Matching (10%)**: ตรวจสอบสถานที่ทำงาน
  - **Experience Matching (10%)**: วิเคราะห์ประสบการณ์
- **Recommendation System**: แนะนำการตัดสินใจรับสมัครแบบอัตโนมัติ
- **Top 20 Matches**: แสดงผู้สมัครที่เหมาะสมที่สุด 20 อันดับแรก

### 📊 HR Summary
- สรุปข้อมูลสำคัญในรูปแบบที่อ่านง่าย
- แสดงข้อมูลที่ HR ต้องการเห็นทันที
- รองรับการตัดสินใจอย่างรวดเร็ว

## 🛠️ เทคโนโลยีที่ใช้

### Backend Framework
- **FastAPI**: Web framework ที่รวดเร็วและทันสมัย
- **Python 3.8+**: ภาษาหลัก

### NLP & Text Processing
- **pythainlp**: ประมวลผลภาษาไทย (word tokenization, normalization)
- **scikit-learn**: TF-IDF Vectorization, Cosine Similarity
- **numpy**: การคำนวณเมทริกซ์

### Document Processing
- **PyPDF2**: อ่านไฟล์ PDF ที่เป็นข้อความ
- **python-docx**: อ่านไฟล์ Word (DOCX)
- **pytesseract**: OCR สำหรับ PDF ที่เป็นรูปภาพ
- **pdf2image**: แปลง PDF เป็นรูปภาพ
- **opencv-python**: ประมวลผลภาพเพื่อเพิ่มความแม่นยำ OCR
- **Pillow**: จัดการรูปภาพ

### Web Scraping
- **requests**: HTTP client
- **beautifulsoup4**: HTML parsing
- **csv**: อ่าน/เขียนไฟล์ CSV

## 📦 การติดตั้ง

### 1. Clone Repository
```bash
git clone <repository-url>
cd smart-job-analyzer
```

### 2. สร้าง Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. ติดตั้ง Dependencies
```bash
pip install -r requirements.txt
```

### 4. ติดตั้ง Tesseract OCR

#### Windows
1. ดาวน์โหลด [Tesseract Installer](https://github.com/UB-Mannheim/tesseract/wiki)
2. ติดตั้งและเพิ่ม path ไปยัง `C:\Program Files\Tesseract-OCR`
3. ดาวน์โหลด [Thai Language Data](https://github.com/tesseract-ocr/tessdata/raw/main/tha.traineddata)
4. วางไฟล์ `tha.traineddata` ใน `C:\Program Files\Tesseract-OCR\tessdata`

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr tesseract-ocr-tha
sudo apt-get install poppler-utils  # สำหรับ pdf2image
```

#### macOS
```bash
brew install tesseract tesseract-lang
brew install poppler  # สำหรับ pdf2image
```

### 5. ติดตั้ง Poppler (สำหรับ pdf2image)

#### Windows
1. ดาวน์โหลด [Poppler for Windows](http://blog.alivate.com.au/poppler-windows/)
2. แตกไฟล์และเพิ่ม `bin/` folder ไปยัง PATH

## 🚀 การใช้งาน

### เริ่มต้น Server
```bash
python main.py
```

Server จะทำงานที่: `http://localhost:8002`

### API Documentation
- **Swagger UI**: http://localhost:8002/docs
- **ReDoc**: http://localhost:8002/redoc

## 📡 API Endpoints

### 1. Analyze Resume
**Endpoint**: `POST /api/analyze-resume`

**Description**: อัปโหลดและวิเคราะห์ไฟล์ Resume

**Request**:
```bash
curl -X POST "http://localhost:8002/api/analyze-resume" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@resume.pdf"
```

**Response Example**:
```json
{
  "hr_summary": "👤 ชาย, อายุ 28 ปี\n🎯 ตำแหน่งที่ต้องการ: Software Engineer\n🎓 ปริญญาตรี วิทยาการคอมพิวเตอร์ (GPA 3.45)\n💼 ประสบการณ์: 3 ปี 6 เดือน\n💡 ทักษะ: python, javascript, react, sql\n💰 เงินเดือน: 35,000-45,000 บาท\n📍 สถานที่: กรุงเทพ",
  "contact_info": {
    "email": "example@email.com",
    "phone": "0812345678",
    "name": "สมชาย ใจดี"
  },
  "personal_info": {
    "age": 28,
    "gender": "ชาย"
  },
  "education": [
    {
      "degree": "ปริญญาตรี",
      "field": "วิทยาการคอมพิวเตอร์",
      "gpa": 3.45
    }
  ],
  "skills": {
    "programming": ["python", "java", "javascript"],
    "web": ["react", "node.js", "html", "css"],
    "database": ["mysql", "postgresql"]
  },
  "work_experience": [...],
  "language_skills": [...],
  "certifications": [...]
}
```

### 2. Match Job with JobThai Scraping
**Endpoint**: `POST /api/match-job`

**Description**: ค้นหาและจับคู่ Resume จาก JobThai กับ Job Description

**Request Body**:
```json
{
  "cookies": {
    "phpsessid": "your_session_id",
    "guest_id": "your_guest_id",
    "fcnec": "your_fcnec"
  },
  "analysis": {
    "skills": {
      "programming": ["python", "java"],
      "web": ["react", "node.js"]
    }
  },
  "job_description": "รับสมัคร Software Engineer มีประสบการณ์ 3-5 ปี ใช้ Python, React, Node.js เงินเดือน 40,000-60,000 บาท ทำงานที่กรุงเทพ"
}
```

**Response Example**:
```json
{
  "status": "success",
  "statistics": {
    "total_resumes_scanned": 500,
    "average_score": 62.5,
    "high_quality_matches": 45,
    "top_matches_count": 20
  },
  "top_matches": [
    {
      "total_score": 87.5,
      "breakdown": {
        "skills": 35.2,
        "position": 22.8,
        "salary": 18.5,
        "education": 13.0,
        "location": 10.0,
        "experience": 8.0
      },
      "details": {
        "skills": {
          "matched_skills": ["python", "javascript", "react", "node.js", "sql"],
          "total_matched": 8
        },
        "matched_positions": ["software engineer", "developer"],
        "salary": {
          "status": "excellent_match",
          "expected": 45000,
          "resume_range": "40000-50000"
        }
      },
      "recommendation": "🌟 แนะนำเรียกสัมภาษณ์ทันที - ผู้สมัครมีคุณสมบัติตรงตามความต้องการสูงมาก",
      "resume_data": {
        "id": "1234567",
        "age": "28",
        "position": "Software Engineer",
        "province": "กรุงเทพมหานคร",
        "salary": "40,000 - 50,000",
        "education": "ปริญญาตรี",
        "field": "วิทยาการคอมพิวเตอร์",
        "profile_url": "https://www3.jobthai.com/resume/..."
      }
    }
  ]
}
```

### 3. Upload Multiple Resumes
**Endpoint**: `POST /api/upload-resumes`

**Description**: อัปโหลดไฟล์ Resume หลายไฟล์พร้อมกัน

### 4. List Uploaded Resumes
**Endpoint**: `GET /api/list-resumes`

**Description**: แสดงรายการไฟล์ Resume ที่อัปโหลดไว้

## 📋 การวิเคราะห์และคะแนน

### Resume Analysis Features
- ✅ **OCR Support**: อ่าน PDF ที่เป็นรูปภาพได้ (รองรับภาษาไทย)
- ✅ **Thai Text Normalization**: ปรับปรุงข้อความภาษาไทยให้เป็นมาตรฐาน
- ✅ **Comprehensive Extraction**: ดึงข้อมูลครบทุกส่วนที่สำคัญ
- ✅ **Smart Detection**: ตรวจจับข้อมูลอัตโนมัติด้วย Pattern Matching + NLP
- ✅ **URL Cleaning**: ทำความสะอาด URL และลบข้อความภาษาไทยที่ติดมา

### Job Matching Algorithm
**คะแนนรวม 100 คะแนน แบ่งเป็น:**

1. **Skills Matching (40 คะแนน)**
   - ใช้ TF-IDF + Cosine Similarity
   - วิเคราะห์ความคล้ายคลึงของทักษะ
   - โบนัสสำหรับทักษะหลากหลายหมวดหมู่

2. **Position Similarity (25 คะแนน)**
   - เปรียบเทียบตำแหน่งที่ต้องการกับประสบการณ์
   - ใช้ Semantic Similarity

3. **Salary Matching (20 คะแนน)**
   - Perfect match: 20 คะแนน
   - Excellent (ต่างไม่เกิน 10%): 18 คะแนน
   - Good (ต่างไม่เกิน 20%): 15 คะแนน
   - Acceptable (ต่างไม่เกิน 30%): 12 คะแนน

4. **Education (15 คะแนน)**
   - ระดับการศึกษา
   - สาขาที่เกี่ยวข้อง

5. **Location (10 คะแนน)**
   - จังหวัดตรงกัน: 10 คะแนน
   - ไม่ระบุในงาน: 5 คะแนน
   - ไม่ตรงกัน: 2 คะแนน

6. **Experience (10 คะแนน)**
   - มีประสบการณ์ตามที่ต้องการ

### คำแนะนำการรับสมัคร
- **85+ คะแนน**: 🌟 แนะนำเรียกสัมภาษณ์ทันที
- **75-84 คะแนน**: ✅ แนะนำเรียกสัมภาษณ์
- **65-74 คะแนน**: ⚠️ พิจารณาเรียกสัมภาษณ์
- **50-64 คะแนน**: 🔶 พิจารณาได้
- **ต่ำกว่า 50**: ❌ ไม่แนะนำ

## 🔧 การตั้งค่า JobThai Scraping

### วิธีการหา Cookies
1. เปิด Browser และเข้า [JobThai.com](https://www.jobthai.com)
2. Login เข้าสู่ระบบ
3. เปิด Developer Tools (F12)
4. ไปที่แท็บ **Application** → **Cookies** → `https://www.jobthai.com`
5. คัดลอกค่า:
   - `PHPSESSID`
   - `guestID`
   - `FCNEC`

### ตัวอย่างการใช้งาน
```python
cookies = {
    "phpsessid": "abc123...",
    "guest_id": "xyz789...",
    "fcnec": "def456..."
}
```

## 📁 โครงสร้างโปรเจค

```
smart-job-analyzer/
├── controllers/
│   ├── resume_analyzer.py      # ระบบวิเคราะห์ Resume (OCR, NLP)
│   └── jobthai_scraper.py      # Scraper สำหรับ JobThai
├── routers/
│   ├── analyze_resume.py       # API endpoint สำหรับวิเคราะห์
│   └── match_job.py            # API endpoint สำหรับจับคู่งาน
├── data/                        # เก็บไฟล์ที่อัปโหลด
├── main.py                      # FastAPI application
├── requirements.txt             # Python dependencies
└── README.md                    # เอกสารนี้
```

## 🐛 การแก้ไขปัญหา

### ปัญหา OCR ไม่สามารถอ่านภาษาไทยได้
```bash
# ตรวจสอบว่าติดตั้ง Thai language data
tesseract --list-langs

# ควรเห็น 'tha' ในรายการ
# ถ้าไม่มี ให้ดาวน์โหลดและวางไว้ใน tessdata folder
```

### ปัญหา pdf2image ไม่ทำงาน
```bash
# Windows: ตรวจสอบว่า Poppler อยู่ใน PATH
where pdftoppm

# Linux/Mac: ติดตั้ง poppler-utils
sudo apt-get install poppler-utils  # Ubuntu/Debian
brew install poppler                 # macOS
```

### ปัญหา Memory เมื่อประมวลผล PDF ขนาดใหญ่
- ลดค่า DPI ใน `pdf2image.convert_from_path()` จาก 300 เป็น 200
- ประมวลผลทีละหน้า

## 🔐 ความปลอดภัย

- ไฟล์ที่อัปโหลดจะถูกเก็บชั่วคราวและลบทิ้งหลังวิเคราะห์เสร็จ
- จำกัดขนาดไฟล์สูงสุด 10MB
- Validate file type ก่อนประมวลผล
- ไม่เก็บข้อมูล Cookies ในระบบ

## 📊 Performance

- รองรับไฟล์ PDF ขนาดใหญ่ (สูงสุด 10MB)
- ประมวลผล Resume 1 ไฟล์ใช้เวลาประมาณ 3-5 วินาที
- OCR ใช้เวลาเพิ่มเติมประมาณ 2-3 วินาทีต่อหน้า
- Scraping JobThai 10 หน้า ใช้เวลาประมาณ 15-20 วินาที
- Matching 500 Resume ใช้เวลาประมาณ 10-15 วินาที

## 🤝 การมีส่วนร่วม

ยินดีรับ Pull Requests! สำหรับการเปลี่ยนแปลงที่สำคัญ กรุณาเปิด Issue ก่อนเพื่อหารือ

## 📝 License

MIT License

## 👥 ผู้พัฒนา

Smart Job & Resume Analyzer Team

## 📞 ติดต่อ

หากมีปัญหาหรือคำถาม กรุณาเปิด Issue ใน GitHub Repository

---

**หมายเหตุ**: ระบบนี้พัฒนาขึ้นเพื่อช่วยเหลือ HR ในการคัดกรองผู้สมัครงาน ไม่ควรใช้เป็นเกณฑ์เดียวในการตัดสินใจ
