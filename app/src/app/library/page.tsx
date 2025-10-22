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
import { FileText, Loader2, RefreshCw, Upload, Database, PieChart, FileSearch } from "lucide-react"
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
            return 'bg-red-100 text-red-800'
        case '.doc':
        case '.docx':
            return 'bg-blue-100 text-blue-800'
        case '.txt':
            return 'bg-green-100 text-green-800'
        default:
            return 'bg-gray-100 text-gray-800'
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
        <div className="min-h-screen bg-white p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        คลังเรซูเม่
                    </h1>
                    <p className="text-gray-600">
                        เรซูเม่ทั้งหมดที่อัปโหลดในระบบ
                    </p>
                </div>

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                            {isLoading ? "กำลังโหลด..." : `พร้อมใช้งาน - ${resumesList.length} ไฟล์`}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            onClick={handleRefresh} 
                            variant="outline" 
                            disabled={isLoading}
                            className="border-gray-300"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            รีเฟรช
                        </Button>
                        <Button asChild>
                            <a href="/upload">
                                <Upload className="mr-2 h-4 w-4" />
                                อัปโหลดใหม่
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <Card className="border border-gray-200">
                        <CardContent className="py-16 text-center">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <Loader2 className="h-6 w-6 text-gray-600 animate-spin" />
                            </div>
                            <p className="text-lg font-medium text-gray-900 mb-2">กำลังโหลดเรซูเม่...</p>
                            <p className="text-gray-600">ระบบกำลังดึงข้อมูลเรซูเม่ทั้งหมด</p>
                        </CardContent>
                    </Card>
                ) : resumesList.length > 0 ? (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Total Resumes */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">เรซูเม่ทั้งหมด</p>
                                            <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Database className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total Size */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">ขนาดไฟล์รวม</p>
                                            <p className="text-2xl font-bold text-gray-900">{formatFileSize(getTotalSize(resumesList))}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FileSearch className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* File Types */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">ประเภทไฟล์</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {Array.from(new Set(resumesList.map(r => r.extension))).length}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <PieChart className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Average Size */}
                            <Card className="border border-gray-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">ขนาดไฟล์เฉลี่ย</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatFileSize(getTotalSize(resumesList) / resumesList.length)}
                                            </p>
                                        </div>
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-gray-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* File Type Distribution */}
                        <Card className="border border-gray-200">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-900">
                                    <PieChart className="h-5 w-5" />
                                    การกระจายประเภทไฟล์
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {fileTypeDistribution.map(({ extension, count, percentage }) => (
                                        <div key={extension} className="text-center p-4 bg-gray-50 rounded-lg border">
                                            <div className="text-xl mb-2">{getFileIcon(extension)}</div>
                                            <div className="text-xl font-bold text-gray-900">{count}</div>
                                            <div className="text-sm text-gray-600 mb-1">{extension.toUpperCase()}</div>
                                            <div className="text-xs text-gray-700 bg-white rounded-full px-2 py-1 border">
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
                                <h2 className="text-xl font-bold text-gray-900">เรซูเม่ทั้งหมด</h2>
                                <Badge variant="secondary" className="text-gray-700">
                                    {resumesList.length} ไฟล์
                                </Badge>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {resumesList.map((resume, index) => (
                                    <Card
                                        key={index}
                                        className="border border-gray-200 hover:border-gray-300 transition-colors bg-white"
                                    >
                                        <CardHeader className="pb-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg">{getFileIcon(resume.extension)}</span>
                                                </div>
                                                <div className="min-w-0 flex-1 space-y-2">
                                                    <CardTitle className="text-base truncate text-gray-900">
                                                        {resume.filename}
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="flex items-center gap-1">
                                                            <FileText className="h-3 w-3" />
                                                            {formatFileSize(resume.size)}
                                                        </span>
                                                        <span>•</span>
                                                        <Badge 
                                                            variant="secondary" 
                                                            className={getExtensionColor(resume.extension)}
                                                        >
                                                            {resume.extension.toUpperCase()}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* File Information */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                                                    <span className="text-gray-600">ชื่อไฟล์</span>
                                                    <span className="font-medium text-gray-900 truncate max-w-[120px]">
                                                        {resume.filename}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
                                                    <span className="text-gray-600">ขนาด</span>
                                                    <span className="font-medium text-gray-900">{formatFileSize(resume.size)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border">
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
                    <Card className="border border-gray-200 text-center">
                        <CardContent className="py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-8 w-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีเรซูเม่</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                เริ่มต้นโดยการอัปโหลดเรซูเม่ไฟล์แรกของคุณเพื่อสร้างคลังเรซูเม่
                            </p>
                            <Button 
                                asChild 
                                className="px-6"
                            >
                                <a href="/upload">
                                    <Upload className="mr-2 h-4 w-4" />
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