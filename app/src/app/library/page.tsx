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
import { FileText, Loader2, RefreshCw } from "lucide-react"
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
            toast.error("Failed to load resumes", {
                description: error,
            })
        }
    }, [error])

    const handleRefresh = async () => {
        try {
            await refetch()
            toast.success("Resume list refreshed successfully")
        } catch {
            toast.error("Failed to refresh resume list")
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">
                            Resume Library
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            All uploaded resumes in the database
                        </p>
                    </div>
                    <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </div>

                {/* Loading */}
                {isLoading ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                            <p className="text-muted-foreground">Loading resumes...</p>
                        </CardContent>
                    </Card>
                ) : resumesList.length > 0 ? (
                    <>
                        {/* Library Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Library Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-3">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Total Resumes</p>
                                    <p className="text-3xl font-bold text-primary">{data?.total || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">Total Size</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {formatFileSize(getTotalSize(resumesList))}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">File Types</p>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {Array.from(new Set(resumesList.map(r => r.extension))).length}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resume Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {resumesList.map((resume, index) => (
                                <Card
                                    key={index}
                                    className="hover:border-primary transition-colors duration-200 hover:shadow-md"
                                >
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            <FileText className="h-10 w-10 text-primary shrink-0" />
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <CardTitle className="text-lg truncate">
                                                    {resume.filename}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <FileText className="h-4 w-4" />
                                                    <span>{formatFileSize(resume.size)}</span>
                                                    <span>•</span>
                                                    <span>{resume.extension}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* File Information */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">File Name</span>
                                                <span className="font-medium truncate max-w-[150px]">
                                                    {resume.filename}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Size</span>
                                                <span className="font-medium">{formatFileSize(resume.size)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Type</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {resume.extension.toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* File Type Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>File Type Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {Array.from(new Set(resumesList.map(r => r.extension))).map(extension => (
                                        <div key={extension} className="text-center">
                                            <p className="text-sm text-muted-foreground">
                                                {extension.toUpperCase()} Files
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {resumesList.filter(r => r.extension === extension).length}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    // Empty State
                    <Card>
                        <CardContent className="py-12 text-center">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">
                                No resumes found in the library
                            </p>
                            <Button asChild>
                                <a href="/upload">Upload Resume</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}