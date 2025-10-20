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
    file_path: string
    size: string
    size_bytes: number
    contact_info?: {
        name?: string
        email?: string
        phone?: string
    }
    personal_info?: {
        age?: number
        gender?: string
    }
    education?: Array<{
        degree: string
        field: string
        gpa?: number
    }>
    total_experience?: string
    skills_summary?: string[]
    error?: string
}

interface ListResumesResponse {
    resumes: ResumeFile[]
    total_resumes: number
    total_size: number
    total_size_formatted: string
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
            setTotalResumes(responseData.total_resumes || 0)
            setTotalSize(responseData.total_size_formatted || "0 KB")
        }
    }, [data])

    useEffect(() => {
        if (error) {
            toast.error("Failed to load resume data", {
                description: typeof error === 'string' ? error : "An error occurred",
            })
        }
    }, [error])

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
                                        {resumesList.slice(0, 5).length}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Last 5 uploads
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

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

                        <Card className="hover:border-primary transition-colors">
                            <CardHeader>
                                <Briefcase className="h-8 w-8 text-primary mb-2" />
                                <CardTitle>Match Job</CardTitle>
                                <CardDescription>
                                    Find the best candidates for your job positions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/match">
                                    <Button className="w-full" variant="outline">
                                        Match Candidates
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
                                <h3 className="font-semibold">AI-Powered Analysis</h3>
                                <p className="text-sm text-muted-foreground">
                                    Extract skills, experience, education, certifications, and more from resumes automatically
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Smart Job Matching</h3>
                                <p className="text-sm text-muted-foreground">
                                    Match candidates with job positions based on skills, experience, and requirements
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <TrendingUp className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Detailed Insights</h3>
                                <p className="text-sm text-muted-foreground">
                                    Get comprehensive candidate profiles including language skills, certifications, and driving licenses
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}