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
import { Badge } from "@/components/ui/badge"
import { 
    FileSearch, 
    Upload, 
    Loader2, 
    ExternalLink, 
    User,
    GraduationCap,
    Briefcase,
    Languages,
    Car,
    Link as LinkIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award
} from "lucide-react"
import { toast } from "sonner"
import { useAnalyzeResume } from "@/hooks/use-analyze-resume"

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<any | null>(null)
    const { analyzeResume, isLoading } = useAnalyzeResume()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleAnalyze = async () => {
        if (!file) {
            toast.error("กรุณาเลือกไฟล์ก่อนวิเคราะห์")
            return
        }

        try {
            const data = await analyzeResume(file)
            setResult(data)
            toast.success("วิเคราะห์เรซูเม่สำเร็จ", {
                description: "ระบบได้แยกข้อมูลจากไฟล์แล้ว",
            })
        } catch (err) {
            toast.error("ไม่สามารถวิเคราะห์เรซูเม่ได้", {
                description: "กรุณาลองใหม่อีกครั้ง",
            })
        }
    }

    const getFileIcon = (fileName: string) => {
        if (fileName.toLowerCase().endsWith('.pdf')) return '📄'
        if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) return '📝'
        if (fileName.toLowerCase().endsWith('.txt')) return '📋'
        return '📎'
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        วิเคราะห์เรซูเม่อัตโนมัติ
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        ระบบวิเคราะห์และดึงข้อมูลจากเรซูเม่โดยใช้เทคโนโลยี AI
                    </p>
                </div>

                {/* Upload Section */}
                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-200 pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Upload className="h-5 w-5" />
                            อัปโหลดไฟล์เรซูเม่
                        </CardTitle>
                        <CardDescription>
                            รองรับไฟล์ PDF, DOC, DOCX, หรือ TXT ขนาดไม่เกิน 10MB
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center transition-all duration-200 group-hover:border-gray-400 group-hover:bg-gray-50">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                                    <Upload className="h-6 w-6 text-gray-600" />
                                </div>
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    {file ? (
                                        <span className="flex items-center gap-2">
                                            {getFileIcon(file.name)} {file.name}
                                        </span>
                                    ) : (
                                        "คลิกเพื่อเลือกไฟล์เรซูเม่"
                                    )}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ลากไฟล์มาวางที่นี่หรือคลิกเพื่อเลือกไฟล์
                                </p>
                                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                    <Badge variant="secondary" className="bg-gray-100">PDF</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">DOC</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">DOCX</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">TXT</Badge>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={isLoading || !file}
                            className="w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังวิเคราะห์เรซูเม่...
                                </>
                            ) : (
                                <>
                                    <FileSearch className="mr-2 h-4 w-4" />
                                    เริ่มวิเคราะห์ด้วย AI
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {/* Summary Card */}
                        <div className="grid md:grid-cols-3 gap-4">
                            {/* HR Summary */}
                            {result.hr_summary && (
                                <Card className="md:col-span-3 border border-gray-200">
                                    <CardHeader className="border-b border-gray-200 pb-4">
                                        <CardTitle className="flex items-center gap-2 text-gray-900">
                                            <Award className="h-5 w-5" />
                                            สรุปผลการวิเคราะห์
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="bg-gray-50 rounded-lg p-4 border">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {result.hr_summary}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Stats */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-gray-900">ข้อมูลส่วนตัว</span>
                                        </div>
                                        {result.personal_info && (
                                            <div className="space-y-2 text-sm">
                                                {result.personal_info.age && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">อายุ</span>
                                                        <span className="font-semibold text-gray-900">{result.personal_info.age}</span>
                                                    </div>
                                                )}
                                                {result.total_experience && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">ประสบการณ์</span>
                                                        <span className="font-semibold text-gray-900">{result.total_experience}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills Count */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-gray-900">ทักษะทั้งหมด</span>
                                        </div>
                                        {result.skills && (
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {Object.values(result.skills).flat().length}
                                                </div>
                                                <div className="text-sm text-gray-600">ทักษะที่ตรวจพบ</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Education Level */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium text-gray-900">ระดับการศึกษา</span>
                                        </div>
                                        {result.education?.[0] && (
                                            <div className="text-center">
                                                <div className="text-sm font-semibold text-gray-900 truncate">
                                                    {result.education[0].degree}
                                                </div>
                                                <div className="text-xs text-gray-600 truncate">
                                                    {result.education[0].field}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                {/* Contact Information */}
                                {result.contact_info && (
                                    <Card className="border border-gray-200">
                                        <CardHeader className="border-b border-gray-200 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <Mail className="h-5 w-5" />
                                                ข้อมูลการติดต่อ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            {Object.entries(result.contact_info).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                                                    {key === 'email' && <Mail className="h-4 w-4 text-gray-600" />}
                                                    {key === 'phone' && <Phone className="h-4 w-4 text-gray-600" />}
                                                    {key === 'address' && <MapPin className="h-4 w-4 text-gray-600" />}
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {key.replace(/_/g, " ")}
                                                        </p>
                                                        <p className="font-medium text-gray-900 text-sm">{String(value)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Education */}
                                {result.education?.length > 0 && (
                                    <Card className="border border-gray-200">
                                        <CardHeader className="border-b border-gray-200 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <GraduationCap className="h-5 w-5" />
                                                ประวัติการศึกษา
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            {result.education.map((edu: any, i: number) => (
                                                <div key={i} className="p-3 bg-gray-50 rounded-lg border">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{edu.degree}</p>
                                                            <p className="text-xs text-gray-600">{edu.field}</p>
                                                        </div>
                                                        {edu.gpa && (
                                                            <Badge className="bg-gray-100 text-gray-800">
                                                                GPA: {edu.gpa}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {edu.honor && (
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Award className="h-3 w-3 text-gray-600" />
                                                            <span className="text-xs text-gray-700">{edu.honor}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Language Skills */}
                                {result.language_skills?.length > 0 && (
                                    <Card className="border border-gray-200">
                                        <CardHeader className="border-b border-gray-200 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <Languages className="h-5 w-5" />
                                                ทักษะภาษา
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            {result.language_skills.map((lang: any, i: number) => (
                                                <div key={i} className="p-3 bg-gray-50 rounded border">
                                                    <p className="font-medium text-gray-900 text-sm mb-2">{lang.language}</p>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        {lang.speaking && (
                                                            <div className="text-center p-2 bg-white rounded border">
                                                                <div className="font-medium text-gray-700">พูด</div>
                                                                <div className="text-gray-900">{lang.speaking}</div>
                                                            </div>
                                                        )}
                                                        {lang.reading && (
                                                            <div className="text-center p-2 bg-white rounded border">
                                                                <div className="font-medium text-gray-700">อ่าน</div>
                                                                <div className="text-gray-900">{lang.reading}</div>
                                                            </div>
                                                        )}
                                                        {lang.writing && (
                                                            <div className="text-center p-2 bg-white rounded border">
                                                                <div className="font-medium text-gray-700">เขียน</div>
                                                                <div className="text-gray-900">{lang.writing}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                {/* Work Experience */}
                                {result.work_experience?.length > 0 && (
                                    <Card className="border border-gray-200">
                                        <CardHeader className="border-b border-gray-200 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <Briefcase className="h-5 w-5" />
                                                ประสบการณ์การทำงาน
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                            {result.work_experience.map((exp: any, i: number) => (
                                                <div key={i} className="p-3 bg-gray-50 rounded-lg border-l-2 border-gray-400">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-medium text-gray-900 text-sm">{exp.position}</p>
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                                            {exp.duration}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{exp.start_date} - {exp.end_date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {result.total_experience && (
                                                <div className="p-2 bg-gray-100 rounded border border-gray-300">
                                                    <p className="text-gray-800 font-medium text-center text-sm">
                                                        💼 ประสบการณ์รวม: {result.total_experience}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Skills */}
                                {result.skills && (
                                    <Card className="border border-gray-200">
                                        <CardHeader className="border-b border-gray-200 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                                <Award className="h-5 w-5" />
                                                ทักษะและความสามารถ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            {Object.entries(result.skills).map(([category, list]) =>
                                                list && (list as string[]).length > 0 ? ( 
                                                    <div key={category}>
                                                        <p className="text-sm font-medium text-gray-700 capitalize mb-2">
                                                            {category.replace(/_/g, " ")}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {(list as string[]).map((s, i) => (
                                                                <Badge 
                                                                    key={i} 
                                                                    variant="secondary"
                                                                    className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                                >
                                                                    {s}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Additional Sections */}
                                <div className="space-y-4">
                                    {/* Driving Skills */}
                                    {result.driving_skills && (
                                        <Card className="border border-gray-200">
                                            <CardHeader className="border-b border-gray-200 pb-4">
                                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                                    <Car className="h-5 w-5" />
                                                    ทักษะการขับขี่
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700">สามารถขับขี่</p>
                                                        {result.driving_skills.can_drive?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {result.driving_skills.can_drive.map((d: string, i: number) => (
                                                                    <Badge key={i} variant="secondary" className="bg-gray-100">
                                                                        {d}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">-</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700">ยานพาหนะส่วนตัว</p>
                                                        {result.driving_skills.owns_vehicle?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {result.driving_skills.owns_vehicle.map((v: string, i: number) => (
                                                                    <Badge key={i} variant="secondary" className="bg-gray-100">
                                                                        {v}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">-</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Links */}
                                    {result.links?.length > 0 && (
                                        <Card className="border border-gray-200">
                                            <CardHeader className="border-b border-gray-200 pb-4">
                                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                                    <LinkIcon className="h-5 w-5" />
                                                    ลิงก์และผลงาน
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 space-y-2">
                                                {result.links.map((link: string, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-2 bg-gray-50 rounded border hover:bg-gray-100 transition-colors group"
                                                    >
                                                        <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-gray-700" />
                                                        <span className="text-gray-700 group-hover:text-gray-800 truncate text-sm">
                                                            {link}
                                                        </span>
                                                    </a>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}