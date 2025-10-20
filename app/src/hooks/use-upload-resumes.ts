"use client"

import { useState } from "react"
import axios, { AxiosError } from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
    baseURL: API_URL
});

interface UploadResult {
    filename: string
    status: string
    message?: string
}

interface UploadResponse {
    message: string
    uploaded_files: UploadResult[]
    total_uploaded: number
    failed_uploads: UploadResult[]
}

export function useUploadResumes() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<UploadResponse | null>(null)

    const uploadResumes = async (files: File[]) => {
        setIsLoading(true)
        setError(null)
        setData(null)

        try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append("files", file)
            })

            const result = await api.post<UploadResponse>("/upload-resumes", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            
            setData(result.data)
            return result.data
        } catch (err) {
            const errorMessage = err instanceof AxiosError 
                ? err.response?.data?.message || err.message 
                : "Failed to upload resumes"
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
        uploadResumes,
        isLoading,
        error,
        data,
        reset,
    }
}