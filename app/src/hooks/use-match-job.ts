"use client"

import { useState } from "react"
import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8002/api"

const api = axios.create({
    baseURL: API_URL,
})

interface ScoreBreakdown {
    skills: number
    position: number
    salary: number
    education: number
    location: number
    experience: number
}

interface MatchDetails {
    skills?: {
        matched_skills: string[]
        skill_categories: Record<string, any>
        total_matched: number
    }
    matched_positions?: string[]
    salary?: {
        status: string
        expected: number
        resume_range: string
    }
    education?: {
        level: string
        field_relevant: boolean
        field: string
    }
    location?: {
        status: string
        province: string
    }
    experience?: {
        status: string
        experience: string
    }
}

interface ResumeData {
    id: string
    score: string
    age: string
    position: string
    province: string
    salary: string
    education: string
    field: string
    university: string
    experience: string
    updated: string
    profile_url: string
}

interface TopMatch {
    total_score: number
    breakdown: ScoreBreakdown
    details: MatchDetails
    recommendation: string
    resume_data: ResumeData
}

interface Statistics {
    total_resumes_scanned: number
    average_score: number
    high_quality_matches: number
    top_matches_count: number
}

interface MatchJobRequest {
    cookies: {
        phpsessid: string
        guest_id: string
        fcnec: string
    }
    analysis: {
        skills: Record<string, string[]>
        total_experience: string
        education: Array<{
            degree: string
            field: string
            gpa: number
        }>
    }
    job_description: string
}

interface MatchJobResponse {
    status: string
    statistics: Statistics
    top_matches: TopMatch[]
    csv_file: string
    job_description: string
    matching_algorithm: string
}

export function useMatchJob() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<MatchJobResponse | null>(null)

    const matchJob = async (requestData: MatchJobRequest) => {
        setIsLoading(true)
        setError(null)
        setData(null)

        try {
            const result = await api.post("/match-job", requestData)
            setData(result.data)
            return result.data
        } catch (err) {
            const errorMessage = err instanceof AxiosError ? err.response?.data?.detail || err.message : "Failed to match job"
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const reset = () => {
        setIsLoading(false)
        setError(null)
        setData(null)
    }

    return {
        matchJob,
        isLoading,
        error,
        data,
        reset,
    }
}
