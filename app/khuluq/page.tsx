'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface MateriKhuluq {
    ID: string;
    Kategori: string;
    Judul: string;
    Deskripsi: string;
    Jumlah: string;
    Rincian: string;
}

export default function KhuluqPage() {
    const [materis, setMateris] = useState<MateriKhuluq[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(-1);
    const [selectedKategori, setSelectedKategori] = useState<string | null>(null);

    useEffect(() => {
        let pct = 0;
        setLoadingProgress(0);

        // Simulate rapid loading progress
        const interval = setInterval(() => {
            pct += Math.floor(Math.random() * 15) + 5;
            if (pct >= 90) {
                pct = 90;
                clearInterval(interval);
            }
            setLoadingProgress(pct);
        }, 100);

        const fetchMateri = async () => {
            try {
                const gasUrl = process.env.NEXT_PUBLIC_GAS_URL || '';
                // Append ?sheet=MateriKhuluq to target the Khuluq sheet
                const url = gasUrl.includes('?')
                    ? `${gasUrl}&sheet=MateriKhuluq`
                    : `${gasUrl}?sheet=MateriKhuluq`;

                const res = await fetch(url);
                const { data } = await res.json();
                await new Promise(r => setTimeout(r, 600));

                setMateris(data || []);
            } catch (error) {
                console.error('Gagal mengambil data materi', error);
            } finally {
                clearInterval(interval);
                setLoadingProgress(100);
                setTimeout(() => setLoadingProgress(-1), 300); // Hide after brief 100%
            }
        };

        fetchMateri();

        return () => clearInterval(interval);
    }, []);

    const groupedMateri = materis.reduce((acc, curr) => {
        if (!acc[curr.Kategori]) acc[curr.Kategori] = [];
        acc[curr.Kategori].push(curr);
        return acc;
    }, {} as Record<string, MateriKhuluq[]>);

    const handleSelectKategori = (kategori: string) => {
        setSelectedKategori(kategori);
        // Save to local storage for the Dashboard Hero Card if desired
        localStorage.setItem('tajwid_last_module', kategori);
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white transition-colors duration-300 relative shadow-xl">
            {/* Header */}
            <div className="bg-[#D97706] dark:bg-qareeb-black dark:border-b dark:border-white/5 text-white px-6 pt-10 pb-6 rounded-b-3xl dark:rounded-none shadow-md sticky top-0 z-50 transition-colors duration-300 relative">
                <div className="flex items-center gap-4">
                    {selectedKategori ? (
                        <button onClick={() => setSelectedKategori(null)} className="flex items-center gap-2 hover:text-amber-200 dark:hover:text-qareeb-accent transition-colors">
                            <ArrowLeft size={24} className="text-amber-100 dark:text-white" />
                        </button>
                    ) : (
                        <Link href="/">
                            <ArrowLeft size={24} className="text-amber-100 hover:text-white dark:text-white dark:hover:text-qareeb-accent transition-colors" />
                        </Link>
                    )}
                    <h1 className="text-xl font-bold line-clamp-1 dark:text-white">
                        {selectedKategori ? selectedKategori : "Husnul Khuluq"}
                    </h1>
                </div>

                {/* Visual Header Bottom Border / Gradient for dark mode */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden dark:block"></div>
            </div>

            {/* Content */}
            <div className="px-6 mt-6 space-y-8">
                {loadingProgress >= 0 ? (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <span className="text-3xl font-bold text-amber-700 dark:text-qareeb-accent">{loadingProgress}%</span>
                        <p className="text-sm text-gray-500 dark:text-qareeb-muted font-medium">Memuat Materi...</p>
                        <div className="w-48 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-amber-600 dark:bg-qareeb-accent rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                ) : !selectedKategori ? (
                    /* Gallery View */
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pilih Bab Belajar</h2>
                            <p className="text-sm text-gray-500 dark:text-qareeb-muted">Mulai atau lanjutkan belajarmu tentang akhlak mulia (Husnul Khuluq) dari kategori di bawah ini.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {Object.keys(groupedMateri).map((kategori, index) => (
                                <button
                                    key={kategori}
                                    onClick={() => handleSelectKategori(kategori)}
                                    className="bg-white dark:bg-qareeb-card p-5 rounded-3xl dark:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-amber-300 dark:hover:border-qareeb-accent hover:shadow-md transition-all flex items-center justify-between group text-left w-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 dark:bg-white/5 rounded-bl-full -z-10 group-hover:bg-amber-100 dark:group-hover:bg-qareeb-accent/10 transition-colors"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-50 dark:bg-qareeb-gray rounded-2xl flex items-center justify-center text-amber-700 dark:text-qareeb-accent font-bold group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{kategori}</h3>
                                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-qareeb-muted">
                                                <BookOpen size={14} className="text-amber-500 dark:text-qareeb-accent" />
                                                {groupedMateri[kategori].length} Sub-bab
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-qareeb-gray flex items-center justify-center group-hover:bg-[#D97706] dark:group-hover:bg-qareeb-accent transition-colors">
                                        <ChevronRight size={18} className="text-gray-400 dark:text-qareeb-muted group-hover:text-white dark:group-hover:text-qareeb-black" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Detailed Category View */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-amber-100 dark:border-white/10 pb-2 mb-4">
                            <h2 className="text-sm font-bold text-amber-800 dark:text-white tracking-wider uppercase">
                                Daftar Materi
                            </h2>
                            <div className="text-xs font-bold bg-amber-50 dark:bg-white/5 text-amber-700 dark:text-white px-3 py-1 rounded-full border dark:border-white/10">
                                {groupedMateri[selectedKategori]?.length || 0} Item
                            </div>
                        </div>

                        <div className="space-y-4">
                            {groupedMateri[selectedKategori]?.map((item, index) => (
                                <div key={item.ID || `khuluq-${index}`} className="bg-white dark:bg-qareeb-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-50 dark:from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-qareeb-accent transition-colors">{item.Judul}</h3>
                                        <div className="bg-amber-100 dark:bg-qareeb-accent/10 text-amber-800 dark:text-qareeb-accent text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 border dark:border-qareeb-accent/20">
                                            <CheckCircle2 size={12} />
                                            {item.ID}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-qareeb-muted mb-4 leading-relaxed relative z-10 whitespace-pre-wrap">
                                        {item.Deskripsi}
                                    </p>

                                    {(item.Jumlah || item.Rincian) && (
                                        <div className="bg-amber-50 dark:bg-qareeb-gray rounded-xl p-4 space-y-4 relative z-10 border border-amber-100/50 dark:border-white/5">
                                            {item.Jumlah && (
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-amber-100 text-amber-800 dark:bg-qareeb-accent/20 dark:text-qareeb-accent px-2 py-1 rounded text-xs font-bold uppercase">{item.Jumlah}</span>
                                                </div>
                                            )}
                                            {item.Rincian && (
                                                <div className="border-t border-amber-100/60 dark:border-white/10 pt-3">
                                                    <div className="text-gray-800 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
                                                        {item.Rincian.split(', ').map((r) => r.trim()).map((rincianText, i) => (
                                                            <div key={i} className="mb-1">• {rincianText.replace(/^\d+\.\s*/, '')}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
