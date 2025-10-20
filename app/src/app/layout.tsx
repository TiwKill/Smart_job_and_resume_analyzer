import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-geist-sans",
})

export const metadata: Metadata = {
    title: "Resume Analyzer - AI-Powered Recruitment",
    description: "Analyze resumes and match candidates with job positions using AI",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} antialiased`}>
            <body className="font-sans">
                <div className="flex min-h-screen">
                    <Sidebar />
                    <main className="flex-1 ml-64">{children}</main>
                </div>
            </body>
        </html>
    )
}
