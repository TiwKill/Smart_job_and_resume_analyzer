"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSearch, Briefcase, TrendingUp, Loader2, AlertCircle, Users, Database, Sparkles, BarChart3, Rocket, Shield, Zap } from "lucide-react"
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

// Function to get file icon based on extension
const getFileIcon = (extension: string) => {
    switch (extension.toLowerCase()) {
        case '.pdf':
            return '📄'
        case '.doc':
        case '.docx':
            return '📝'
        case '.txt':
            return '📋'
        default:
            return '📎'
    }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI-Powered Recruitment Platform</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        ระบบวิเคราะห์เรซูเม่
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        เครื่องมือสรรหาบุคลากรอัจฉริยะสำหรับการวิเคราะห์เรซูเม่และจับคู่ผู้สมัครกับตำแหน่งงาน
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Resumes */}
                    <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">เรซูเม่ทั้งหมด</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold">{totalResumes}</div>
                                    )}
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Database className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Storage Used */}
                    <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">พื้นที่จัดเก็บ</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold">{totalSize}</div>
                                    )}
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Files */}
                    <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">ไฟล์ล่าสุด</p>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-lg">กำลังโหลด...</span>
                                        </div>
                                    ) : error ? (
                                        <div className="flex items-center gap-2 mt-1 text-red-200">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-lg">ข้อผิดพลาด</span>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold">{recentFiles.length}</div>
                                    )}
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <FileSearch className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Analysis */}
                    <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm opacity-90">การวิเคราะห์</p>
                                    <div className="text-3xl font-bold">พร้อมใช้งาน</div>
                                </div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="h-6 w-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Quick Actions */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Actions */}
                        <Card className="border-2 border-blue-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-blue-900">
                                    <Rocket className="h-6 w-6" />
                                    การดำเนินการด่วน
                                </CardTitle>
                                <CardDescription className="text-blue-700">
                                    เริ่มต้นใช้งานระบบด้วยการดำเนินการเหล่านี้
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <Link href="/upload">
                                        <Card className="hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-blue-100 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Upload className="h-8 w-8 text-blue-600" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">อัปโหลดเรซูเม่</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    อัปโหลดไฟล์เรซูเม่เดี่ยวหรือหลายไฟล์เพื่อวิเคราะห์
                                                </p>
                                                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                                    เริ่มอัปโหลด
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/match">
                                        <Card className="hover:border-green-300 hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-green-100 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Users className="h-8 w-8 text-green-600" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">จับคู่ตำแหน่งงาน</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    ค้นหาผู้สมัครที่เหมาะสมกับตำแหน่งงานของคุณ
                                                </p>
                                                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                                                    เริ่มจับคู่
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/analyze">
                                        <Card className="hover:border-purple-300 hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-purple-100 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <FileSearch className="h-8 w-8 text-purple-600" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">วิเคราะห์เรซูเม่</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    แยกและวิเคราะห์ข้อมูลจากไฟล์เรซูเม่
                                                </p>
                                                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                                    เริ่มวิเคราะห์
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </Link>

                                    <Link href="/library">
                                        <Card className="hover:border-orange-300 hover:shadow-md transition-all duration-300 cursor-pointer border-2 border-orange-100 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-6 text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Briefcase className="h-8 w-8 text-orange-600" />
                                                </div>
                                                <h3 className="font-semibold text-gray-900 mb-2">คลังเรซูเม่</h3>
                                                <p className="text-sm text-gray-600 mb-4">
                                                    ดูเรซูเม่ทั้งหมดในคลังของคุณ
                                                </p>
                                                <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
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
                            <Card className="border-2 border-green-200 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                                    <CardTitle className="flex items-center gap-3 text-green-900">
                                        <FileSearch className="h-6 w-6" />
                                        ไฟล์ที่อัปโหลดล่าสุด
                                    </CardTitle>
                                    <CardDescription className="text-green-700">
                                        เรซูเม่ 5 ไฟล์ล่าสุดที่อัปโหลดเข้ามา
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {recentFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-green-100 hover:border-green-300 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                                        <span className="text-xl">{getFileIcon(file.extension)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{file.filename}</p>
                                                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                                            <span>{formatFileSize(file.size)}</span>
                                                            <span>•</span>
                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                {file.extension.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-green-200">
                                        <Link href="/library">
                                            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
                                                ดูเรซูเม่ทั้งหมด
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Features */}
                    <div className="space-y-8">
                        {/* Features Section */}
                        <Card className="border-2 border-purple-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-purple-900">
                                    <Zap className="h-6 w-6" />
                                    คุณสมบัติหลัก
                                </CardTitle>
                                <CardDescription className="text-purple-700">
                                    สิ่งที่ทำให้ระบบวิเคราะห์เรซูเม่ของเรามีประสิทธิภาพ
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex gap-4 p-3 bg-white/80 rounded-xl border border-purple-100">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Database className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">การจัดการเรซูเม่</h3>
                                        <p className="text-sm text-gray-600">
                                            อัปโหลดและจัดระเบียบไฟล์เรซูเม่ทั้งหมดในคลังเดียว
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-3 bg-white/80 rounded-xl border border-green-100">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                                        <FileSearch className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">การวิเคราะห์ไฟล์</h3>
                                        <p className="text-sm text-gray-600">
                                            วิเคราะห์ไฟล์เรซูเม่เพื่อแยกข้อมูลสำคัญและเมตาดาต้า
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-3 bg-white/80 rounded-xl border border-orange-100">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shrink-0">
                                        <TrendingUp className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">ข้อมูลพื้นที่จัดเก็บ</h3>
                                        <p className="text-sm text-gray-600">
                                            ติดตามการใช้พื้นที่จัดเก็บและจัดการคลังเรซูเม่อย่างมีประสิทธิภาพ
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-3 bg-white/80 rounded-xl border border-indigo-100">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shrink-0">
                                        <Shield className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">ความปลอดภัย</h3>
                                        <p className="text-sm text-gray-600">
                                            ข้อมูลของคุณได้รับการปกป้องด้วยมาตรฐานความปลอดภัยระดับสูง
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* System Status */}
                        <Card className="border-2 border-blue-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-blue-900">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    สถานะระบบ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg border">
                                    <span className="text-sm text-gray-700">เซิร์ฟเวอร์</span>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">ออนไลน์</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg border">
                                    <span className="text-sm text-gray-700">ฐานข้อมูล</span>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">เชื่อมต่อแล้ว</Badge>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/80 rounded-lg border">
                                    <span className="text-sm text-gray-700">AI Engine</span>
                                    <Badge className="bg-green-100 text-green-800 border-green-300">พร้อมใช้งาน</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}