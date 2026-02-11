"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
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

            <h1 className="text-2xl font-bold text-white mb-8">Privacy Policy</h1>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                <p className="text-neutral-300 leading-relaxed">
                    本アプリ「Flowstate」は、個人の集中力を記録・可視化するためのポートフォリオアプリケーションです。
                </p>
                <p className="text-neutral-300 leading-relaxed">
                    本アプリで入力されたデータ（タイマー設定、セッション履歴、カテゴリ情報など）は、
                    認証トークンや一時的な設定を除き、ブラウザのローカルストレージやデモンストレーション用のバックエンドデータベースに保存されます。
                </p>
                <p className="text-neutral-300 leading-relaxed">
                    収集したデータを第三者へ提供したり、商用利用したりすることはありません。
                </p>
                <div className="pt-4 mt-4 border-t border-neutral-800">
                    <p className="text-sm text-neutral-500">Last updated: 2026-02-10</p>
                </div>
            </div>
        </div>
    );
}
