"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, FolderOpen, CloudUpload, Trash2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useUploadResumes } from "@/hooks/use-upload-resumes"
import { Progress } from "@/components/ui/progress"

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)
    const { uploadResumes, isLoading, error, data } = useUploadResumes()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            // Filter out duplicate files
            const uniqueNewFiles = newFiles.filter(newFile => 
                !files.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size
                )
            )
            setFiles((prev) => [...prev, ...uniqueNewFiles])
            
            if (uniqueNewFiles.length < newFiles.length) {
                toast.warning("พบไฟล์ซ้ำ", {
                    description: "ไม่สามารถเพิ่มไฟล์ซ้ำได้",
                })
            } else if (uniqueNewFiles.length > 0) {
                toast.success("เพิ่มไฟล์สำเร็จ", {
                    description: `เพิ่ม ${uniqueNewFiles.length} ไฟล์แล้ว`,
                })
            }
        }
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
        
        if (e.dataTransfer.files) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file => 
                file.type.includes('pdf') || 
                file.type.includes('document') || 
                file.name.endsWith('.doc') || 
                file.name.endsWith('.docx') || 
                file.name.endsWith('.txt')
            )
            
            const uniqueNewFiles = newFiles.filter(newFile => 
                !files.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size
                )
            )
            
            setFiles((prev) => [...prev, ...uniqueNewFiles])
            
            if (uniqueNewFiles.length < newFiles.length) {
                const skippedCount = newFiles.length - uniqueNewFiles.length
                toast.warning("ไม่สามารถเพิ่มบางไฟล์ได้", {
                    description: `มี ${skippedCount} ไฟล์ที่ซ้ำหรือไม่รองรับ`,
                })
            }
            
            if (uniqueNewFiles.length > 0) {
                toast.success("เพิ่มไฟล์สำเร็จ", {
                    description: `เพิ่ม ${uniqueNewFiles.length} ไฟล์จากการลากและวาง`,
                })
            }
        }
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
        toast.info("ลบไฟล์แล้ว")
    }

    const clearAllFiles = () => {
        setFiles([])
        toast.info("ล้างไฟล์ทั้งหมดแล้ว")
    }

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("ไม่มีไฟล์ที่เลือก", {
                description: "กรุณาเลือกไฟล์เรซูเม่อย่างน้อยหนึ่งไฟล์",
            })
            return
        }

        try {
            const result = await uploadResumes(files)
            if (result) {
                if (result.failed_uploads && result.failed_uploads.length > 0) {
                    toast.warning("อัปโหลดสำเร็จแต่มีบางปัญหา", {
                        description: `อัปโหลดสำเร็จ ${result.total_uploaded} ไฟล์, ล้มเหลว ${result.failed_uploads.length} ไฟล์`,
                    })
                } else {
                    toast.success("อัปโหลดสำเร็จ", {
                        description: `อัปโหลดเรซูเม่ ${result.total_uploaded} ไฟล์สำเร็จ`,
                    })
                }
                setFiles([])
            }
        } catch (err) {
            // Error is handled by the hook and will be displayed via toast
        }
    }

    const getFileIcon = (fileName: string) => {
        if (fileName.toLowerCase().endsWith('.pdf')) return '📄'
        if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) return '📝'
        if (fileName.toLowerCase().endsWith('.txt')) return '📋'
        return '📎'
    }

    const getTotalFileSize = () => {
        return files.reduce((total, file) => total + file.size, 0)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Show upload results
    if (data && !isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                            <Sparkles className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">อัปโหลดสำเร็จ</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ผลการอัปโหลด
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            การอัปโหลดเสร็จสมบูรณ์พร้อมผลลัพธ์ดังต่อไปนี้
                        </p>
                    </div>

                    <Card className="border-2 border-green-200 shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                            <CardTitle className="flex items-center gap-3 text-green-900">
                                <CheckCircle2 className="h-6 w-6" />
                                สรุปผลการอัปโหลด
                            </CardTitle>
                            <CardDescription className="text-green-700">
                                {data.message}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Successfully Uploaded */}
                            {data.uploaded_files && data.uploaded_files.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            อัปโหลดสำเร็จ ({data.uploaded_files.length})
                                        </h3>
                                    </div>
                                    <div className="grid gap-3">
                                        {data.uploaded_files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-xl border-2 border-green-200 bg-green-50/80 p-4 hover:border-green-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                        <FileText className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{file.filename}</p>
                                                        <p className="text-sm text-green-700">{file.status}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800 border-green-300">
                                                    สำเร็จ
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed Uploads */}
                            {data.failed_uploads && data.failed_uploads.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <h3 className="text-lg font-semibold text-foreground">
                                            อัปโหลดล้มเหลว ({data.failed_uploads.length})
                                        </h3>
                                    </div>
                                    <div className="grid gap-3">
                                        {data.failed_uploads.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-xl border-2 border-red-200 bg-red-50/80 p-4 hover:border-red-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{file.filename}</p>
                                                        <p className="text-sm text-red-700">{file.message}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-red-100 text-red-800 border-red-300">
                                                    ล้มเหลว
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                >
                                    <FolderOpen className="mr-2 h-5 w-5" />
                                    อัปโหลดไฟล์เพิ่ม
                                </Button>
                                <Button variant="outline" asChild className="h-12">
                                    <a href="/library">
                                        <FileText className="mr-2 h-5 w-5" />
                                        ดูคลังเรซูเม่
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm border">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">AI-Powered Resume Upload</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        อัปโหลดเรซูเม่
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        อัปโหลดไฟล์เรซูเม่เดี่ยวหรือหลายไฟล์เพื่อวิเคราะห์
                    </p>
                </div>

                <Card className="border-2 border-blue-200 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-3 text-blue-900">
                            <CloudUpload className="h-6 w-6" />
                            เลือกไฟล์เรซูเม่
                        </CardTitle>
                        <CardDescription className="text-blue-700">
                            รองรับรูปแบบไฟล์: PDF, DOC, DOCX, TXT
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Upload Area */}
                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div 
                                className={`flex flex-col items-center justify-center rounded-2xl border-3 border-dashed p-16 text-center transition-all duration-300 ${
                                    dragOver 
                                        ? "border-blue-400 bg-blue-50/80 shadow-inner" 
                                        : "border-blue-300 bg-white/80 backdrop-blur-sm group-hover:border-blue-400 group-hover:bg-blue-50/50"
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                    dragOver ? "bg-blue-100" : "bg-blue-50"
                                }`}>
                                    <Upload className={`h-10 w-10 ${
                                        dragOver ? "text-blue-600" : "text-blue-500"
                                    }`} />
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mb-3">
                                    {dragOver ? "ปล่อยไฟล์ที่นี่" : "ลากไฟล์มาวางหรือคลิกเพื่อเลือก"}
                                </p>
                                <p className="text-gray-600 mb-4">คุณสามารถอัปโหลดหลายไฟล์พร้อมกัน</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">PDF</Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700">DOC</Badge>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700">DOCX</Badge>
                                    <Badge variant="outline" className="bg-orange-50 text-orange-700">TXT</Badge>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            ไฟล์ที่เลือก ({files.length})
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            ขนาดรวม: {formatFileSize(getTotalFileSize())}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={clearAllFiles}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        ล้างทั้งหมด
                                    </Button>
                                </div>
                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-xl border-2 border-gray-200 bg-white/80 p-4 hover:border-blue-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                                                    <span className="text-lg">{getFileIcon(file.name)}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>{formatFileSize(file.size)}</span>
                                                        <span>•</span>
                                                        <span>{file.type || "Unknown"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => removeFile(index)}
                                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Progress and Button */}
                        <div className="space-y-6">
                            {isLoading && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">กำลังอัปโหลด...</span>
                                        <span className="font-medium text-blue-600">{files.length} ไฟล์</span>
                                    </div>
                                    <Progress value={50} className="h-2" />
                                    <div className="flex items-center gap-2 text-sm text-blue-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        กำลังประมวลผลไฟล์... กรุณารอสักครู่
                                    </div>
                                </div>
                            )}
                            
                            <Button 
                                onClick={handleUpload} 
                                disabled={isLoading || files.length === 0} 
                                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload className="mr-3 h-5 w-5" />
                                        อัปโหลด {files.length} ไฟล์
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-200 bg-red-50/80">
                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                                    <div>
                                        <p className="font-medium text-red-800">เกิดข้อผิดพลาด</p>
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            {files.length > 0 && !isLoading && (
                                <div className="grid grid-cols-3 gap-4 pt-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                                        <div className="text-xs text-blue-700">ไฟล์ทั้งหมด</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                        <div className="text-2xl font-bold text-green-600">{formatFileSize(getTotalFileSize())}</div>
                                        <div className="text-xs text-green-700">ขนาดรวม</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {files.filter(f => f.name.endsWith('.pdf')).length}
                                        </div>
                                        <div className="text-xs text-purple-700">ไฟล์ PDF</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}