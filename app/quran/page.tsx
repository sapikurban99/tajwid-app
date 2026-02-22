'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowLeft, Loader2, BookMarked, PlayCircle } from 'lucide-react';
import Link from 'next/link';

// Interface untuk data dari EQuran API
interface Surah {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
    tempatTurun: string;
    arti: string;
}

export default function QuranPage() {
    const [surahs, setSurahs] = useState<Surah[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(-1);
    const [search, setSearch] = useState('');
    const [bookmark, setBookmark] = useState<{ surah: number, ayat: number, namaSurah: string } | null>(null);

    useEffect(() => {
        // Load Bookmark
        const savedBookmark = localStorage.getItem('tajwid_quran_bookmark');
        if (savedBookmark) {
            try {
                setBookmark(JSON.parse(savedBookmark));
            } catch (e) {
                console.error("Failed parsing bookmark", e);
            }
        }

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
        const fetchSurahs = async () => {
            try {
                // Menggunakan public API EQuran (Data Kemenag)
                const res = await fetch('https://equran.id/api/v2/surat');
                const { data } = await res.json();
                await new Promise(r => setTimeout(r, 600));

                setSurahs(data);
            } catch (error) {
                console.error('Gagal mengambil data Al-Quran', error);
            } finally {
                clearInterval(interval);
                setLoadingProgress(100);
                setTimeout(() => setLoadingProgress(-1), 300);
            }
        };

        fetchSurahs();
        return () => clearInterval(interval);
    }, []);

    const filteredSurahs = surahs.filter((surah) =>
        surah.namaLatin.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white transition-colors duration-300 relative shadow-xl">
            {/* Header */}
            <div className="bg-[#312e81] dark:bg-qareeb-black dark:border-b dark:border-white/5 text-white px-6 pt-10 pb-6 rounded-b-3xl dark:rounded-none shadow-md sticky top-0 z-50 transition-colors duration-300 relative">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/">
                        <ArrowLeft size={24} className="text-indigo-100 dark:text-white hover:text-white dark:hover:text-qareeb-accent transition-colors" />
                    </Link>
                    <h1 className="text-xl font-bold dark:text-white">Al-Qur&apos;an</h1>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search size={20} className="absolute left-4 top-3 text-indigo-700 dark:text-qareeb-muted" />
                    <input
                        type="text"
                        placeholder="Cari surah (misal: Yasin)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white dark:bg-qareeb-card dark:text-white dark:border dark:border-white/10 dark:placeholder-qareeb-muted text-gray-900 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-qareeb-accent transition-colors"
                    />
                </div>

                {/* Visual Header Bottom Border / Gradient for dark mode */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden dark:block"></div>
            </div>

            {/* Content List */}
            <div className="px-6 mt-6 space-y-4">
                {/* Bookmark Section */}
                {bookmark && !search && (
                    <div className="bg-gradient-to-r from-[#312e81] to-indigo-700 dark:from-qareeb-card dark:to-qareeb-card dark:card-gradient rounded-3xl p-5 text-white shadow-md relative overflow-hidden mb-6">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400 dark:bg-qareeb-accent rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-50 dark:opacity-10"></div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium dark:border dark:border-white/10">
                                <BookMarked size={14} className="dark:text-qareeb-accent" />
                                <span className="dark:text-white/90">Terakhir Dibaca</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between relative z-10">
                            <div>
                                <h3 className="text-xl font-bold">{bookmark.namaSurah}</h3>
                                <p className="text-indigo-100 dark:text-qareeb-muted text-sm mt-1">Ayat {bookmark.ayat}</p>
                            </div>
                            <Link href={`/quran/${bookmark.surah}?ayat=${bookmark.ayat}`}>
                                <button className="bg-sky-400 dark:bg-qareeb-accent text-indigo-900 dark:text-black w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-sky-500 transition-colors shadow-inner dark:accent-glow">
                                    <PlayCircle size={24} />
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Surah List */}
                <div className="px-6 mt-6 space-y-4">
                    {loadingProgress >= 0 ? (
                        <div className="flex flex-col justify-center items-center py-20 space-y-4">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-700 dark:text-qareeb-accent absolute" size={40} />
                                <span className="text-xs font-bold dark:text-white">{loadingProgress}%</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-qareeb-muted font-medium animate-pulse">Memuat Al-Qur'an...</p>
                        </div>
                    ) : (
                        filteredSurahs.map((surah) => (
                            <Link href={`/quran/${surah.nomor}`} key={surah.nomor} className="block">
                                <div className="bg-white dark:bg-qareeb-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-4 hover:border-indigo-300 dark:hover:border-qareeb-accent transition-colors cursor-pointer group mb-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-qareeb-gray rounded-xl flex items-center justify-center text-indigo-700 dark:text-qareeb-accent font-bold relative group-hover:bg-indigo-100 dark:group-hover:bg-qareeb-accent/10 transition-colors">
                                        <BookOpen size={24} className="opacity-20 absolute" />
                                        <span>{surah.nomor}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-800 dark:group-hover:text-qareeb-accent transition-colors">{surah.namaLatin}</h3>
                                        <p className="text-xs text-gray-500 dark:text-qareeb-muted uppercase tracking-wide">
                                            {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-arabic font-bold text-[#312e81] dark:text-qareeb-accent">{surah.nama}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-qareeb-muted/60">{surah.arti}</p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}