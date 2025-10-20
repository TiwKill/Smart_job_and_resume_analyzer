import pytesseract
from pdf2image import convert_from_path
import os

# กำหนด path ของ tesseract (เฉพาะ Windows)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def ocr_from_pdf(pdf_path):
    # แปลง PDF เป็นภาพ
    pages = convert_from_path(pdf_path)
    text = ""

    for i, page in enumerate(pages):
        # แปลงแต่ละหน้าเป็นข้อความด้วย OCR
        page_text = pytesseract.image_to_string(page, lang="tha+eng")
        text += f"\n--- หน้า {i+1} ---\n{page_text}"

    return text

pdf_path = "data/01.pdf"
result_text = ocr_from_pdf(pdf_path)
print(result_text)
