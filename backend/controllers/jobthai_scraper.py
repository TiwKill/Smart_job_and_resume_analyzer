import requests
from bs4 import BeautifulSoup
import csv
import time
import os
import re
from typing import List, Dict

def clean_text(text: str) -> str:
    """
    Clean text by removing excessive whitespace and normalizing comma-separated values
    Example: "Item1 , Item2             , Item3" -> "Item1, Item2, Item3"
    """
    if not text or text == "-":
        return text
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Replace multiple spaces with single space
    text = re.sub(r'\s+', ' ', text)
    
    # Normalize comma-separated values: remove space before comma, ensure single space after
    text = re.sub(r'\s*,\s*', ', ', text)
    
    return text

def clean_url(url: str) -> str:
    """
    Clean URL by removing all whitespace characters
    Example: "https://www3.jobthai.com/resume/0, 8946035.html" -> "https://www3.jobthai.com/resume/0,8946035.html"
    """
    if not url or url == "-":
        return url
    
    # Remove all whitespace characters from URL
    url = re.sub(r'\s+', '', url)
    
    return url

def scrape_jobthai_resumes(phpsessid: str, guest_id: str, fcnec: str, max_pages: int = 50) -> str:
    """
    Scrape resume data from JobThai and save to CSV
    Returns the path to the saved CSV file
    """
    cookie_string = f"PHPSESSID={phpsessid}; guestID={guest_id}; FCNEC={fcnec};"
    
    base_url = "https://www3.jobthai.com/findresume/resume_list.php?&search-section=pagination&StepSearch=1&search=Y&jobtype=Computer&level=1&region=&KeyWord=&fieldsearch=All&p={page}&search-section=pagination"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Cookie": cookie_string
    }
    
    all_data: List[Dict[str, str]] = []
    
    print(f"🔍 Starting JobThai scraper for {max_pages} pages...")
    
    for page in range(1, max_pages + 1):
        url = base_url.format(page=page)
        print(f"📄 Scraping page {page}/{max_pages}...")
        
        try:
            res = requests.get(url, headers=headers, timeout=15)
            
            if res.status_code != 200:
                print(f"❌ Failed to fetch page {page} (Status: {res.status_code})")
                break
            
            soup = BeautifulSoup(res.text, "html.parser")
            resumes = soup.select("tr[id^='trBody_']")
            
            if not resumes:
                print(f"⛔ No resumes found on page {page}")
                break
            
            for row in resumes:
                try:
                    row_id = row.get("id", "")
                    resume_id = row_id.split("_")[-1] if "_" in row_id else ""
                    
                    def safe_text(selector):
                        el = row.select_one(selector)
                        return el.get_text(strip=True) if el else "-"
                    
                    score = clean_text(safe_text("span[id*='resumeRankingPercent']"))
                    age = clean_text(safe_text("span[id*='text-age']"))
                    position = clean_text(safe_text("span[id*='positionValue']"))
                    last_update = clean_text(safe_text("span[id*='lastUpdateValue']"))
                    province = clean_text(safe_text("span[id*='addressValue']"))
                    salary = clean_text(safe_text("span[id*='salaryValue']"))
                    degree = clean_text(safe_text("span[id*='grad1LevelValue']"))
                    field = clean_text(safe_text("span[id*='grad1FieldValue']"))
                    university = clean_text(safe_text("span[id*='grad1SchoolValue']"))
                    experience = clean_text(safe_text("span[id*='workExperienceValue']"))
                    order = clean_text(safe_text("span[id*='text-no']").replace(".", ""))
                    
                    profile_link = row.select_one("a[href*='/resume/']")
                    if profile_link and profile_link.get("href"):
                        # Get raw href and clean it
                        raw_url = profile_link["href"].strip()
                        # Clean the URL by removing all whitespace
                        profile_url = clean_url(raw_url)
                        # Ensure it's a complete URL
                        if not profile_url.startswith('http'):
                            profile_url = "https://www3.jobthai.com" + profile_url
                    else:
                        profile_url = "-"
                    
                    if resume_id and resume_id != "6870436":
                        all_data.append({
                            "ลำดับ": order,
                            "เรซูเม่ ID": resume_id,
                            "คะแนน": score,
                            "อายุ": age,
                            "ตำแหน่งที่สมัคร": position,
                            "จังหวัด": province,
                            "เงินเดือน": salary,
                            "ระดับการศึกษา": degree,
                            "สาขา": field,
                            "มหาวิทยาลัย": university,
                            "ตำแหน่งที่เคยทำ": experience,
                            "อัปเดตล่าสุด": last_update,
                            "ลิงก์โปรไฟล์": profile_url,
                        })
                
                except Exception as e:
                    print(f"❌ Error processing row {row_id}: {e}")
                    continue
            
            print(f"✅ Page {page}: {len(resumes)} resumes (Total: {len(all_data)})")
            time.sleep(1.5)
        
        except requests.RequestException as e:
            print(f"❌ Connection error at page {page}: {e}")
            break
    
    # Save to CSV
    if all_data:
        filename = os.path.join(os.getcwd(), "jobthai_resumes.csv")
        with open(filename, "w", newline="", encoding="utf-8-sig") as f:
            writer = csv.DictWriter(f, fieldnames=all_data[0].keys())
            writer.writeheader()
            writer.writerows(all_data)
        print(f"🎉 Saved {len(all_data)} resumes to {filename}")
        return filename
    else:
        raise Exception("No data scraped from JobThai")