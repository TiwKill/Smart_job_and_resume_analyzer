"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, FolderOpen, CloudUpload, Trash2 } from "lucide-react"
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
            <div className="min-h-screen bg-white p-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            ผลการอัปโหลด
                        </h1>
                        <p className="text-gray-600">
                            การอัปโหลดเสร็จสมบูรณ์พร้อมผลลัพธ์ดังต่อไปนี้
                        </p>
                    </div>

                    <Card className="border border-gray-200 shadow-sm">
                        <CardHeader className="border-b border-gray-200 pb-4">
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <CheckCircle2 className="h-5 w-5" />
                                สรุปผลการอัปโหลด
                            </CardTitle>
                            <CardDescription>
                                {data.message}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {/* Successfully Uploaded */}
                            {data.uploaded_files && data.uploaded_files.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <h3 className="font-medium text-gray-900">
                                            อัปโหลดสำเร็จ ({data.uploaded_files.length})
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {data.uploaded_files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300">
                                                        <FileText className="h-4 w-4 text-gray-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{file.filename}</p>
                                                        <p className="text-xs text-gray-600">{file.status}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-green-100 text-green-800">
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
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <h3 className="font-medium text-gray-900">
                                            อัปโหลดล้มเหลว ({data.failed_uploads.length})
                                        </h3>
                                    </div>
                                    <div className="space-y-3">
                                        {data.failed_uploads.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300">
                                                        <AlertCircle className="h-4 w-4 text-gray-700" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{file.filename}</p>
                                                        <p className="text-xs text-gray-600">{file.message}</p>
                                                    </div>
                                                </div>
                                                <Badge className="bg-red-100 text-red-800">
                                                    ล้มเหลว
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <Button 
                                    onClick={() => window.location.reload()} 
                                    className="flex-1"
                                >
                                    <FolderOpen className="mr-2 h-4 w-4" />
                                    อัปโหลดไฟล์เพิ่ม
                                </Button>
                                <Button variant="outline" asChild>
                                    <a href="/library">
                                        <FileText className="mr-2 h-4 w-4" />
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
        <div className="min-h-screen bg-white p-6">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        อัปโหลดเรซูเม่
                    </h1>
                    <p className="text-gray-600">
                        อัปโหลดไฟล์เรซูเม่เดี่ยวหรือหลายไฟล์เพื่อวิเคราะห์
                    </p>
                </div>

                <Card className="border border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-200 pb-4">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <CloudUpload className="h-5 w-5" />
                            เลือกไฟล์เรซูเม่
                        </CardTitle>
                        <CardDescription>
                            รองรับรูปแบบไฟล์: PDF, DOC, DOCX, TXT
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
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
                                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-all duration-200 ${
                                    dragOver 
                                        ? "border-gray-400 bg-gray-50" 
                                        : "border-gray-300 bg-white group-hover:border-gray-400 group-hover:bg-gray-50"
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                                    dragOver ? "bg-gray-100" : "bg-gray-50"
                                }`}>
                                    <Upload className={`h-8 w-8 ${
                                        dragOver ? "text-gray-700" : "text-gray-600"
                                    }`} />
                                </div>
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    {dragOver ? "ปล่อยไฟล์ที่นี่" : "ลากไฟล์มาวางหรือคลิกเพื่อเลือก"}
                                </p>
                                <p className="text-gray-600 mb-4 text-sm">คุณสามารถอัปโหลดหลายไฟล์พร้อมกัน</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <Badge variant="secondary" className="bg-gray-100">PDF</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">DOC</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">DOCX</Badge>
                                    <Badge variant="secondary" className="bg-gray-100">TXT</Badge>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            ไฟล์ที่เลือก ({files.length})
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            ขนาดรวม: {formatFileSize(getTotalFileSize())}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        onClick={clearAllFiles}
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        ล้างทั้งหมด
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center border border-gray-300">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {file.name}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-600">
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
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Progress and Button */}
                        <div className="space-y-4">
                            {isLoading && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">กำลังอัปโหลด...</span>
                                        <span className="font-medium text-gray-600">{files.length} ไฟล์</span>
                                    </div>
                                    <Progress value={50} className="h-1" />
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        กำลังประมวลผลไฟล์... กรุณารอสักครู่
                                    </div>
                                </div>
                            )}
                            
                            <Button 
                                onClick={handleUpload} 
                                disabled={isLoading || files.length === 0} 
                                className="w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed" 
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังอัปโหลด...
                                    </>
                                ) : (
                                    <>
                                        <CloudUpload className="mr-2 h-4 w-4" />
                                        อัปโหลด {files.length} ไฟล์
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                                    <div>
                                        <p className="font-medium text-red-800 text-sm">เกิดข้อผิดพลาด</p>
                                        <p className="text-xs text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            {files.length > 0 && !isLoading && (
                                <div className="grid grid-cols-3 gap-3 pt-3">
                                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                        <div className="text-lg font-semibold text-gray-900">{files.length}</div>
                                        <div className="text-xs text-gray-600">ไฟล์ทั้งหมด</div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                        <div className="text-lg font-semibold text-gray-900">{formatFileSize(getTotalFileSize())}</div>
                                        <div className="text-xs text-gray-600">ขนาดรวม</div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {files.filter(f => f.name.endsWith('.pdf')).length}
                                        </div>
                                        <div className="text-xs text-gray-600">ไฟล์ PDF</div>
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