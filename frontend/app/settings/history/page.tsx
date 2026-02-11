"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

type Session = {
    id: string;
    start_time: string;
    duration_minutes: number;
    status: string;
    note: string;
    category_id: number | null;
};

export default function HistoryPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Fetch limit 1000 for "all" history roughly
                const res = await api.get("/sessions/?limit=1000");
                setSessions(res.data);
            } catch (err) {
                console.error("Failed to fetch sessions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    // Helper to group by date
    const groupedSessions: { [key: string]: Session[] } = {};
    sessions.forEach(session => {
        const dateKey = format(parseISO(session.start_time), "yyyy-MM-dd");
        if (!groupedSessions[dateKey]) groupedSessions[dateKey] = [];
        groupedSessions[dateKey].push(session);
    });

    const sortedDates = Object.keys(groupedSessions).sort((a, b) => b.localeCompare(a));

    return (
        <div className="max-w-screen-md mx-auto p-6 pb-32">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
            </button>

            <h1 className="text-2xl font-bold text-white mb-8">Session History</h1>

            {loading ? (
                <div className="text-center text-neutral-500 mt-10">Loading history...</div>
            ) : (
                <div className="space-y-8">
                    {sortedDates.map(date => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-3 text-neutral-400 text-sm font-medium sticky top-0 bg-neutral-950 py-2 z-10">
                                <Calendar className="w-4 h-4" />
                                {format(parseISO(date), "MMMM d, yyyy")}
                            </div>
                            <div className="space-y-2">
                                {groupedSessions[date].map(session => (
                                    <div key={session.id} className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
                                        <div>
                                            <div className="text-white font-medium">
                                                {format(parseISO(session.start_time), "HH:mm")} - {session.duration_minutes} min
                                            </div>
                                            {session.note && (
                                                <div className="text-sm text-neutral-500 mt-1">
                                                    {session.note}
                                                </div>
                                            )}
                                        </div>
                                        <div className={
                                            `px-3 py-1 rounded-full text-xs font-medium border
                                            ${session.status === "COMPLETED"
                                                ? "bg-emerald-900/30 text-emerald-400 border-emerald-800"
                                                : "bg-amber-900/30 text-amber-400 border-amber-800"}`
                                        }>
                                            {session.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {sortedDates.length === 0 && (
                        <div className="text-center text-neutral-500 py-10">
                            No sessions recorded yet.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
