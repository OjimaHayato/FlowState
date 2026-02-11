"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Play, Pause, Music } from "lucide-react";
import { FOCUS_TRACKS, BREAK_TRACKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function TimerSettingsPage() {
    const router = useRouter();
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [isSaved, setIsSaved] = useState(false);

    // Track Management
    const [disabledTracks, setDisabledTracks] = useState<string[]>([]);
    const [playingTrack, setPlayingTrack] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Load settings from localStorage
        const storedFocus = localStorage.getItem("flowstate-focus-duration");
        const storedBreak = localStorage.getItem("flowstate-break-duration");
        const storedDisabled = localStorage.getItem("flowstate-disabled-tracks");

        if (storedFocus) setFocusDuration(parseInt(storedFocus) / 60);
        if (storedBreak) setBreakDuration(parseInt(storedBreak) / 60);
        if (storedDisabled) setDisabledTracks(JSON.parse(storedDisabled));

        // Init audio
        audioRef.current = new Audio();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleTrack = (track: string) => {
        setDisabledTracks(prev =>
            prev.includes(track)
                ? prev.filter(t => t !== track)
                : [...prev, track]
        );
    };

    const togglePreview = (track: string) => {
        if (!audioRef.current) return;

        if (playingTrack === track) {
            audioRef.current.pause();
            setPlayingTrack(null);
        } else {
            audioRef.current.src = track;
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch(e => console.error("Preview failed", e));
            setPlayingTrack(track);

            audioRef.current.onended = () => setPlayingTrack(null);
        }
    };

    const isTrackEnabled = (track: string) => !disabledTracks.includes(track);

    const getTrackName = (path: string) => {
        return path.split("/").pop()?.replace(".mp3", "") || "Unknown Track";
    };

    const handleSave = () => {
        localStorage.setItem("flowstate-focus-duration", (focusDuration * 60).toString());
        localStorage.setItem("flowstate-break-duration", (breakDuration * 60).toString());
        localStorage.setItem("flowstate-disabled-tracks", JSON.stringify(disabledTracks));

        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-screen-md mx-auto p-6 pb-32">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
            </button>

            <h1 className="text-2xl font-bold text-white mb-8">Timer Settings</h1>

            <div className="space-y-8">
                {/* Focus Duration */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-lg font-medium text-white">Focus Duration</label>
                        <span className="text-indigo-400 font-mono">{focusDuration} min</span>
                    </div>
                    <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={focusDuration}
                        onChange={(e) => setFocusDuration(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-600 px-1 mt-2">
                        <span>5 min</span>
                        <span>120 min</span>
                    </div>
                </div>

                {/* Break Duration */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-lg font-medium text-white">Break Duration</label>
                        <span className="text-emerald-400 font-mono">{breakDuration} min</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-neutral-600 px-1 mt-2">
                        <span>1 min</span>
                        <span>30 min</span>
                    </div>
                </div>

                {/* Music Selection */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-indigo-400" />
                        Music Selection
                    </h2>

                    {/* Focus Music List */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h3 className="text-md font-medium text-indigo-300 mb-4">Focus Mode Playlist</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {FOCUS_TRACKS.map((track) => (
                                <div key={track} className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    isTrackEnabled(track)
                                        ? "bg-neutral-800/50 border-neutral-700"
                                        : "bg-neutral-900 border-neutral-800 opacity-60"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isTrackEnabled(track)}
                                            onChange={() => toggleTrack(track)}
                                            className="w-4 h-4 rounded border-neutral-600 text-indigo-600 focus:ring-indigo-500 bg-neutral-700"
                                        />
                                        <span className="text-sm font-medium text-neutral-300">
                                            {getTrackName(track)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => togglePreview(track)}
                                        className="text-neutral-400 hover:text-white transition-colors"
                                        title={playingTrack === track ? "Stop Preview" : "Play Preview"}
                                    >
                                        {playingTrack === track ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Break Music List */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h3 className="text-md font-medium text-emerald-300 mb-4">Break Mode Playlist</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {BREAK_TRACKS.map((track) => (
                                <div key={track} className={cn(
                                    "flex items-center justify-between p-3 rounded-lg border transition-all",
                                    isTrackEnabled(track)
                                        ? "bg-neutral-800/50 border-neutral-700"
                                        : "bg-neutral-900 border-neutral-800 opacity-60"
                                )}>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isTrackEnabled(track)}
                                            onChange={() => toggleTrack(track)}
                                            className="w-4 h-4 rounded border-neutral-600 text-emerald-600 focus:ring-emerald-500 bg-neutral-700"
                                        />
                                        <span className="text-sm font-medium text-neutral-300">
                                            {getTrackName(track)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => togglePreview(track)}
                                        className="text-neutral-400 hover:text-white transition-colors"
                                        title={playingTrack === track ? "Stop Preview" : "Play Preview"}
                                    >
                                        {playingTrack === track ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
                >
                    {isSaved ? <span className="text-emerald-300">Saved!</span> : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
