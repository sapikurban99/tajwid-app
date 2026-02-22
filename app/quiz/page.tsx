'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CheckSquare, Play, Award, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function QuizDashboard() {
    const [highScore, setHighScore] = useState<number | null>(null);
    const [history, setHistory] = useState<{ score: number, date: string, total: number }[]>([]);

    useEffect(() => {
        const score = localStorage.getItem('quiz_high_score');
        const historyData = localStorage.getItem('quiz_history');
        if (score) {
            setHighScore(parseInt(score));
        }
        if (historyData) {
            try {
                setHistory(JSON.parse(historyData));
            } catch (e) {
                console.error("Failed parsing quiz history", e);
            }
        }
    }, []);
    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white transition-colors duration-300 relative shadow-xl">
            {/* Header */}
            <div className="bg-[#312e81] dark:bg-qareeb-black dark:border-b dark:border-white/5 text-white px-6 pt-10 pb-6 rounded-b-3xl dark:rounded-none shadow-md sticky top-0 z-50 transition-colors duration-300 relative overflow-hidden">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 dark:bg-qareeb-accent rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-10 translate-x-10 -translate-y-10"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-all cursor-pointer">
                            <ArrowLeft size={20} className="text-white dark:text-white group-hover:text-qareeb-accent" />
                        </div>
                    </Link>
                    <h1 className="text-xl font-bold dark:text-white">Latihan Tajwid</h1>
                </div>

                {/* Visual Header Bottom Border / Gradient for dark mode */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden dark:block"></div>
            </div>

            {/* Content */}
            <div className="px-6 mt-8 space-y-6">

                {/* Hero Illustration Space */}
                <div className="flex justify-center mb-10">
                    <div className="w-40 h-40 bg-indigo-100 dark:bg-qareeb-card rounded-full flex items-center justify-center relative shadow-inner border dark:border-white/5">
                        <div className="absolute inset-0 border-[8px] border-white dark:border-qareeb-black rounded-full transition-colors duration-300"></div>
                        <BrainCircuit size={80} className="text-indigo-600 dark:text-qareeb-accent drop-shadow-sm" />

                        {/* Floating elements */}
                        <div className="absolute -top-2 -right-2 bg-yellow-400 dark:bg-qareeb-accent w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                            <CheckSquare size={24} className="text-white dark:text-qareeb-black" />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Uji Pemahamanmu</h2>
                    <p className="text-gray-500 dark:text-qareeb-muted text-sm leading-relaxed px-4 transition-colors duration-300">
                        Tantang dirimu dengan menebak hukum tajwid dari berbagai potongan ayat secara acak.
                    </p>
                </div>

                {/* Features list */}
                <div className="bg-white dark:bg-qareeb-card rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5 space-y-4 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-50 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 text-sky-600 dark:text-qareeb-accent border dark:border-white/5">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm">Pilihan Ganda</h3>
                            <p className="text-xs text-gray-500 dark:text-qareeb-muted">Pilih satu jawaban yang paling tepat</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-500 dark:text-orange-400 relative border dark:border-white/5">
                            <Award size={24} />
                            {highScore !== null && highScore > 0 && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 dark:bg-qareeb-accent rounded-full text-white dark:text-qareeb-black text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-qareeb-card shadow-sm">
                                    {highScore}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white text-sm">Target Skor</h3>
                                <p className="text-xs text-gray-500 dark:text-qareeb-muted">Dapatkan evaluasi di akhir sesi</p>
                            </div>
                            {highScore !== null && (
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-qareeb-accent uppercase">Rekor Terbaik</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{highScore}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Riwayat Latihan (History) */}
                {history.length > 0 && (
                    <div className="mt-8 space-y-3">
                        <h3 className="font-bold text-gray-900 dark:text-white px-2">Riwayat Latihan</h3>
                        <div className="bg-white dark:bg-qareeb-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 transition-colors duration-300">
                            {history.slice(0, 3).map((h, i) => (
                                <div key={i} className={`flex justify-between items-center py-3 ${i !== Math.min(history.length, 3) - 1 ? 'border-b border-gray-100 dark:border-white/5' : ''}`}>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">Skor: {h.score}/{h.total}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-qareeb-muted">{h.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${h.score === h.total ? 'bg-sky-50 dark:bg-qareeb-accent/10 text-sky-700 dark:text-qareeb-accent border-sky-200 dark:border-qareeb-accent/30' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'}`}>
                                            {Math.round((h.score / h.total) * 100)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start Action */}
                <div className="pt-6">
                    <Link href="/quiz/session">
                        <button className="w-full bg-[#312e81] dark:bg-qareeb-accent text-white dark:text-qareeb-black rounded-2xl py-4 font-bold text-lg shadow-lg flex items-center justify-center gap-3 hover:bg-indigo-900 dark:hover:bg-indigo-400 transition-colors group relative overflow-hidden dark:accent-glow">
                            <span className="relative z-10 flex items-center gap-2">
                                <Play size={20} className="fill-white dark:fill-qareeb-black" />
                                Mulai Latihan Sekarang
                            </span>
                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl"></div>
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
}
