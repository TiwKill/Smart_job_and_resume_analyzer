"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { useUploadResumes } from "@/hooks/use-upload-resumes"

export default function UploadPage() {
    const [files, setFiles] = useState<File[]>([])
    const [dragOver, setDragOver] = useState(false)
    const { uploadResumes, isLoading, error, data } = useUploadResumes()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            // 过滤掉重复的文件
            const uniqueNewFiles = newFiles.filter(newFile => 
                !files.some(existingFile => 
                    existingFile.name === newFile.name && 
                    existingFile.size === newFile.size
                )
            )
            setFiles((prev) => [...prev, ...uniqueNewFiles])
            
            if (uniqueNewFiles.length < newFiles.length) {
                toast.warning("Some files were skipped", {
                    description: "Duplicate files were not added",
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
                toast.warning("Some files were skipped", {
                    description: `${skippedCount} duplicate or unsupported files were not added`,
                })
            }
            
            if (uniqueNewFiles.length > 0) {
                toast.success("Files added", {
                    description: `${uniqueNewFiles.length} file(s) added from drag and drop`,
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
    }

    const clearAllFiles = () => {
        setFiles([])
        toast.info("All files cleared")
    }

    const handleUpload = async () => {
        if (files.length === 0) {
            toast.error("No files selected", {
                description: "Please select at least one resume file",
            })
            return
        }

        try {
            const result = await uploadResumes(files)
            if (result) {
                // 显示上传结果
                if (result.failed_uploads && result.failed_uploads.length > 0) {
                    toast.warning("Upload completed with some issues", {
                        description: `${result.total_uploaded} uploaded, ${result.failed_uploads.length} failed`,
                    })
                } else {
                    toast.success("Upload successful", {
                        description: `${result.total_uploaded} resume(s) uploaded successfully`,
                    })
                }
                setFiles([])
            }
        } catch (err) {
            // Error is handled by the hook and will be displayed via toast
        }
    }

    // 显示上传结果
    if (data && !isLoading) {
        return (
            <div className="min-h-screen p-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">Upload Results</h1>
                        <p className="text-lg text-muted-foreground">Upload completed with the following results</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-green-600" />
                                Upload Summary
                            </CardTitle>
                            <CardDescription>
                                {data.message}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Successfully Uploaded */}
                            {data.uploaded_files && data.uploaded_files.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        Successfully Uploaded ({data.uploaded_files.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {data.uploaded_files.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-green-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{file.filename}</p>
                                                        <p className="text-xs text-muted-foreground">{file.status}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-green-100 text-green-800">
                                                    Success
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Failed Uploads */}
                            {data.failed_uploads && data.failed_uploads.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        Failed Uploads ({data.failed_uploads.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {data.failed_uploads.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-red-600" />
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{file.filename}</p>
                                                        <p className="text-xs text-muted-foreground">{file.message}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-red-100 text-red-800">
                                                    Failed
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button onClick={() => window.location.reload()} className="flex-1">
                                    Upload More Files
                                </Button>
                                <Button variant="outline" asChild>
                                    <a href="/library">View Library</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Upload Resumes</h1>
                    <p className="text-lg text-muted-foreground">Upload single or multiple resume files for analysis</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Select Resume Files</CardTitle>
                        <CardDescription>Supported formats: PDF, DOC, DOCX, TXT</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Upload Area */}
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div 
                                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                                    dragOver 
                                        ? "border-primary bg-primary/5" 
                                        : "border-border bg-secondary/50 hover:bg-secondary"
                                }`}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                            >
                                <Upload className={`h-12 w-12 mb-4 ${
                                    dragOver ? "text-primary" : "text-muted-foreground"
                                }`} />
                                <p className="text-lg font-medium text-foreground mb-2">
                                    {dragOver ? "Drop files here" : "Drop files here or click to browse"}
                                </p>
                                <p className="text-sm text-muted-foreground">You can upload multiple files at once</p>
                            </div>
                        </div>

                        {/* File List */}
                        {files.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">
                                        Selected Files ({files.length})
                                    </h3>
                                    <Button variant="outline" size="sm" onClick={clearAllFiles}>
                                        Clear All
                                    </Button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {(file.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => removeFile(index)}
                                                className="shrink-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Progress and Button */}
                        <div className="space-y-3">
                            {isLoading && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Uploading {files.length} file(s)... Please wait
                                </div>
                            )}
                            
                            <Button 
                                onClick={handleUpload} 
                                disabled={isLoading || files.length === 0} 
                                className="w-full" 
                                size="lg"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        Upload {files.length} File{files.length > 1 ? "s" : ""}
                                    </>
                                )}
                            </Button>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}