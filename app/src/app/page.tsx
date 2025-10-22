"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSearch, Briefcase, TrendingUp, Loader2, AlertCircle, Users, Database, BarChart3, FileText } from "lucide-react"
import Link from "next/link"
import { useListResumes } from "@/hooks/use-list-resumes"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

interface ResumeFile {
    filename: string
    size: number
    extension: string
}

interface ListResumesResponse {
    resumes: ResumeFile[]
    total: number
}

// Function to format file size
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Function to get total size of all resumes
const getTotalSize = (resumes: ResumeFile[]): number => {
    return resumes.reduce((total, resume) => total + resume.size, 0)
}

export default function DashboardPage() {
    const { data, isLoading, error, refetch } = useListResumes()
    const [resumesList, setResumesList] = useState<ResumeFile[]>([])
    const [totalResumes, setTotalResumes] = useState<number>(0)
    const [totalSize, setTotalSize] = useState<string>("0 KB")

    useEffect(() => {
        if (data) {
            const responseData = data as ListResumesResponse
            setResumesList(responseData.resumes || [])
            setTotalResumes(responseData.total || 0)
            setTotalSize(formatFileSize(getTotalSize(responseData.resumes || [])))
        }
    }, [data])

    useEffect(() => {
        if (error) {
            toast.error("ไม่สามารถโหลดข้อมูลเรซูเม่ได้", {
                description: typeof error === 'string' ? error : "เกิดข้อผิดพลาด",
            })
        }
    }, [error])

    // Get recent files (last 5 uploaded)
    const recentFiles = resumesList.slice(0, 5)

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        ระบบวิเคราะห์เรซูเม่
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        เครื่องมือวิเคราะห์เรซูเม่อัจฉริยะสำหรับการสรรหาบุคลากร
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-3 md:grid-cols-1 lg:grid-cols-3">
                    {/* Total Resumes */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">เรซูเม่ทั้งหมด</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-semibold text-gray-900">{totalResumes}</div>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Database className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Used */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">พื้นที่จัดเก็บ</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-semibold text-gray-900">{totalSize}</div>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Files */}
                    <Card className="border border-gray-200 shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">ไฟล์ล่าสุด</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-semibold text-gray-900">{recentFiles.length}</div>
                                    )}
                                </div>
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileSearch className="h-5 w-5 text-gray-700" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Quick Actions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quick Actions */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <FileText className="h-5 w-5" />
                                    การดำเนินการด่วน
                                </CardTitle>
                                <CardDescription>
                                    เริ่มต้นใช้งานระบบด้วยการดำเนินการเหล่านี้
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Link href="/upload">
                                        <Card className="hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                    <Upload className="h-6 w-6 text-gray-700" />
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1">อัปโหลดเรซูเม่</h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    อัปโหลดไฟล์เรซูเม่เดี่ยวหรือหลายไฟล์
                                                </p>
                                                <Button variant="outline" className="w-full border-gray-300">
                                                    เริ่มอัปโหลด
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/match">
                                        <Card className="hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                    <Users className="h-6 w-6 text-gray-700" />
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1">จับคู่ตำแหน่งงาน</h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    ค้นหาผู้สมัครที่เหมาะสม
                                                </p>
                                                <Button variant="outline" className="w-full border-gray-300">
                                                    เริ่มจับคู่
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/analyze">
                                        <Card className="hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                    <FileSearch className="h-6 w-6 text-gray-700" />
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1">วิเคราะห์เรซูเม่</h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    แยกและวิเคราะห์ข้อมูลจากเรซูเม่
                                                </p>
                                                <Button variant="outline" className="w-full border-gray-300">
                                                    เริ่มวิเคราะห์
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/library">
                                        <Card className="hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 bg-white">
                                            <CardContent className="p-4 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                    <Briefcase className="h-6 w-6 text-gray-700" />
                                                </div>
                                                <h3 className="font-medium text-gray-900 mb-1">คลังเรซูเม่</h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    ดูเรซูเม่ทั้งหมดในคลัง
                                                </p>
                                                <Button variant="outline" className="w-full border-gray-300">
                                                    ดูคลัง
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Files Preview */}
                        {recentFiles.length > 0 && (
                            <Card className="border border-gray-200 shadow-sm">
                                <CardHeader className="border-b border-gray-200 pb-4">
                                    <CardTitle className="flex items-center gap-2 text-gray-900">
                                        <FileSearch className="h-5 w-5" />
                                        ไฟล์ที่อัปโหลดล่าสุด
                                    </CardTitle>
                                    <CardDescription>
                                        เรซูเม่ 5 ไฟล์ล่าสุดที่อัปโหลดเข้ามา
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {recentFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300">
                                                        <FileText className="h-4 w-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{file.filename}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                                                            <span>{formatFileSize(file.size)}</span>
                                                            <span>•</span>
                                                            <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                                                                {file.extension.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <Link href="/library">
                                            <Button variant="outline" className="w-full border-gray-300">
                                                ดูเรซูเม่ทั้งหมด
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Features */}
                    <div className="space-y-6">
                        {/* Features Section */}
                        <Card className="border border-gray-200 shadow-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <BarChart3 className="h-5 w-5" />
                                    คุณสมบัติหลัก
                                </CardTitle>
                                <CardDescription>
                                    ความสามารถหลักของระบบ
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300 shrink-0">
                                        <Database className="h-4 w-4 text-gray-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-sm mb-1">การจัดการเรซูเม่</h3>
                                        <p className="text-xs text-gray-600">
                                            อัปโหลดและจัดระเบียบไฟล์เรซูเม่ทั้งหมดในคลังเดียว
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300 shrink-0">
                                        <FileSearch className="h-4 w-4 text-gray-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-sm mb-1">การวิเคราะห์ไฟล์</h3>
                                        <p className="text-xs text-gray-600">
                                            วิเคราะห์ไฟล์เรซูเม่เพื่อแยกข้อมูลสำคัญ
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300 shrink-0">
                                        <TrendingUp className="h-4 w-4 text-gray-700" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900 text-sm mb-1">ติดตามพื้นที่จัดเก็บ</h3>
                                        <p className="text-xs text-gray-600">
                                            ติดตามการใช้พื้นที่จัดเก็บและจัดการคลังเรซูเม่อย่างมีประสิทธิภาพ
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}