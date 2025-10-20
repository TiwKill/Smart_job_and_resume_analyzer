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
import { FileSearch, Upload, Loader2, ExternalLink } from "lucide-react"
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

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-foreground">📄 Analyze Resume</h1>
                    <p className="text-muted-foreground text-lg">
                        วิเคราะห์และดึงข้อมูลจากเรซูเม่โดยอัตโนมัติ
                    </p>
                </div>

                {/* Upload Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>อัปโหลดไฟล์เรซูเม่</CardTitle>
                        <CardDescription>รองรับไฟล์ PDF, DOC, DOCX, หรือ TXT</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 text-center hover:bg-secondary transition-colors">
                                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                                <p className="text-base font-medium text-foreground mb-1">
                                    {file ? file.name : "คลิกเพื่อเลือกไฟล์เรซูเม่"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    รองรับไฟล์ PDF, DOC, DOCX, TXT
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            disabled={isLoading || !file}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    กำลังวิเคราะห์...
                                </>
                            ) : (
                                <>
                                    <FileSearch className="mr-2 h-5 w-5" />
                                    วิเคราะห์เรซูเม่
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        {/* HR Summary */}
                        {result.hr_summary && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>HR Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="whitespace-pre-wrap text-sm text-foreground">
                                        {result.hr_summary}
                                    </pre>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Info */}
                        {result.contact_info && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {Object.entries(result.contact_info).map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                            <p className="text-muted-foreground capitalize">{key}</p>
                                            <p className="font-medium">{String(value)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Personal Info */}
                        {result.personal_info && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-3 gap-4">
                                    {Object.entries(result.personal_info).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {key.replace(/_/g, " ")}
                                            </p>
                                            <p className="text-sm font-medium">{String(value)}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Education */}
                        {result.education?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Education</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.education.map((edu: any, i: number) => (
                                        <div key={i}>
                                            <p className="font-semibold">{edu.degree}</p>
                                            <p className="text-sm text-muted-foreground">{edu.field}</p>
                                            {edu.honor && (
                                                <p className="text-sm text-primary">{edu.honor}</p>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Work Experience */}
                        {result.work_experience?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Work Experience</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {result.work_experience.map((exp: any, i: number) => (
                                        <div key={i} className="border-l-2 border-primary pl-3">
                                            <p className="font-semibold">{exp.position}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {exp.start_date} - {exp.end_date}
                                            </p>
                                            <p className="text-sm">ระยะเวลา: {exp.duration}</p>
                                        </div>
                                    ))}
                                    {result.total_experience && (
                                        <p className="text-primary font-semibold">
                                            รวมประสบการณ์: {result.total_experience}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Skills */}
                        {result.skills && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {Object.entries(result.skills).map(([category, list]) =>
                                        list && (list as string[]).length > 0 ? ( 
                                            <div key={category}>
                                                <p className="text-sm text-muted-foreground capitalize mb-2">
                                                    {category.replace(/_/g, " ")}
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(list as string[]).map((s, i) => (
                                                        <Badge key={i} variant="secondary">
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

                        {/* Language Skills */}
                        {result.language_skills?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Language Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {result.language_skills.map((lang: any, i: number) => (
                                        <div key={i}>
                                            <p className="font-semibold">{lang.language}</p>
                                            <div className="flex gap-4 text-sm text-muted-foreground">
                                                {lang.speaking && <p>พูด: {lang.speaking}</p>}
                                                {lang.reading && <p>อ่าน: {lang.reading}</p>}
                                                {lang.writing && <p>เขียน: {lang.writing}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Driving Skills */}
                        {result.driving_skills && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Driving Skills</CardTitle>
                                </CardHeader>
                                <CardContent className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">สามารถขับขี่</p>
                                        {result.driving_skills.can_drive?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {result.driving_skills.can_drive.map((d: string, i: number) => (
                                                    <Badge key={i} variant="secondary">
                                                        {d}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">-</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">ยานพาหนะส่วนตัว</p>
                                        {result.driving_skills.owns_vehicle?.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {result.driving_skills.owns_vehicle.map((v: string, i: number) => (
                                                    <Badge key={i} variant="outline">
                                                        {v}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">-</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Links */}
                        {result.links?.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Links & Portfolio</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {result.links.map((link: string, i: number) => (
                                        <a
                                            key={i}
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-primary hover:underline"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            {link}
                                        </a>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
