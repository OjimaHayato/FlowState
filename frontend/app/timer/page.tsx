"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import CategorySelect from "@/components/CategorySelect";
import { useRouter } from "next/navigation";
import { Play, Pause, RotateCcw, CheckCircle, Settings2, Music, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const THEMES = {
    midnight: {
        name: "Midnight",
        bg: "bg-neutral-950",
        text: "text-white",
        accent: "text-indigo-500",
        button: "bg-indigo-600 hover:bg-indigo-700",
        buttonActive: "bg-amber-600 hover:bg-amber-700",
        secondary: "border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800",
        progressTrack: "text-neutral-800",
        icon: "bg-neutral-800 text-neutral-500 hover:text-white"
    },
    sunrise: {
        name: "Sunrise",
        bg: "bg-stone-100",
        text: "text-stone-800",
        accent: "text-orange-500",
        button: "bg-orange-500 hover:bg-orange-600 text-white",
        buttonActive: "bg-red-500 hover:bg-red-600 text-white",
        secondary: "border-stone-300 text-stone-500 hover:text-stone-800 hover:bg-stone-200",
        progressTrack: "text-stone-200",
        icon: "bg-stone-200 text-stone-500 hover:text-stone-800"
    },
    forest: {
        name: "Forest",
        bg: "bg-emerald-950",
        text: "text-emerald-50",
        accent: "text-emerald-400",
        button: "bg-emerald-600 hover:bg-emerald-500 text-white",
        buttonActive: "bg-lime-600 hover:bg-lime-500 text-white",
        secondary: "border-emerald-800 text-emerald-400 hover:text-white hover:bg-emerald-800",
        progressTrack: "text-emerald-900",
        icon: "bg-emerald-900/50 text-emerald-400/50 hover:text-emerald-300"
    },
    nebula: {
        name: "Nebula",
        bg: "bg-indigo-950",
        text: "text-purple-100",
        accent: "text-fuchsia-400",
        button: "bg-fuchsia-600 hover:bg-fuchsia-500 text-white",
        buttonActive: "bg-cyan-600 hover:bg-cyan-500 text-white",
        secondary: "border-indigo-800 text-indigo-300 hover:text-white hover:bg-indigo-800",
        progressTrack: "text-indigo-900",
        icon: "bg-indigo-900 text-indigo-300 hover:text-white"
    },
    ocean: {
        name: "Ocean",
        bg: "bg-sky-950",
        text: "text-sky-100",
        accent: "text-sky-400",
        button: "bg-sky-600 hover:bg-sky-500 text-white",
        buttonActive: "bg-blue-600 hover:bg-blue-500 text-white",
        secondary: "border-sky-800 text-sky-300 hover:text-white hover:bg-sky-800",
        progressTrack: "text-sky-900",
        icon: "bg-sky-900 text-sky-300 hover:text-white"
    },
    rose: {
        name: "Rose",
        bg: "bg-rose-950",
        text: "text-rose-100",
        accent: "text-rose-400",
        button: "bg-rose-600 hover:bg-rose-500 text-white",
        buttonActive: "bg-pink-600 hover:bg-pink-500 text-white",
        secondary: "border-rose-800 text-rose-300 hover:text-white hover:bg-rose-800",
        progressTrack: "text-rose-900",
        icon: "bg-rose-900 text-rose-300 hover:text-white"
    },
    amber: {
        name: "Coffee",
        bg: "bg-amber-950",
        text: "text-amber-100",
        accent: "text-amber-400",
        button: "bg-amber-600 hover:bg-amber-500 text-white",
        buttonActive: "bg-orange-600 hover:bg-orange-500 text-white",
        secondary: "border-amber-800 text-amber-300 hover:text-white hover:bg-amber-800",
        progressTrack: "text-amber-900",
        icon: "bg-amber-900 text-amber-300 hover:text-white"
    },
    slate: {
        name: "Slate",
        bg: "bg-slate-950",
        text: "text-slate-200",
        accent: "text-white",
        button: "bg-slate-700 hover:bg-slate-600 text-white",
        buttonActive: "bg-slate-500 hover:bg-slate-400 text-white",
        secondary: "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800",
        progressTrack: "text-slate-800",
        icon: "bg-slate-800 text-slate-400 hover:text-white"
    }
};

type ThemeKey = keyof typeof THEMES;

import { FOCUS_TRACKS, BREAK_TRACKS } from "@/lib/constants";

export default function TimerPage() {
    const [duration, setDuration] = useState(DEFAULT_FOCUS_TIME);
    const [currentTheme, setCurrentTheme] = useState<ThemeKey>("midnight");
    const [timeLeft, setTimeLeft] = useState(DEFAULT_FOCUS_TIME);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");
    const [sessionCount, setSessionCount] = useState(0);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completionNote, setCompletionNote] = useState("");
    const [finishingStatus, setFinishingStatus] = useState<"COMPLETED" | "PARTIAL">("COMPLETED");

    // Music State
    const [isMusicEnabled, setIsMusicEnabled] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [playlist, setPlaylist] = useState<string[]>(FOCUS_TRACKS); // Default to Focus
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const router = useRouter();
    const startTimeRef = useRef<Date | null>(null);

    // Initial Auth and settings loading
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/login");

        // Load settings
        const storedFocus = localStorage.getItem("flowstate-focus-duration");
        if (storedFocus) {
            const focusSec = parseInt(storedFocus);
            setDuration(focusSec);
            setTimeLeft(focusSec);
        }

        const storedTheme = localStorage.getItem("flowstate-theme") as ThemeKey;
        if (storedTheme && THEMES[storedTheme]) {
            setCurrentTheme(storedTheme);
        }
    }, [router]);

    // Handle Playlist Switching & Shuffling based on Mode
    useEffect(() => {
        // Load disabled tracks
        const disabledJson = localStorage.getItem("flowstate-disabled-tracks");
        const disabledTracks: string[] = disabledJson ? JSON.parse(disabledJson) : [];

        // Filter valid tracks
        const allSourceTracks = mode === "focus" ? FOCUS_TRACKS : BREAK_TRACKS;
        const validTracks = allSourceTracks.filter(track => !disabledTracks.includes(track));

        // Use valid tracks or fallback to all if none valid (avoid empty playlist)
        const sourceTracks = validTracks.length > 0 ? validTracks : allSourceTracks;

        const shuffled = [...sourceTracks];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setPlaylist(shuffled);
        setCurrentTrackIndex(0);

        // Reset audio source if currently playing to allow next track pick up from new playlist
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    }, [mode]);

    const getBreakDuration = () => {
        const stored = localStorage.getItem("flowstate-break-duration");
        return stored ? parseInt(stored) : BREAK_TIME;
    };

    const getFocusDuration = () => {
        const stored = localStorage.getItem("flowstate-focus-duration");
        return stored ? parseInt(stored) : DEFAULT_FOCUS_TIME;
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(duration);
    };

    const handleFinish = async (early: boolean = false) => {
        setIsActive(false);

        if (mode === "focus") {
            const completedDuration = early
                ? Math.ceil((duration - timeLeft) / 60)
                : Math.ceil(duration / 60);

            // Don't save if less than 1 minute focused
            if (completedDuration > 0) {
                setFinishingStatus(early ? "PARTIAL" : "COMPLETED");
                setCompletionNote("");
                setShowCompletionModal(true);
                new Audio("/notification.mp3").play().catch(() => { });
            } else {
                // Too short, just switch to break or reset? 
                // If very short, just reset.
                resetTimer();
            }
        } else {
            // Break finished
            new Audio("/notification.mp3").play().catch(() => { });
            setMode("focus");
            const focusTime = getFocusDuration();
            setDuration(focusTime);
            setTimeLeft(focusTime);
            setIsActive(true);
            startTimeRef.current = new Date();
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer finished naturally
            handleFinish(false);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleCompleteSession = async () => {
        const completedDuration = finishingStatus === "PARTIAL"
            ? Math.ceil((duration - timeLeft) / 60)
            : Math.ceil(duration / 60);

        await saveSession(completedDuration, finishingStatus, completionNote);
        setShowCompletionModal(false);

        setMode("break");
        const breakTime = getBreakDuration();
        setDuration(breakTime);
        setTimeLeft(breakTime);
        setIsActive(true);
        startTimeRef.current = new Date();
    };

    const toggleTimer = () => {
        if (!isActive && mode === "focus" && timeLeft === duration) {
            startTimeRef.current = new Date();
        }
        setIsActive(!isActive);
    };

    const saveSession = async (minutes: number, status: string, note: string) => {
        try {
            await api.post("/sessions/", {
                duration_minutes: minutes,
                status: status,
                note: note || (status === "PARTIAL" ? "Finished early" : "Completed"),
                category_id: categoryId
            });
            setSessionCount((prev) => prev + 1);
        } catch (err) {
            console.error("Failed to save session", err);
        }
    };

    // Fix for earlyFinish usage in saveSession wrapper
    const earlyFinish = () => {
        if (confirm("Finish session early?")) {
            handleFinish(true);
        }
    };

    const toggleMusic = () => {
        setIsMusicEnabled((prev) => !prev);
    };

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.volume = 0.5;
        }

        const audio = audioRef.current;

        const handleEnded = () => {
            setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        };

        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Use the shuffled playlist
        const trackUrl = playlist[currentTrackIndex];

        // Only update source if it has changed to prevent reloading
        if (!audio.src.includes(trackUrl)) {
            audio.src = trackUrl;
        }

        if (isMusicEnabled && isActive) {
            audio.play().catch((e) => console.warn("Audio playback failed:", e));
        } else {
            audio.pause();
        }
    }, [isMusicEnabled, currentTrackIndex, isActive, playlist]);


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    const toggleTheme = () => {
        const keys = Object.keys(THEMES) as ThemeKey[];
        const currentIndex = keys.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % keys.length;
        const nextTheme = keys[nextIndex];
        setCurrentTheme(nextTheme);
        localStorage.setItem("flowstate-theme", nextTheme);
    };

    const theme = THEMES[currentTheme];

    return (
        <div className={cn("relative flex flex-col items-center min-h-screen transition-colors duration-500 pb-24 px-4 overflow-x-hidden", theme.bg, theme.text)}>
            {/* Top Bar for Settings */}
            <div className="w-full max-w-screen-md flex flex-wrap items-center justify-end gap-x-4 gap-y-2 py-4 md:py-8 z-10">
                <div className="flex items-center gap-2 w-full xs:w-auto justify-end">
                </div>

                <div className="flex items-center gap-3 w-full xs:w-auto justify-end">
                    <button
                        onClick={toggleTheme}
                        className={cn("p-3 rounded-full transition-all", theme.icon)}
                        title={`Theme: ${theme.name}`}
                    >
                        <Palette className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => router.push("/settings/timer")}
                        className={cn("p-3 rounded-full transition-all", theme.icon)}
                        title="Timer Settings"
                    >
                        <Settings2 className="w-5 h-5" />
                    </button>

                    {/* Music Toggle */}
                    {mode === "focus" && (
                        <button
                            onClick={toggleMusic}
                            className={cn(
                                "p-3 rounded-full transition-all",
                                isMusicEnabled
                                    ? theme.accent + " bg-white/10"
                                    : theme.icon
                            )}
                            title={isMusicEnabled ? "Mute Music" : "Play Music"}
                        >
                            <Music className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Timer Display Container */}
            {/* Timer Display Container */}
            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm mx-auto">
                <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center mb-8 md:mb-12">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                        <circle
                            cx="160"
                            cy="160"
                            r="150"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className={theme.progressTrack}
                        />
                        <circle
                            cx="160"
                            cy="160"
                            r="150"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 150}
                            strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
                            className={cn(
                                "transition-all duration-1000 ease-linear",
                                theme.accent
                            )}
                            style={{ strokeLinecap: "round" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-6xl font-mono font-bold tracking-wider">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="mt-2 text-xl font-medium opacity-60 capitalize">
                            {mode} Mode
                        </div>
                    </div>
                </div>

                {/* Category Select */}
                {mode === "focus" && !isActive && (
                    <div className="mb-8 z-20">
                        <CategorySelect selectedId={categoryId} onSelect={setCategoryId} />
                    </div>
                )}

                {/* Controls */}
                <div className="flex gap-6 items-center">
                    <Button
                        onClick={toggleTimer}
                        size="lg"
                        className={cn(
                            "rounded-full w-16 h-16 p-0 transition-all shadow-lg",
                            isActive ? theme.buttonActive : theme.button
                        )}
                    >
                        {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </Button>

                    {isActive ? (
                        <Button
                            onClick={earlyFinish}
                            size="lg"
                            className={cn("rounded-full w-16 h-16 p-0 border-2", theme.secondary)}
                            title="Finish Early"
                        >
                            <CheckCircle className="w-8 h-8" />
                        </Button>
                    ) : (
                        <Button
                            onClick={resetTimer}
                            size="lg"
                            variant="outline"
                            className={cn("rounded-full w-16 h-16 p-0 border-2", theme.secondary)}
                        >
                            <RotateCcw className="w-6 h-6" />
                        </Button>
                    )}
                </div>

                <div className="mt-12 text-center opacity-60">
                    Today&apos;s Focus Sessions: <span className="font-bold">{sessionCount}</span>
                </div>

                {/* Completion Modal */}
                {showCompletionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <div className="relative bg-neutral-900 border border-neutral-700 rounded-2xl p-8 w-full max-w-sm text-center space-y-6 shadow-2xl">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
                                <p className="text-neutral-400 text-sm">Great job staying focused. Add a note used for this session?</p>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Completed API endpoints..."
                                value={completionNote}
                                onChange={(e) => setCompletionNote(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCompleteSession()}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />

                            <div className="flex gap-3">
                                <button
                                    onClick={handleCompleteSession}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition-transform active:scale-95"
                                >
                                    Save Session
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
