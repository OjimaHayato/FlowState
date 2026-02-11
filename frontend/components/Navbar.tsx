"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Timer, LayoutDashboard, LogOut, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    if (pathname === "/login") return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 md:top-0 md:bottom-auto z-50">
            <div className="max-w-screen-md mx-auto flex justify-around items-center md:justify-between">
                <div className="hidden md:block text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-500">
                    Flowstate
                </div>

                <div className="flex gap-8">
                    <Link
                        href="/timer"
                        className={cn(
                            "flex flex-col items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors",
                            pathname === "/timer" && "text-indigo-400"
                        )}
                    >
                        <Timer className="w-6 h-6" />
                        <span>Timer</span>
                    </Link>

                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex flex-col items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors",
                            pathname === "/dashboard" && "text-indigo-400"
                        )}
                    >
                        <LayoutDashboard className="w-6 h-6" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        href="/settings"
                        className={cn(
                            "flex flex-col items-center gap-1 text-sm text-neutral-500 hover:text-white transition-colors",
                            pathname.startsWith("/settings") && "text-indigo-400"
                        )}
                    >
                        <Settings2 className="w-6 h-6" />
                        <span>Settings</span>
                    </Link>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 text-sm text-neutral-500 hover:text-rose-400 transition-colors"
                >
                    <LogOut className="w-6 h-6" />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}
