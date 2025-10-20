"use client"

import { useState } from "react"
import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL
});

interface MatchScore {
    total_score: number
    vector_similarity: number
    basic_match_score: number
    skill_match_rate: number
    experience_score: number
    education_score: number
    language_score: number
    matching_skills: string[]
    missing_skills: string[]
    skill_categories_match: Record<string, number>
    recommendation: string
}

interface Analysis {
    contact_info?: {
        province?: string
        zip_code?: string
        name?: string
        email?: string
        phone?: string
        address?: string
    }
    personal_info?: {
        age?: number
        gender?: string
        marital_status?: string
    }
    education: Array<{
        degree: string
        field: string
        gpa?: number
        honor?: string
    }>
    work_experience: Array<{
        position: string
        start_date: string
        end_date: string
        duration: string
        salary?: string
    }>
    total_experience: string
    skills: Record<string, string[]>
    responsibilities: string[]
    salary_expectation?: string | null
    certifications: Array<{
        name: string
        year: string | null
    }>
    language_skills: Array<{
        language: string
        speaking: string
        reading: string
        writing: string
        test_score?: {
            test: string
            score: string
        }
    }>
    driving_skills: {
        can_drive: string[]
        owns_vehicle: string[]
    }
    special_abilities: string[]
    links: string[]
    links_detailed: {
        all_links: Array<{
            url: string
            type: string
            is_valid_format: boolean
            domain: string
        }>
        total_count: number
        by_type: Record<string, string[]>
    }
    desired_position?: string | null
    expected_salary_details?: {
        min_salary?: number
        max_salary?: number
        salary_range?: string
        type?: string
    } | null
    preferred_location: {
        provinces: string[]
        areas: string[]
        specific_locations: string[]
        preferences: string[]
    }
    preferred_job_type: string[]
    available_start_date?: {
        raw_text?: string
        availability?: string
        date?: string
        estimated_date?: string
    } | null
    hr_summary: string
}

interface MatchedResume {
    filename: string
    match_score: MatchScore
    analysis: Analysis
}

interface MatchJobRequest {
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
    input_resume_match: MatchScore
    matched_resumes: MatchedResume[]
    total_matched: number
    scanned_files: string[]
    total_scanned: number
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
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.detail || err.message 
                : "Failed to match job"
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