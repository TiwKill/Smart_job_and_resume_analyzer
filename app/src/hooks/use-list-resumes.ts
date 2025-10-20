"use client"

import { useState, useEffect } from "react"
import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL
});

interface ResumeFile {
    filename: string
    size: number
    extension: string
}

interface ListResumesResponse {
    total: number
    resumes: ResumeFile[]
}

export function useListResumes(autoFetch = true) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<ListResumesResponse | null>(null)

    const fetchResumes = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await api.get<ListResumesResponse>("/list-resumes")
            setData(result.data)
            return result.data
        } catch (err) {
            const errorMessage =
                err instanceof AxiosError ? err.message : "Failed to fetch resumes"
            setError(errorMessage)
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const refetch = () => fetchResumes()
    const reset = () => {
        setData(null)
        setError(null)
        setIsLoading(false)
    }

    useEffect(() => {
        if (autoFetch) {
            fetchResumes()
        }
    }, [autoFetch])

    return { 
        data, 
        isLoading, 
        error, 
        refetch, 
        reset 
    }
}