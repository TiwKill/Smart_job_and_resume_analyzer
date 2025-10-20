"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileSearch, Briefcase, TrendingUp, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useListResumes } from "@/hooks/use-list-resumes"
import { toast } from "sonner"

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
            toast.error("Failed to load resume data", {
                description: typeof error === 'string' ? error : "An error occurred",
            })
        }
    }, [error])

    // Get recent files (last 5 uploaded)
    const recentFiles = resumesList.slice(0, 5)

    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                        Resume Analysis Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        AI-powered recruitment tool for analyzing resumes and matching candidates with job positions
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
                            <FileSearch className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Error</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">
                                        {totalResumes}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Resumes in database
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Error</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">
                                        {totalSize}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Total files size
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Recent Files</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    <span>Loading...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Error</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">
                                        {recentFiles.length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Last 5 uploads
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Files Preview */}
                {recentFiles.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Uploads</CardTitle>
                            <CardDescription>
                                Recently uploaded resume files
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileSearch className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="font-medium text-sm">{file.filename}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)} • {file.extension}
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline">
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                                <Upload className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Upload Resume</CardTitle>
                                <CardDescription>
                                    Upload single or multiple resume files for analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/upload">
                                    <Button className="w-full">Upload Now</Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                                <FileSearch className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>View Library</CardTitle>
                                <CardDescription>
                                    Browse all resumes in your library
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/library">
                                    <Button className="w-full" variant="outline">
                                        View Library
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                                <Briefcase className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Analyze Resume</CardTitle>
                                <CardDescription>
                                    Extract and analyze candidate information from resumes
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/analyze">
                                    <Button className="w-full" variant="outline">
                                        Start Analysis
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Features Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Features</CardTitle>
                        <CardDescription>What makes our resume analyzer powerful</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <FileSearch className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Resume Management</h3>
                                <p className="text-sm text-muted-foreground">
                                    Upload and organize all your resume files in one centralized library
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">File Analysis</h3>
                                <p className="text-sm text-muted-foreground">
                                    Analyze resume files to extract important information and metadata
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Storage Insights</h3>
                                <p className="text-sm text-muted-foreground">
                                    Track your storage usage and manage your resume library efficiently
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}