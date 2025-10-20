"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Loader2, Trash2, TrendingUp, Check, ChevronDown, MapPin, Mail, Phone, Globe, Award, Languages, Car, Star } from "lucide-react"
import { toast } from "sonner"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useMatchJob } from "@/hooks/use-match-job"

const SKILL_OPTIONS = {
    programming: ["Python", "Java", "JavaScript", "Dart", "C#", "Go", "TypeScript", "Kotlin", "Swift", "Rust", "Ruby"],
    backend: ["Node.js", "Flask", "FastAPI", "Django", "Express", "RESTful API", "Spring Boot", "ASP.NET Core", "Microservices"],
    database: ["MySQL", "PostgreSQL", "SQL Server", "MongoDB", "SQLite", "Redis", "Cassandra", "DynamoDB"],
    design: ["Figma", "Adobe XD", "UI/UX", "Canva", "Photoshop", "Sketch", "Prototyping", "Wireframing"],
    cloud_devops: ["AWS", "Azure", "Google Cloud (GCP)", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    tools: ["Git", "GitHub", "GitLab", "Bitbucket", "JIRA", "Confluence", "Slack", "Trello", "Postman", "Swagger", "VS Code", "IntelliJ", "Eclipse", "Android Studio", "Xcode"],
    thai_skills: ["พัฒนาแอพพลิเคชัน", "ซ่อมบำรุง", "บริการลูกค้า", "ประสานงาน", "ออกแบบ", "การตลาดดิจิทัล", "การจัดการโครงการ"],
}

export default function MatchPage() {
    const { matchJob, isLoading, data, error } = useMatchJob()

    const [jobDescription, setJobDescription] = useState("")
    const [totalExperience, setTotalExperience] = useState("")
    const [skills, setSkills] = useState<Record<string, string[]>>({
        programming: [],
        backend: [],
        database: [],
        design: [],
        cloud_devops: [],
        tools: [],
        thai_skills: [],
    })
    const [education, setEducation] = useState([{ degree: "", field: "", gpa: "" }])

    const handleSkillToggle = (category: string, value: string) => {
        const current = skills[category] || []
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value]
        setSkills({ ...skills, [category]: updated })
    }

    const addEducation = () => {
        setEducation([...education, { degree: "", field: "", gpa: "" }])
    }

    const removeEducation = (index: number) => {
        const updated = [...education]
        updated.splice(index, 1)
        setEducation(updated)
    }

    const handleMatch = async () => {
        if (!jobDescription.trim()) {
            toast.error("กรุณากรอก Job Description")
            return
        }

        const payload = {
            analysis: {
                skills,
                total_experience: totalExperience,
                education: education.map((e) => ({
                    degree: e.degree,
                    field: e.field,
                    gpa: e.gpa ? parseFloat(e.gpa) : 0,
                })),
            },
            job_description: jobDescription,
        }

        try {
            const response = await matchJob(payload)
            if (response) {
                toast.success("การจับคู่เสร็จสมบูรณ์", {
                    description: `พบผู้สมัครที่ตรง ${response.total_matched} คน`,
                })
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการจับคู่", {
                description: "กรุณาลองใหม่อีกครั้ง",
            })
        }
    }

    // Function to get badge color based on recommendation
    const getRecommendationBadge = (matchScore: any) => {
        const recommendation = matchScore?.recommendation || ""
        if (recommendation.includes("✅")) return "bg-green-100 text-green-800"
        if (recommendation.includes("⚠️")) return "bg-yellow-100 text-yellow-800"
        if (recommendation.includes("❌")) return "bg-red-100 text-red-800"
        return "bg-gray-100 text-gray-800"
    }

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <h1 className="text-4xl font-bold text-foreground">Match Job Position</h1>
                <p className="text-muted-foreground">
                    กรอกข้อมูลของผู้สมัครและรายละเอียดงานเพื่อวิเคราะห์ความเหมาะสม
                </p>

                {/* Skills Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>เลือกทักษะของผู้สมัครในแต่ละหมวด</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        {Object.keys(SKILL_OPTIONS).map((category) => (
                            <div key={category}>
                                <label className="block text-sm font-medium mb-2 capitalize">
                                    {category.replace("_", " ")}
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between">
                                            {(skills[category]?.length ?? 0) > 0
                                                ? `${(skills[category] ?? []).join(", ")}`
                                                : `เลือกทักษะ...`}
                                            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[320px] p-0">
                                        <Command>
                                            <CommandInput placeholder="ค้นหาทักษะ..." />
                                            <CommandList>
                                                <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>
                                                <CommandGroup>
                                                    {SKILL_OPTIONS[category as keyof typeof SKILL_OPTIONS].map(
                                                        (option) => (
                                                            <CommandItem
                                                                key={option}
                                                                onSelect={() => handleSkillToggle(category, option)}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        (skills[category]?.includes(option) ?? false)
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {option}
                                                            </CommandItem>
                                                        )
                                                    )}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Experience Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Total Experience</CardTitle>
                        <CardDescription>ระบุประสบการณ์รวม เช่น 2 ปี 3 เดือน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Input
                            placeholder="เช่น 1 ปี 9 เดือน"
                            value={totalExperience}
                            onChange={(e) => setTotalExperience(e.target.value)}
                        />
                    </CardContent>
                </Card>

                {/* Education Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Education</CardTitle>
                        <CardDescription>เพิ่ม/ลบข้อมูลการศึกษาได้หลายรายการ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {education.map((edu, idx) => (
                            <div key={idx} className="grid md:grid-cols-3 gap-2 items-center">
                                <Input
                                    placeholder="Degree (เช่น ปริญญาตรี)"
                                    value={edu.degree}
                                    onChange={(e) => {
                                        const updated = [...education]
                                        updated[idx].degree = e.target.value
                                        setEducation(updated)
                                    }}
                                />
                                <Input
                                    placeholder="Field (เช่น วิทยาการคอมพิวเตอร์)"
                                    value={edu.field}
                                    onChange={(e) => {
                                        const updated = [...education]
                                        updated[idx].field = e.target.value
                                        setEducation(updated)
                                    }}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="GPA"
                                        value={edu.gpa}
                                        onChange={(e) => {
                                            const updated = [...education]
                                            updated[idx].gpa = e.target.value
                                            setEducation(updated)
                                        }}
                                    />
                                    {education.length > 1 && (
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            onClick={() => removeEducation(idx)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addEducation}>
                            + Add Education
                        </Button>
                    </CardContent>
                </Card>

                {/* Job Description */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Description</CardTitle>
                        <CardDescription>ใส่รายละเอียดของตำแหน่งงานที่ต้องการ</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="เช่น ต้องการนักพัฒนา Flutter ที่มีประสบการณ์ออกแบบ UI/UX..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            rows={6}
                        />
                        <Button
                            onClick={handleMatch}
                            disabled={isLoading}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Matching...
                                </>
                            ) : (
                                <>
                                    <Briefcase className="mr-2 h-5 w-5" />
                                    Match Candidates
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {data && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Matching Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Resumes Scanned</p>
                                    <p className="text-2xl font-bold">{data.total_scanned}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Candidates Found</p>
                                    <p className="text-2xl font-bold text-primary">{data.total_matched}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Scanned Files</p>
                                    <p className="text-2xl font-bold">{data.scanned_files.length}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Success Rate</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {data.total_scanned > 0 ? ((data.total_matched / data.total_scanned) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Input Resume Match */}
                        {data.input_resume_match && (
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="text-blue-500 h-5 w-5" />
                                        ผลการจับคู่ Resume ที่ส่งเข้า
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-blue-600">
                                                {data.input_resume_match.total_score}%
                                            </span>
                                            <Badge className={getRecommendationBadge(data.input_resume_match)}>
                                                {data.input_resume_match.recommendation?.split(' - ')[0] || "ไม่ระบุ"}
                                            </Badge>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            ทักษะ: {data.input_resume_match.skill_match_rate}% | 
                                            ประสบการณ์: {data.input_resume_match.experience_score} | 
                                            การศึกษา: {data.input_resume_match.education_score}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                <Star className="h-4 w-4 text-green-600" />
                                                ทักษะที่ตรง:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {data.input_resume_match.matching_skills.map((skill, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {data.input_resume_match.missing_skills.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-orange-600" />
                                                    ทักษะที่ขาด:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {data.input_resume_match.missing_skills.map((skill, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs bg-orange-50">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Matched Resumes */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Matched Candidates ({data.total_matched})</h2>
                            {data.matched_resumes.map((resume, index) => (
                                <Card key={index} className="border-l-4 border-l-primary">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <CardTitle className="flex items-center gap-2">
                                                    {resume.filename}
                                                    {resume.analysis?.hr_summary && (
                                                        <Badge variant="outline" className="ml-2">
                                                            {resume.analysis.hr_summary.split('\n')[0]}
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="flex flex-wrap gap-4">
                                                    {resume.analysis?.contact_info?.province && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {resume.analysis.contact_info.province}
                                                        </span>
                                                    )}
                                                    {resume.analysis?.total_experience && (
                                                        <span>ประสบการณ์: {resume.analysis.total_experience}</span>
                                                    )}
                                                    {resume.analysis?.salary_expectation && (
                                                        <span>เงินเดือนที่ต้องการ: {resume.analysis.salary_expectation}</span>
                                                    )}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="text-primary h-5 w-5" />
                                                <span className="text-2xl font-bold text-primary">
                                                    {resume.match_score?.total_score || 0}%
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Recommendation */}
                                        <div className="flex items-center justify-between">
                                            <Badge className={getRecommendationBadge(resume.match_score)}>
                                                {resume.match_score?.recommendation?.split(' - ')[0] || "ไม่ระบุ"}
                                            </Badge>
                                            <div className="text-sm text-muted-foreground">
                                                ทักษะ: {resume.match_score?.skill_match_rate || 0}% | 
                                                ประสบการณ์: {resume.match_score?.experience_score || 0} | 
                                                การศึกษา: {resume.match_score?.education_score || 0}
                                            </div>
                                        </div>

                                        {/* Skills */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-green-600" />
                                                    ทักษะที่ตรง:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {resume.match_score?.matching_skills?.map((skill, idx) => (
                                                        <Badge key={idx} variant="secondary" className="text-xs">
                                                            {skill}
                                                        </Badge>
                                                    )) || []}
                                                </div>
                                            </div>
                                            {(resume.match_score?.missing_skills?.length || 0) > 0 && (
                                                <div>
                                                    <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-orange-600" />
                                                        ทักษะที่ขาด:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {resume.match_score?.missing_skills?.map((skill, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs bg-orange-50">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Candidate Summary */}
                                        {resume.analysis?.hr_summary && (
                                            <div>
                                                <p className="text-sm font-semibold mb-2">ข้อมูลผู้สมัคร:</p>
                                                <div className="text-sm text-muted-foreground whitespace-pre-line">
                                                    {resume.analysis.hr_summary}
                                                </div>
                                            </div>
                                        )}

                                        {/* Additional Information */}
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            {/* Certifications */}
                                            {resume.analysis?.certifications && resume.analysis.certifications.length > 0 && (
                                                <div>
                                                    <p className="font-semibold mb-1 flex items-center gap-1">
                                                        <Award className="h-4 w-4" />
                                                        ใบรับรอง:
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {resume.analysis.certifications.map((cert, idx) => (
                                                            <li key={idx} className="flex justify-between">
                                                                <span>{cert.name}</span>
                                                                {cert.year && <span className="text-muted-foreground">{cert.year}</span>}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Language Skills */}
                                            {resume.analysis?.language_skills && resume.analysis.language_skills.length > 0 && (
                                                <div>
                                                    <p className="font-semibold mb-1 flex items-center gap-1">
                                                        <Languages className="h-4 w-4" />
                                                        ทักษะภาษา:
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {resume.analysis.language_skills.map((lang, idx) => (
                                                            <li key={idx} className="flex justify-between">
                                                                <span>{lang.language}</span>
                                                                <span className="text-muted-foreground">
                                                                    พูด:{lang.speaking} อ่าน:{lang.reading} เขียน:{lang.writing}
                                                                    {lang.test_score && ` (${lang.test_score.test}: ${lang.test_score.score})`}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Links */}
                                        {resume.analysis?.links && resume.analysis.links.length > 0 && (
                                            <div>
                                                <p className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                    <Globe className="h-4 w-4" />
                                                    ลิงก์ที่เกี่ยวข้อง:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {resume.analysis.links.map((link, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:underline"
                                                        >
                                                            {link}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}