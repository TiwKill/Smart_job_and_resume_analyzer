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
    Award,
    Sparkles
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI-Powered Resume Analysis</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        วิเคราะห์เรซูเม่อัตโนมัติ
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        ระบบวิเคราะห์และดึงข้อมูลจากเรซูเม่โดยใช้เทคโนโลยี AI
                    </p>
                </div>

                {/* Upload Section */}
                <Card className="border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-3 text-blue-900">
                            <Upload className="h-6 w-6" />
                            อัปโหลดไฟล์เรซูเม่
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            รองรับไฟล์ PDF, DOC, DOCX, หรือ TXT ขนาดไม่เกิน 10MB
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-white/80 backdrop-blur-sm p-12 text-center transition-all duration-300 group-hover:border-blue-400 group-hover:bg-blue-50/50">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                                    <Upload className="h-8 w-8 text-blue-600" />
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mb-2">
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
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">PDF</Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">DOC</Badge>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">DOCX</Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700">TXT</Badge>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={isLoading || !file}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    กำลังวิเคราะห์เรซูเม่...
                                </>
                            ) : (
                                <>
                                    <FileSearch className="mr-3 h-5 w-5" />
                                    เริ่มวิเคราะห์ด้วย AI
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <div className="space-y-8">
                        {/* Summary Card */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* HR Summary */}
                            {result.hr_summary && (
                                <Card className="md:col-span-3 border-2 border-green-200 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                        <CardTitle className="flex items-center gap-3 text-green-900">
                                            <Award className="h-6 w-6" />
                                            สรุปผลการวิเคราะห์
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border">
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {result.hr_summary}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Quick Stats */}
                            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5" />
                                            <span className="font-semibold">ข้อมูลส่วนตัว</span>
                                        </div>
                                        {result.personal_info && (
                                            <div className="space-y-2 text-sm">
                                                {result.personal_info.age && (
                                                    <div className="flex justify-between">
                                                        <span>อายุ</span>
                                                        <span className="font-semibold">{result.personal_info.age}</span>
                                                    </div>
                                                )}
                                                {result.total_experience && (
                                                    <div className="flex justify-between">
                                                        <span>ประสบการณ์</span>
                                                        <span className="font-semibold">{result.total_experience}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Skills Count */}
                            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            <span className="font-semibold">ทักษะทั้งหมด</span>
                                        </div>
                                        {result.skills && (
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">
                                                    {Object.values(result.skills).flat().length}
                                                </div>
                                                <div className="text-sm opacity-90">ทักษะที่ตรวจพบ</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Education Level */}
                            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            <span className="font-semibold">ระดับการศึกษา</span>
                                        </div>
                                        {result.education?.[0] && (
                                            <div className="text-center">
                                                <div className="text-lg font-bold truncate">
                                                    {result.education[0].degree}
                                                </div>
                                                <div className="text-sm opacity-90 truncate">
                                                    {result.education[0].field}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Contact Information */}
                                {result.contact_info && (
                                    <Card className="shadow-lg border-2 border-blue-100">
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                            <CardTitle className="flex items-center gap-3 text-blue-900">
                                                <Mail className="h-5 w-5" />
                                                ข้อมูลการติดต่อ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {Object.entries(result.contact_info).map(([key, value]) => (
                                                <div key={key} className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border">
                                                    {key === 'email' && <Mail className="h-4 w-4 text-blue-600" />}
                                                    {key === 'phone' && <Phone className="h-4 w-4 text-green-600" />}
                                                    {key === 'address' && <MapPin className="h-4 w-4 text-red-600" />}
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500 capitalize">
                                                            {key.replace(/_/g, " ")}
                                                        </p>
                                                        <p className="font-medium text-gray-900">{String(value)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Education */}
                                {result.education?.length > 0 && (
                                    <Card className="shadow-lg border-2 border-green-100">
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                            <CardTitle className="flex items-center gap-3 text-green-900">
                                                <GraduationCap className="h-5 w-5" />
                                                ประวัติการศึกษา
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {result.education.map((edu: any, i: number) => (
                                                <div key={i} className="p-4 bg-white/50 rounded-xl border border-green-100">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{edu.degree}</p>
                                                            <p className="text-sm text-gray-600">{edu.field}</p>
                                                        </div>
                                                        {edu.gpa && (
                                                            <Badge className="bg-green-100 text-green-800 border-green-300">
                                                                GPA: {edu.gpa}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {edu.honor && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <Award className="h-4 w-4 text-yellow-600" />
                                                            <span className="text-sm text-yellow-700">{edu.honor}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Language Skills */}
                                {result.language_skills?.length > 0 && (
                                    <Card className="shadow-lg border-2 border-purple-100">
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                                            <CardTitle className="flex items-center gap-3 text-purple-900">
                                                <Languages className="h-5 w-5" />
                                                ทักษะภาษา
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {result.language_skills.map((lang: any, i: number) => (
                                                <div key={i} className="p-3 bg-white/50 rounded-lg border">
                                                    <p className="font-semibold text-gray-900 mb-2">{lang.language}</p>
                                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                                        {lang.speaking && (
                                                            <div className="text-center p-2 bg-blue-50 rounded">
                                                                <div className="font-medium text-blue-700">พูด</div>
                                                                <div className="text-blue-900">{lang.speaking}</div>
                                                            </div>
                                                        )}
                                                        {lang.reading && (
                                                            <div className="text-center p-2 bg-green-50 rounded">
                                                                <div className="font-medium text-green-700">อ่าน</div>
                                                                <div className="text-green-900">{lang.reading}</div>
                                                            </div>
                                                        )}
                                                        {lang.writing && (
                                                            <div className="text-center p-2 bg-purple-50 rounded">
                                                                <div className="font-medium text-purple-700">เขียน</div>
                                                                <div className="text-purple-900">{lang.writing}</div>
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
                            <div className="space-y-6">
                                {/* Work Experience */}
                                {result.work_experience?.length > 0 && (
                                    <Card className="shadow-lg border-2 border-orange-100">
                                        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                                            <CardTitle className="flex items-center gap-3 text-orange-900">
                                                <Briefcase className="h-5 w-5" />
                                                ประสบการณ์การทำงาน
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            {result.work_experience.map((exp: any, i: number) => (
                                                <div key={i} className="p-4 bg-white/50 rounded-xl border-l-4 border-orange-400">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="font-semibold text-gray-900">{exp.position}</p>
                                                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                                            {exp.duration}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{exp.start_date} - {exp.end_date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {result.total_experience && (
                                                <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                                                    <p className="text-orange-800 font-semibold text-center">
                                                        💼 ประสบการณ์รวม: {result.total_experience}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Skills */}
                                {result.skills && (
                                    <Card className="shadow-lg border-2 border-indigo-100">
                                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
                                            <CardTitle className="flex items-center gap-3 text-indigo-900">
                                                <Award className="h-5 w-5" />
                                                ทักษะและความสามารถ
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-6">
                                            {Object.entries(result.skills).map(([category, list]) =>
                                                list && (list as string[]).length > 0 ? ( 
                                                    <div key={category}>
                                                        <p className="text-sm font-semibold text-gray-700 capitalize mb-3">
                                                            {category.replace(/_/g, " ")}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(list as string[]).map((s, i) => (
                                                                <Badge 
                                                                    key={i} 
                                                                    variant="secondary"
                                                                    className="bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200"
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
                                <div className="grid gap-6">
                                    {/* Driving Skills */}
                                    {result.driving_skills && (
                                        <Card className="shadow-lg border-2 border-gray-100">
                                            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                                                <CardTitle className="flex items-center gap-3 text-gray-900">
                                                    <Car className="h-5 w-5" />
                                                    ทักษะการขับขี่
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6">
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-medium text-gray-700">สามารถขับขี่</p>
                                                        {result.driving_skills.can_drive?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {result.driving_skills.can_drive.map((d: string, i: number) => (
                                                                    <Badge key={i} variant="outline" className="bg-blue-50">
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
                                                            <div className="flex flex-wrap gap-2">
                                                                {result.driving_skills.owns_vehicle.map((v: string, i: number) => (
                                                                    <Badge key={i} variant="outline" className="bg-green-50">
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
                                        <Card className="shadow-lg border-2 border-cyan-100">
                                            <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
                                                <CardTitle className="flex items-center gap-3 text-cyan-900">
                                                    <LinkIcon className="h-5 w-5" />
                                                    ลิงก์และผลงาน
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 space-y-3">
                                                {result.links.map((link: string, i: number) => (
                                                    <a
                                                        key={i}
                                                        href={link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-cyan-200 hover:bg-cyan-50 transition-colors group"
                                                    >
                                                        <ExternalLink className="h-4 w-4 text-cyan-600 group-hover:text-cyan-700" />
                                                        <span className="text-cyan-700 group-hover:text-cyan-800 truncate">
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