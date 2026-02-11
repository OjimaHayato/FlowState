"use client";

import Link from "next/link";
import { ChevronRight, Clock, FolderClock, Shield, User } from "lucide-react";

const SETTINGS_MENU = [
    {
        title: "Timer Settings",
        href: "/settings/timer",
        icon: <Clock className="w-5 h-5 text-indigo-400" />,
        description: "Configure focus and break durations"
    },
    {
        title: "Session History",
        href: "/settings/history",
        icon: <FolderClock className="w-5 h-5 text-emerald-400" />,
        description: "View your past focus sessions"
    },
    {
        title: "Credits",
        href: "/settings/credits",
        icon: <User className="w-5 h-5 text-amber-400" />,
        description: "App attribution and resources"
    },
    {
        title: "Privacy Policy",
        href: "/settings/privacy",
        icon: <Shield className="w-5 h-5 text-rose-400" />,
        description: "Data handling and security"
    }
];

export default function SettingsPage() {
    return (
        <div className="max-w-screen-md mx-auto p-6 pb-32">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <div className="grid gap-4">
                {SETTINGS_MENU.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:border-neutral-700 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-neutral-950 rounded-lg group-hover:scale-110 transition-transform">
                                {item.icon}
                            </div>
                            <div>
                                <h2 className="font-semibold text-white">{item.title}</h2>
                                <p className="text-sm text-neutral-500">{item.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}
