"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileSearch, Upload, Briefcase, Library, LayoutDashboard } from "lucide-react"

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/upload", label: "Upload", icon: Upload },
    { href: "/analyze", label: "Analyze", icon: FileSearch },
    { href: "/match", label: "Match", icon: Briefcase },
    { href: "/library", label: "Library", icon: Library },
]

export function Sidebar() {
    const pathname = usePathname()
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
            <div className="flex h-14 items-center px-4 text-lg font-semibold text-gray-900">
                Smart Analyzer
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100vh-56px)]">
                <nav className="space-y-1 p-2">
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                    active
                                        ? "bg-gray-100 text-gray-900 border-l-2 border-gray-900"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>
        </aside>
    )
}