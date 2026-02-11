"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function CreditsPage() {
    const router = useRouter();

    return (
        <div className="max-w-screen-md mx-auto p-6 pb-32">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
            </button>


            <h1 className="text-2xl font-bold text-white mb-8">Developer info</h1>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Name</h2>
                    <div className="text-neutral-400 space-y-2">
                        <p>小島 颯斗 (Hayato Ojima)</p>
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Mail</h2>
                    <div className="text-neutral-400 space-y-2">
                        <p>ojimahayato140409@gmail.com</p>
                    </div>
                </div>
            </div>

            <h1 className="text-2xl font-bold text-white mt-12 mb-8">Credits</h1>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Sound & Music</h2>
                    <div className="text-neutral-400 space-y-2">
                        <p>BGM by RYU ITO (<a href="https://ryu110.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://ryu110.com</a>)</p>
                        <p>Music: RYU ITO MUSIC</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                    <h2 className="text-lg font-semibold text-white mb-2">Icons</h2>
                    <p className="text-neutral-400">
                        Icons provided by <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Lucide React</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
