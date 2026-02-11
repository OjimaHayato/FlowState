"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { ActivityCalendar } from "react-activity-calendar";
import { format, parseISO } from "date-fns";
import CategorySelect from "@/components/CategorySelect";
import { Settings2, X } from "lucide-react";

type DashboardData = {
    daily_stats: {
        total_focus_minutes: number;
        session_count: number;
    };
    weekly_stats: {
        date: string; // YYYY-MM-DD
        minutes: number;
    }[];
    heatmap_data: {
        date: string;
        count: number;
        level: number;
    }[];
    category_distribution: {
        name: string;
        value: number;
        color: string;
    }[];
    recent_sessions: {
        id: string;
        start_time: string;
        duration_minutes: number;
        status: string;
        note: string;
        category_id: number | null;
    }[];
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const params = selectedCategoryId ? { category_id: selectedCategoryId } : {};
                const res = await api.get("/analytics/dashboard", { params });
                setData(res.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };
        fetchData();
    }, [router, selectedCategoryId]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<DashboardData["recent_sessions"][0] | null>(null);
    const [editNote, setEditNote] = useState("");
    const [editDuration, setEditDuration] = useState(0);
    const [editCategoryId, setEditCategoryId] = useState<number | null>(null);

    const handleEditClick = (session: DashboardData["recent_sessions"][0]) => {
        setEditingSession(session);
        setEditNote(session.note || "");
        setEditDuration(session.duration_minutes);
        setEditCategoryId(session.category_id || null);
        setIsEditModalOpen(true);
    };

    const handleUpdateSession = async () => {
        if (!editingSession) return;
        try {
            await api.put(`/sessions/${editingSession.id}`, {
                note: editNote,
                duration_minutes: editDuration,
                category_id: editCategoryId
            });
            // Refresh data
            const res = await api.get("/analytics/dashboard", {
                params: selectedCategoryId ? { category_id: selectedCategoryId } : {}
            });
            setData(res.data);
            setIsEditModalOpen(false);
            setEditingSession(null);
        } catch (err) {
            console.error("Failed to update session", err);
            alert("Failed to update session");
        }
    };

    if (!data) return <div className="text-center mt-20">Loading stats...</div>;

    return (
        <div className="max-w-screen-md mx-auto p-6 space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="w-full md:w-auto">
                    <CategorySelect
                        selectedId={selectedCategoryId}
                        onSelect={setSelectedCategoryId}
                        showAllOption={true}
                        placeholder="Filter by Category"
                        disableCreate={true}
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <div className="text-neutral-500 text-sm">Today's Focus</div>
                    <div className="text-4xl font-bold mt-2 text-indigo-600">
                        {data.daily_stats.total_focus_minutes} <span className="text-lg text-neutral-400">min</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <div className="text-neutral-500 text-sm">Sessions Completed</div>
                    <div className="text-4xl font-bold mt-2 text-emerald-600">
                        {data.daily_stats.session_count}
                    </div>
                </div>
            </div>

            {/* Heatmap (Contributions) */}
            <div className="bg-white p-6 rounded-xl border border-neutral-200 overflow-x-auto">
                <h2 className="text-lg font-bold mb-6 text-neutral-800">Focus Activity</h2>
                <div className="flex justify-center text-neutral-800">
                    <ActivityCalendar
                        data={data.heatmap_data.length > 0 ? data.heatmap_data : [{ date: new Date().toISOString().split('T')[0], count: 0, level: 0 }]}
                        theme={{
                            light: ['#e5e5e5', '#4f46e5'],
                            dark: ['#e5e5e5', '#4f46e5'], // Force light theme colors even in dark mode wrapper
                        }}
                        labels={{
                            legend: {
                                less: 'Less',
                                more: 'More',
                            },
                        }}
                        showWeekdayLabels
                        colorScheme="light"
                        blockSize={16}
                        blockMargin={4}
                        fontSize={14}
                    />
                </div>
            </div>

            {/* Distribution & Weekly Chart Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Category Distribution */}
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <h2 className="text-lg font-bold mb-4 text-neutral-800">Focus Distribution</h2>
                    <div className="h-64 w-full">
                        {data.category_distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.category_distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.category_distribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", color: "#171717" }}
                                        itemStyle={{ color: "#171717" }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "#171717" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-neutral-400 text-sm">
                                No category data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="bg-white p-6 rounded-xl border border-neutral-200">
                    <h2 className="text-lg font-bold mb-4 text-neutral-800">Weekly Trend</h2>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.weekly_stats}>
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(parseISO(date), "MM/dd")}
                                    stroke="#737373"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#737373"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", color: "#171717" }}
                                    itemStyle={{ color: "#171717" }}
                                    cursor={{ fill: "#f5f5f5" }}
                                />
                                <Bar dataKey="minutes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Sessions */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-white">Recent Sessions</h2>
                <div className="space-y-3">
                    {data.recent_sessions.map((session) => (
                        <div key={session.id} className="flex justify-between items-center bg-white p-4 rounded-lg border border-neutral-200 group">
                            <div>
                                <div className="font-medium text-neutral-900">{format(parseISO(session.start_time), "HH:mm")} - {session.duration_minutes} min</div>
                                <div className="text-sm text-neutral-500">{session.note || "No note"}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                                    {session.status}
                                </div>
                                <button
                                    onClick={() => handleEditClick(session)}
                                    className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors"
                                    title="Edit Session"
                                >
                                    <Settings2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {data.recent_sessions.length === 0 && (
                        <div className="text-neutral-500 text-center py-4">No sessions yet.</div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsEditModalOpen(false)}
                    />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-sm space-y-4 shadow-xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-white">Edit Session</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-neutral-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-neutral-400">Note</label>
                                <input
                                    type="text"
                                    value={editNote}
                                    onChange={(e) => setEditNote(e.target.value)}
                                    className="w-full bg-neutral-800 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                    placeholder="Add a note..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-neutral-400">Duration (min)</label>
                                <input
                                    type="number"
                                    value={editDuration}
                                    onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                                    className="w-full bg-neutral-800 border-none rounded-lg px-3 py-2 text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-neutral-400">Category</label>
                                <CategorySelect
                                    selectedId={editCategoryId}
                                    onSelect={setEditCategoryId}
                                    placeholder="Select Category"
                                />
                            </div>

                            <button
                                onClick={handleUpdateSession}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-lg transition-colors mt-2"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
