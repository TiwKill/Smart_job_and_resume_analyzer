"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, RefreshCw, Upload, Database, PieChart, FileSearch, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useListResumes } from "@/hooks/use-list-resumes"

interface ResumeFile {
    filename: string
    size: number
    extension: string
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

// Function to get extension color
const getExtensionColor = (extension: string) => {
    switch (extension.toLowerCase()) {
        case '.pdf':
            return 'bg-red-100 text-red-800 border-red-300'
        case '.doc':
        case '.docx':
            return 'bg-blue-100 text-blue-800 border-blue-300'
        case '.txt':
            return 'bg-green-100 text-green-800 border-green-300'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-300'
    }
}

export default function LibraryPage() {
    const { data, isLoading, error, refetch } = useListResumes()
    const [resumesList, setResumesList] = useState<ResumeFile[]>([])

    useEffect(() => {
        if (data?.resumes) {
            setResumesList(data.resumes)
        }
    }, [data])

    useEffect(() => {
        if (error) {
            toast.error("ไม่สามารถโหลดเรซูเม่ได้", {
                description: error,
            })
        }
    }, [error])

    const handleRefresh = async () => {
        try {
            await refetch()
            toast.success("รีเฟรชรายการเรซูเม่สำเร็จ")
        } catch {
            toast.error("ไม่สามารถรีเฟรชรายการเรซูเม่ได้")
        }
    }

    // Get file type distribution
    const fileTypeDistribution = Array.from(new Set(resumesList.map(r => r.extension))).map(extension => ({
        extension,
        count: resumesList.filter(r => r.extension === extension).length,
        percentage: ((resumesList.filter(r => r.extension === extension).length / resumesList.length) * 100).toFixed(1)
    }))

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">AI-Powered Resume Library</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        คลังเรซูเม่
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        เรซูเม่ทั้งหมดที่อัปโหลดในระบบ
                    </p>
                </div>

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">
                            {isLoading ? "กำลังโหลด..." : `พร้อมใช้งาน - ${resumesList.length} ไฟล์`}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={handleRefresh} 
                            variant="outline" 
                            disabled={isLoading}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            รีเฟรช
                        </Button>
                        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            <a href="/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                อัปโหลดใหม่
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <Card className="border-2 border-purple-200 shadow-lg">
                        <CardContent className="py-16 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">กำลังโหลดเรซูเม่...</p>
                            <p className="text-gray-600">ระบบกำลังดึงข้อมูลเรซูเม่ทั้งหมด</p>
                        </CardContent>
                    </Card>
                ) : resumesList.length > 0 ? (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Resumes */}
                            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">เรซูเม่ทั้งหมด</p>
                                            <p className="text-3xl font-bold">{data?.total || 0}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Database className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total Size */}
                            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">ขนาดไฟล์รวม</p>
                                            <p className="text-3xl font-bold">{formatFileSize(getTotalSize(resumesList))}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FileSearch className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* File Types */}
                            <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">ประเภทไฟล์</p>
                                            <p className="text-3xl font-bold">
                                                {Array.from(new Set(resumesList.map(r => r.extension))).length}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <PieChart className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Average Size */}
                            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm opacity-90">ขนาดไฟล์เฉลี่ย</p>
                                            <p className="text-3xl font-bold">
                                                {formatFileSize(getTotalSize(resumesList) / resumesList.length)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* File Type Distribution */}
                        <Card className="border-2 border-purple-200 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                                <CardTitle className="flex items-center gap-3 text-purple-900">
                                    <PieChart className="h-6 w-6" />
                                    การกระจายประเภทไฟล์
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                    {fileTypeDistribution.map(({ extension, count, percentage }) => (
                                        <div key={extension} className="text-center p-4 bg-white/80 rounded-xl border border-purple-100">
                                            <div className="text-2xl mb-2">{getFileIcon(extension)}</div>
                                            <div className="text-2xl font-bold text-purple-600">{count}</div>
                                            <div className="text-sm text-gray-600 mb-1">{extension.toUpperCase()}</div>
                                            <div className="text-xs text-purple-700 bg-purple-50 rounded-full px-2 py-1">
                                                {percentage}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resume Cards */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">เรซูเม่ทั้งหมด</h2>
                                <Badge variant="outline" className="bg-white/80 text-gray-700">
                                    {resumesList.length} ไฟล์
                                </Badge>
                            </div>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {resumesList.map((resume, index) => (
                                    <Card
                                        key={index}
                                        className="border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl bg-white/80 backdrop-blur-sm"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                                                    <span className="text-2xl">{getFileIcon(resume.extension)}</span>
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <CardTitle className="text-lg truncate text-gray-900">
                                                        {resume.filename}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-4 w-4" />
                                                            {formatFileSize(resume.size)}
                                                        </span>
                                                        <span>•</span>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={getExtensionColor(resume.extension)}
                                                        >
                                                            {resume.extension.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* File Information */}
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-600">ชื่อไฟล์</span>
                                                    <span className="font-medium text-gray-900 truncate max-w-[120px]">
                                                        {resume.filename}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-600">ขนาด</span>
                                                    <span className="font-medium text-gray-900">{formatFileSize(resume.size)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-600">ประเภท</span>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={getExtensionColor(resume.extension)}
                                                    >
                                                        {resume.extension.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <Card className="border-2 border-purple-200 shadow-lg text-center">
                        <CardContent className="py-16">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <FileText className="h-10 w-10 text-purple-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">ยังไม่มีเรซูเม่</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                เริ่มต้นโดยการอัปโหลดเรซูเม่ไฟล์แรกของคุณเพื่อสร้างคลังเรซูเม่
                            </p>
                            <Button 
                                asChild 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-8"
                            >
                                <a href="/upload">
                                    <Upload className="mr-3 h-5 w-5" />
                                    อัปโหลดเรซูเม่แรก
                                </a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}