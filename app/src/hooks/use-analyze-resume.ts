"use client"

import { useState } from "react"
import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL
});

interface Education {
    degree: string
    field: string
    gpa: number
    institution?: string
    year?: string
}

interface WorkExperience {
    company: string
    position: string
    duration: string
    responsibilities?: string[]
    salary?: string
}

interface Certification {
    name: string
    issuer?: string
    date?: string
}

interface LanguageSkill {
    language: string
    speaking?: string
    reading?: string
    writing?: string
    test_score?: string
}

interface DrivingAbility {
    licenses?: string[]
    owned_vehicles?: string[]
}

interface AnalyzeResponse {
    filename: string
    analysis: {
        personal_info: {
            name?: string
            email?: string
            phone?: string
            address?: string
            date_of_birth?: string
            age?: number
            nationality?: string
            religion?: string
            marital_status?: string
        }
        skills: Record<string, string[]>
        total_experience?: string
        education: Education[]
        work_experience: WorkExperience[]
        certifications?: Certification[]
        language_skills?: LanguageSkill[]
        driving_ability?: DrivingAbility
        special_abilities?: string[]
        links?: string[]
    }
    summary?: string
}

export function useAnalyzeResume() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<AnalyzeResponse | null>(null)

    const analyzeResume = async (file: File): Promise<AnalyzeResponse> => {
        setIsLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const result = await api.post("/analyze-resume", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            setData(result.data)
            return result.data
        } catch (err) {
            const errorMessage = err instanceof AxiosError ? err.message : "Failed to analyze resume"
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
        analyzeResume,
        isLoading,
        error,
        data,
        reset,
    }
}
