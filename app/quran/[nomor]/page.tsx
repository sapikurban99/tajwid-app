'use client';

import { useState, useEffect, use } from 'react';
import { ArrowLeft, Loader2, PlayCircle, BookOpen, AlignJustify, BookMarked, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface Ayat {
    nomorAyat: number;
    teksArab: string;
    teksLatin: string;
    teksIndonesia: string;
}

interface SurahDetail {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
    deskripsi: string;
    ayat: Ayat[];
}

export default function SurahPage({ params }: { params: Promise<{ nomor: string }> }) {
    const { nomor } = use(params);
    const [surah, setSurah] = useState<SurahDetail | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(-1);
    const [isMushafMode, setIsMushafMode] = useState(false);
    const [bookmarkedStr, setBookmarkedStr] = useState<string | null>(null);

    useEffect(() => {
        // Load initial bookmark state
        setBookmarkedStr(localStorage.getItem('tajwid_quran_bookmark'));

        let pct = 0;
        setLoadingProgress(0);
        const interval = setInterval(() => {
            pct += Math.floor(Math.random() * 15) + 5;
            if (pct >= 90) {
                pct = 90;
                clearInterval(interval);
            }
            setLoadingProgress(pct);
        }, 100);

        const fetchSurahDetail = async () => {
            try {
                const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
                const { data } = await res.json();
                await new Promise(r => setTimeout(r, 600));

                setSurah(data);
            } catch (error) {
                console.error('Gagal mengambil data detail Surah', error);
            } finally {
                clearInterval(interval);
                setLoadingProgress(100);
                setTimeout(() => setLoadingProgress(-1), 300);
            }
        };

        if (nomor) {
            fetchSurahDetail();
        }

        return () => clearInterval(interval);
    }, [nomor]);

    const handleBookmark = (ayatNomor: number) => {
        if (!surah) return;
        const bmk = { surah: surah.nomor, ayat: ayatNomor, namaSurah: surah.namaLatin };
        const bmkStr = JSON.stringify(bmk);
        localStorage.setItem('tajwid_quran_bookmark', bmkStr);
        setBookmarkedStr(bmkStr);
    };

    if (loadingProgress >= 0) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                    <Loader2 className="animate-spin text-indigo-700 dark:text-qareeb-accent absolute" size={48} />
                    <span className="text-sm font-bold dark:text-white">{loadingProgress}%</span>
                </div>
                <p className="text-gray-500 dark:text-qareeb-muted font-medium animate-pulse">Memuat Surah...</p>
            </div>
        );
    }

    if (!surah) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black flex flex-col justify-center items-center p-6 text-center">
                <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Surah Tidak Ditemukan</h2>
                <p className="text-gray-500 dark:text-qareeb-muted mb-6">Mungkin terjadi kesalahan jaringan.</p>
                <Link href="/quran">
                    <button className="bg-indigo-700 dark:bg-qareeb-card dark:border dark:border-white/10 text-white px-6 py-2 rounded-full font-medium dark:hover:border-qareeb-accent transition-colors">Kembali</button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white transition-colors duration-300 relative shadow-xl">
            {/* Header Sticky */}
            <div className="bg-[#312e81] dark:bg-qareeb-black dark:border-b dark:border-white/5 text-white px-6 pt-10 pb-6 rounded-b-3xl dark:rounded-none shadow-md sticky top-0 z-50 transition-colors duration-300 relative">
                <div className="flex items-center gap-4">
                    <Link href="/quran">
                        <ArrowLeft size={24} className="text-indigo-100 dark:text-white hover:text-white dark:hover:text-qareeb-accent transition-colors" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold dark:text-white">{surah.namaLatin}</h1>
                        <p className="text-xs text-indigo-200 dark:text-qareeb-muted">{surah.arti} • {surah.jumlahAyat} Ayat</p>
                    </div>
                </div>
                {/* Visual Header Bottom Border / Gradient for dark mode */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden dark:block"></div>
            </div>

            <div className="px-6 mt-6 space-y-6">
                {/* Hero Card Surah */}
                <div className="bg-gradient-to-br from-indigo-500 to-[#312e81] dark:from-qareeb-card dark:to-qareeb-card dark:card-gradient rounded-[2rem] p-8 text-center text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400 dark:bg-qareeb-accent rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-50 dark:opacity-10 translate-x-10 -translate-y-10"></div>

                    <h2 className="text-5xl font-arabic font-bold mb-4 drop-shadow-md relative z-10 dark:text-qareeb-accent">{surah.nama}</h2>
                    <p className="text-sm text-indigo-100 dark:text-qareeb-muted uppercase tracking-widest font-semibold mb-6 relative z-10">
                        {surah.tempatTurun}
                    </p>

                    <hr className="border-indigo-400/30 dark:border-white/10 mb-6 w-1/2 mx-auto relative z-10" />
                    <p className="text-3xl font-arabic font-bold leading-loose tracking-wider relative z-10 dark:text-white">
                        بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="bg-white dark:bg-qareeb-card p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex gap-2 transition-colors duration-300">
                    <button
                        onClick={() => setIsMushafMode(false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${!isMushafMode ? 'bg-indigo-50 text-indigo-700 dark:bg-white/10 dark:text-white' : 'text-gray-400 dark:text-qareeb-muted hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <AlignJustify size={18} />
                        Per Ayat
                    </button>
                    <button
                        onClick={() => setIsMushafMode(true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${isMushafMode ? 'bg-indigo-50 text-indigo-700 dark:bg-white/10 dark:text-white' : 'text-gray-400 dark:text-qareeb-muted hover:bg-gray-50 dark:hover:bg-white/5'}`}
                    >
                        <BookOpen size={18} />
                        Mushaf
                    </button>
                </div>

                {/* Ayat List */}
                {isMushafMode ? (
                    <div className="bg-white dark:bg-qareeb-card p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 transition-colors duration-300">
                        <p className="text-3xl font-arabic leading-[4.5rem] text-right text-gray-900 dark:text-white" dir="rtl">
                            {surah.ayat.map((a) => (
                                <span key={a.nomorAyat}>
                                    {a.teksArab}
                                    <span className="inline-flex items-center justify-center w-10 h-10 mx-2 text-sm text-indigo-700 dark:text-qareeb-accent bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 rounded-full font-sans translate-y-2">
                                        {a.nomorAyat}
                                    </span>
                                </span>
                            ))}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {surah.ayat.map((a) => {
                            const isBookmarked = bookmarkedStr ? JSON.parse(bookmarkedStr).surah === surah.nomor && JSON.parse(bookmarkedStr).ayat === a.nomorAyat : false;
                            return (
                                <div key={a.nomorAyat} className={`bg-white dark:bg-qareeb-card p-6 rounded-3xl shadow-sm border ${isBookmarked ? 'border-sky-400 dark:border-qareeb-accent shadow-sky-100 dark:shadow-qareeb-accent/20' : 'border-gray-100 dark:border-white/5'} transition-all duration-300`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="w-10 h-10 bg-indigo-50 dark:bg-qareeb-gray rounded-full flex items-center justify-center text-indigo-700 dark:text-qareeb-accent font-bold text-sm">
                                            {a.nomorAyat}
                                        </div>
                                        <div className="flex gap-4 text-indigo-500 dark:text-qareeb-muted">
                                            <button
                                                onClick={() => handleBookmark(a.nomorAyat)}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${isBookmarked ? 'bg-sky-100 dark:bg-qareeb-accent/20 text-sky-700 dark:text-qareeb-accent' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}
                                            >
                                                {isBookmarked ? <CheckCircle2 size={16} /> : <BookMarked size={16} />}
                                                {isBookmarked ? 'Ditandai' : 'Tandai'}
                                            </button>
                                            <button className="hover:text-indigo-700 dark:hover:text-white transition-colors">
                                                <PlayCircle size={24} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-3xl font-arabic font-bold text-right text-gray-900 dark:text-white leading-[3rem] mb-6" dir="rtl">
                                        {a.teksArab}
                                    </p>

                                    <div className="space-y-2">
                                        <p className="text-sm text-indigo-800 dark:text-qareeb-accent/90 font-medium leading-relaxed">
                                            {a.teksLatin}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-qareeb-muted leading-relaxed">
                                            {a.teksIndonesia}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
