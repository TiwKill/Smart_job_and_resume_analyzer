"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Briefcase,
    Loader2,
    Trash2,
    TrendingUp,
    Check,
    ChevronDown,
    MapPin,
    DollarSign,
    GraduationCap,
    BriefcaseIcon,
    ExternalLink,
    Cookie,
    User,
    Star,
    Target,
    BarChart3,
    Filter,
    Search,
} from "lucide-react"
import { toast } from "sonner"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useMatchJob } from "@/hooks/use-match-job"

const SKILL_OPTIONS = {
    programming: ["Python", "Java", "JavaScript", "Dart", "C#", "Go", "TypeScript", "Kotlin", "Swift", "Rust", "Ruby"],
    backend: [
        "Node.js",
        "Flask",
        "FastAPI",
        "Django",
        "Express",
        "RESTful API",
        "Spring Boot",
        "ASP.NET Core",
        "Microservices",
    ],
    database: ["MySQL", "PostgreSQL", "SQL Server", "MongoDB", "SQLite", "Redis", "Cassandra", "DynamoDB"],
    design: ["Figma", "Adobe XD", "UI/UX", "Canva", "Photoshop", "Sketch", "Prototyping", "Wireframing"],
    cloud_devops: ["AWS", "Azure", "Google Cloud (GCP)", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    tools: [
        "Git",
        "GitHub",
        "GitLab",
        "Bitbucket",
        "JIRA",
        "Confluence",
        "Slack",
        "Trello",
        "Postman",
        "Swagger",
        "VS Code",
        "IntelliJ",
        "Eclipse",
        "Android Studio",
        "Xcode",
    ],
    thai_skills: ["พัฒนาแอพพลิเคชัน", "ซ่อมบำรุง", "บริการลูกค้า", "ประสานงาน", "ออกแบบ", "การตลาดดิจิทัล", "การจัดการโครงการ"],
}

export default function MatchPage() {
    const { matchJob, isLoading, data, error } = useMatchJob()

    const [cookies, setCookies] = useState({
        phpsessid: "",
        guest_id: "",
        fcnec: "",
    })

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
    const [activeTab, setActiveTab] = useState("cookies")

    const handleSkillToggle = (category: string, value: string) => {
        const current = skills[category] || []
        const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
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
            cookies: {
                phpsessid: cookies.phpsessid,
                guest_id: cookies.guest_id,
                fcnec: cookies.fcnec,
            },
            analysis: {
                skills,
                total_experience: totalExperience,
                education: education.map((e) => ({
                    degree: e.degree,
                    field: e.field,
                    gpa: e.gpa ? Number.parseFloat(e.gpa) : 0,
                })),
            },
            job_description: jobDescription,
        }

        try {
            const response = await matchJob(payload)
            if (response) {
                toast.success("การจับคู่เสร็จสมบูรณ์", {
                    description: `พบผู้สมัครที่ตรง ${response.statistics?.top_matches_count || 0} คน`,
                })
            }
        } catch (err) {
            toast.error("เกิดข้อผิดพลาดในการจับคู่", {
                description: "กรุณาลองใหม่อีกครั้ง",
            })
        }
    }

    const getRecommendationBadge = (recommendation: string) => {
        if (recommendation.includes("✅") || recommendation.includes("แนะนำสูง"))
            return "bg-green-100 text-green-800"
        if (recommendation.includes("🔶") || recommendation.includes("พิจารณาได้"))
            return "bg-yellow-100 text-yellow-800"
        if (recommendation.includes("⚠️") || recommendation.includes("ควรพิจารณา"))
            return "bg-orange-100 text-orange-800"
        if (recommendation.includes("❌") || recommendation.includes("ไม่แนะนำ"))
            return "bg-red-100 text-red-800"
        return "bg-gray-100 text-gray-800"
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600"
        if (score >= 60) return "text-blue-600"
        if (score >= 40) return "text-yellow-600"
        return "text-red-600"
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Resume & Job Matcher
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        ระบบจับคู่เรซูเม่กับตำแหน่งงานอัจฉริยะด้วยเทคโนโลยี NLP และ Machine Learning
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8 max-w-4xl mx-auto">
                    {[
                        { id: "cookies", label: "การตั้งค่า", icon: Cookie },
                        { id: "skills", label: "ทักษะ", icon: Target },
                        { id: "experience", label: "ประสบการณ์", icon: Briefcase },
                        { id: "education", label: "การศึกษา", icon: GraduationCap },
                        { id: "job", label: "ตำแหน่งงาน", icon: Search },
                    ].map((tab) => {
                        const Icon = tab.icon
                        return (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? "default" : "ghost"}
                                className={`flex-1 justify-center gap-2 py-2 text-sm ${activeTab === tab.id ? "shadow-sm" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </Button>
                        )
                    })}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {/* Left Column - Input Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Cookie Configuration */}
                        {activeTab === "cookies" && (
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <Cookie className="h-5 w-5" />
                                        การตั้งค่า Cookies
                                    </CardTitle>
                                    <CardDescription>
                                        กรอกข้อมูล cookies จาก JobThai เพื่อดึงข้อมูลเรซูเม่
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {[
                                        { key: "phpsessid", label: "PHP Session ID", placeholder: "4aa3e799a5e55bc02555e873ed35a8e2290906c8" },
                                        { key: "guest_id", label: "Guest ID", placeholder: "175983387884184b70ae158f6d94580130228" },
                                        { key: "fcnec", label: "FCNEC", placeholder: "%5B%5B%22AKsRol9P7yXMjgummakDhVPKgZEqtniI..." },
                                    ].map((field) => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">{field.label}</label>
                                            <Input
                                                placeholder={field.placeholder}
                                                value={cookies[field.key as keyof typeof cookies]}
                                                onChange={(e) => setCookies({ ...cookies, [field.key]: e.target.value })}
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Skills Section */}
                        {activeTab === "skills" && (
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <Target className="h-5 w-5" />
                                        ทักษะที่ต้องการ
                                    </CardTitle>
                                    <CardDescription>
                                        เลือกทักษะที่จำเป็นสำหรับตำแหน่งงานนี้ในแต่ละหมวดหมู่
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    {Object.entries(SKILL_OPTIONS).map(([category, options]) => (
                                        <div key={category} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-700 capitalize">
                                                    {category.replace("_", " ")}
                                                </label>
                                                <Badge variant="secondary" className="text-xs">
                                                    {skills[category]?.length || 0} / {options.length}
                                                </Badge>
                                            </div>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-between h-12">
                                                        <span className="truncate">
                                                            {(skills[category]?.length ?? 0) > 0 
                                                                ? `${(skills[category] ?? []).join(", ")}`
                                                                : `เลือกทักษะ${category.replace("_", " ")}...`
                                                            }
                                                        </span>
                                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0" align="start">
                                                    <Command>
                                                        <CommandInput placeholder={`ค้นหาทักษะ${category.replace("_", " ")}...`} />
                                                        <CommandList className="max-h-64">
                                                            <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>
                                                            <CommandGroup>
                                                                {options.map((option) => (
                                                                    <CommandItem 
                                                                        key={option} 
                                                                        onSelect={() => handleSkillToggle(category, option)}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "h-4 w-4",
                                                                                (skills[category]?.includes(option) ?? false) ? "opacity-100" : "opacity-0",
                                                                            )}
                                                                        />
                                                                        {option}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Experience Section */}
                        {activeTab === "experience" && (
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <Briefcase className="h-5 w-5" />
                                        ประสบการณ์การทำงาน
                                    </CardTitle>
                                    <CardDescription>
                                        ระบุประสบการณ์การทำงานที่ต้องการจากผู้สมัคร
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">ประสบการณ์รวม</label>
                                            <Input
                                                placeholder="เช่น 2 ปี 6 เดือน, 1.5 ปี, มากกว่า 3 ปี"
                                                value={totalExperience}
                                                onChange={(e) => setTotalExperience(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <div className="flex gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                <span>น้อยกว่า 1 ปี</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                                                <span>1-3 ปี</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                                                <span>มากกว่า 3 ปี</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Education Section */}
                        {activeTab === "education" && (
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <GraduationCap className="h-5 w-5" />
                                        คุณวุฒิการศึกษา
                                    </CardTitle>
                                    <CardDescription>
                                        ระบุระดับการศึกษาและสาขาที่ต้องการจากผู้สมัคร
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="grid md:grid-cols-3 gap-3 items-end p-4 bg-gray-50 rounded-lg border">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">ระดับการศึกษา</label>
                                                <Input
                                                    placeholder="เช่น ปริญญาตรี, ปริญญาโท"
                                                    value={edu.degree}
                                                    onChange={(e) => {
                                                        const updated = [...education]
                                                        updated[idx].degree = e.target.value
                                                        setEducation(updated)
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">สาขาวิชา</label>
                                                <Input
                                                    placeholder="เช่น วิทยาการคอมพิวเตอร์"
                                                    value={edu.field}
                                                    onChange={(e) => {
                                                        const updated = [...education]
                                                        updated[idx].field = e.target.value
                                                        setEducation(updated)
                                                    }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="space-y-2 flex-1">
                                                    <label className="text-sm font-medium text-gray-700">GPA</label>
                                                    <Input
                                                        placeholder="4.00"
                                                        value={edu.gpa}
                                                        onChange={(e) => {
                                                            const updated = [...education]
                                                            updated[idx].gpa = e.target.value
                                                            setEducation(updated)
                                                        }}
                                                    />
                                                </div>
                                                {education.length > 1 && (
                                                    <Button variant="outline" size="icon" onClick={() => removeEducation(idx)} className="mb-1">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={addEducation} className="w-full">
                                        + เพิ่มคุณวุฒิการศึกษา
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Job Description */}
                        {activeTab === "job" && (
                            <Card className="border border-gray-200">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <Search className="h-5 w-5" />
                                        รายละเอียดตำแหน่งงาน
                                    </CardTitle>
                                    <CardDescription>
                                        อธิบายตำแหน่งงานและคุณสมบัติที่ต้องการอย่างละเอียด
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-3">
                                        <Textarea
                                            placeholder="เช่น ต้องการ Full Stack Developer ที่มีประสบการณ์ทำงานกับ React และ Node.js อย่างน้อย 2 ปี สามารถทำงาน remote ได้ ต้องการเงินเดือนประมาณ 25,000-35,000 บาท..."
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            rows={8}
                                            className="resize-none"
                                        />
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>คำแนะนำ: อธิบายให้ละเอียดเพื่อผลลัพธ์ที่แม่นยำยิ่งขึ้น</span>
                                            <span>{jobDescription.length} ตัวอักษร</span>
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={handleMatch} 
                                        disabled={isLoading} 
                                        className="w-full font-medium disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                กำลังวิเคราะห์และจับคู่...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                เริ่มจับคู่ผู้สมัครอัตโนมัติ
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Results */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card className="border border-gray-200">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <BarChart3 className="h-4 w-4" />
                                        สถิติการจับคู่
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="text-center p-3 bg-gray-50 rounded border">
                                            <div className="text-xl font-bold text-gray-900">{data?.statistics?.total_resumes_scanned || 0}</div>
                                            <div className="text-xs text-gray-600">เรซูเม่ทั้งหมด</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded border">
                                            <div className="text-xl font-bold text-gray-900">{data?.statistics?.top_matches_count || 0}</div>
                                            <div className="text-xs text-gray-600">ตรงตามเงื่อนไข</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded border">
                                            <div className="text-xl font-bold text-gray-900">
                                                {data?.statistics?.average_score?.toFixed(1) || 0}%
                                            </div>
                                            <div className="text-xs text-gray-600">คะแนนเฉลี่ย</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded border">
                                            <div className="text-xl font-bold text-gray-900">{data?.statistics?.high_quality_matches || 0}</div>
                                            <div className="text-xs text-gray-600">คุณภาพสูง</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Results */}
                        {data && data.top_matches && data.top_matches.length > 0 && (
                            <Card className="border border-gray-200">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <TrendingUp className="h-5 w-5 text-gray-600" />
                                        ผู้สมัครที่เหมาะสมที่สุด
                                        <Badge variant="secondary" className="ml-2">
                                            {data.top_matches.length} คน
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                                    {data.top_matches.map((match, index) => (
                                        <div
                                            key={index}
                                            className="p-4 bg-gray-50 rounded-lg border hover:border-gray-300 transition-colors cursor-pointer"
                                            onClick={() => {
                                                if (match.resume_data?.profile_url) {
                                                    window.open(match.resume_data.profile_url, "_blank")
                                                }
                                            }}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium text-gray-900 line-clamp-1">
                                                            {match.resume_data?.position || "ไม่ระบุตำแหน่ง"}
                                                        </span>
                                                        <ExternalLink className="h-3 w-3 text-gray-400" />
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            ID: {match.resume_data?.id}
                                                        </Badge>
                                                        <Badge className={getRecommendationBadge(match.recommendation)}>
                                                            {match.recommendation?.split(" - ")[0] || "ไม่ระบุ"}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xl font-bold ${getScoreColor(match.total_score || 0)}`}>
                                                        {match.total_score?.toFixed(1) || 0}%
                                                    </div>
                                                    <div className="text-xs text-gray-500">คะแนนรวม</div>
                                                </div>
                                            </div>

                                            {/* Basic Info */}
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                                {match.resume_data?.age && (
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        <span>{match.resume_data.age}</span>
                                                    </div>
                                                )}
                                                {match.resume_data?.province && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        <span>{match.resume_data.province}</span>
                                                    </div>
                                                )}
                                                {match.resume_data?.salary && (
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        <span>{match.resume_data.salary}</span>
                                                    </div>
                                                )}
                                                {match.resume_data?.experience && (
                                                    <div className="flex items-center gap-1">
                                                        <BriefcaseIcon className="h-3 w-3" />
                                                        <span>{match.resume_data.experience}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Score Breakdown */}
                                            <div className="grid grid-cols-3 gap-1 mb-3">
                                                {[
                                                    { label: "ทักษะ", value: match.breakdown?.skills },
                                                    { label: "ตำแหน่ง", value: match.breakdown?.position },
                                                    { label: "เงินเดือน", value: match.breakdown?.salary },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="text-center">
                                                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                                                        <div className="text-sm font-semibold text-gray-900">{item.value || 0}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* University */}
                                            {match.resume_data?.university && (
                                                <div className="text-xs text-gray-600 mb-2">
                                                    <GraduationCap className="h-3 w-3 inline mr-1" />
                                                    {match.resume_data.university}
                                                </div>
                                            )}

                                            {/* Recommendation */}
                                            <div className="text-xs text-gray-700 bg-white rounded px-2 py-1 border">
                                                {match.recommendation}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty State */}
                        {!data && (
                            <Card className="border border-gray-200 text-center">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Search className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <h3 className="font-medium text-gray-900 mb-2">เริ่มต้นการจับคู่</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        กรอกข้อมูลตำแหน่งงานและเงื่อนไขที่ต้องการเพื่อค้นหาผู้สมัครที่เหมาะสม
                                    </p>
                                    <Button 
                                        onClick={() => setActiveTab("job")}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Search className="h-4 w-4 mr-2" />
                                        ไปที่หน้าตำแหน่งงาน
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}