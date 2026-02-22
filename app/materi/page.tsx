'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Volume2, PauseCircle, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface MateriTajwid {
    id: string;
    kategori: string;
    judul: string;
    deskripsi: string;
    huruf: string;
    contoh: string;
}

export default function MateriPage() {
    const [materis, setMateris] = useState<MateriTajwid[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(-1);
    const [selectedKategori, setSelectedKategori] = useState<string | null>(null);

    // Audio Playback states for Tajwid Materis
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);

    // Hardcoded dictionary to map "Contoh Bacaan" strings to Surah:Ayat on EQuran.id
    // Keys match the strings from the user's spreadsheet list
    const audioMap: Record<string, { surah: number, ayat: number }> = {
        "مِنْ خَوْفٍ": { surah: 106, ayat: 4 },
        "مِنْ مَسَدٍ ⭢ مِمَّسَدٍ": { surah: 111, ayat: 5 },
        "مِنْ لَدُنْكَ ⭢ مِلَّدُنْكَ": { surah: 4, ayat: 75 },
        "مِنۢ بَعْدِ": { surah: 2, ayat: 27 },
        "مِن شَرِّ": { surah: 113, ayat: 2 },
        "تَرْمِيهِم بِحِجَارَةٍ": { surah: 105, ayat: 4 },
        "لَهُم مَّثَلًا": { surah: 18, ayat: 32 },
        "هُمْ نَائِمُونَ": { surah: 68, ayat: 19 },
        "إِنَّ , ثُمَّ": { surah: 102, ayat: 8 },
        "قَد دَّخَلُواْ": { surah: 5, ayat: 61 },
        "لَئِنۢ بَسَطتَ": { surah: 5, ayat: 28 },
        "أَلَمْ نَخْلُقكُّمْ": { surah: 77, ayat: 20 },
        "يَقْطَعُونَ": { surah: 2, ayat: 27 },
        "مِنْ خَلَقْ (خَلَقِ)": { surah: 96, ayat: 2 },
        "ٱلْحَمْدُ": { surah: 1, ayat: 2 },
        "ٱلشَّمْسُ": { surah: 91, ayat: 1 },
        "شَهِدَ ٱللَّهُ": { surah: 3, ayat: 18 },
        "بِسْمِ ٱللَّهِ": { surah: 1, ayat: 1 },
        "رَضُواْ , وَٱرْحَمْنَا": { surah: 2, ayat: 286 },
        "فَرِيقٌ , فِرْعَوْنَ": { surah: 2, ayat: 50 },
        "فِرْقٍ": { surah: 26, ayat: 63 },
        "قُلْ هُوَ": { surah: 112, ayat: 1 },
        "قُل رَّبِّ": { surah: 23, ayat: 94 },
        "إِنَّهُۥ لَا يُحِبُّ": { surah: 6, ayat: 141 },
        "نُوحِيهَا": { surah: 11, ayat: 49 },
        "سَوَآءٌ": { surah: 2, ayat: 6 },
        "بِمَآ أُنزِلَ": { surah: 2, ayat: 4 },
        "وَلَا ٱلضَّآلِّينَ": { surah: 1, ayat: 7 },
        "ءَآلْـَٰٔنَ": { surah: 10, ayat: 51 },
        "قُرَيْشٍ , خَوْفٍ": { surah: 106, ayat: 1 },
        "يَعْمَلُونَ (نْ)": { surah: 2, ayat: 3 },
        "بِهِۦ كَثِيرًا": { surah: 2, ayat: 26 },
        "عِندَهُۥٓ إِلَّا": { surah: 2, ayat: 255 },
        "عَلِيمًا حَكِيمًا (حَكِيمَا)": { surah: 4, ayat: 11 },
        "ءَامَنُواْ , أُوتُواْ": { surah: 2, ayat: 25 },
        "يٰسٓ (Yaa - 2 harakat)": { surah: 36, ayat: 1 },
        "الٓمٓ (Laaam Miim)": { surah: 2, ayat: 1 },
        "قٓ وَٱلْقُرْءَانِ": { surah: 50, ayat: 1 },
        "ٱلنَّبِيِّۦنَ": { surah: 2, ayat: 61 },
        "ءَآللَّهُ أَذِنَ لَكُمْ": { surah: 10, ayat: 59 },
        "مِثْلًا ۘ أَصْحَابَ": { surah: 36, ayat: 13 },
        "مَالِكِ يَوْمِ الدِّينِ ۗ": { surah: 1, ayat: 4 },
        "فَزَادَهُمُ اللَّهُ مَرَضًا ۚ": { surah: 2, ayat: 10 },
        "قَالُوا إِنَّا مَعَكُمْ ۙ": { surah: 2, ayat: 14 },
        "عِوَجًا ۜ ﴿١﴾ قَيِّمًا": { surah: 18, ayat: 1 },
        "أَنْعَمْتَ (Tenggorokan)": { surah: 1, ayat: 7 }
    };

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
                const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL || '');
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
        if (!acc[curr.kategori]) acc[curr.kategori] = [];
        acc[curr.kategori].push(curr);
        return acc;
    }, {} as Record<string, MateriTajwid[]>);

    const handleSelectKategori = (kategori: string) => {
        setSelectedKategori(kategori);
        // Save to local storage for the Dashboard Hero Card
        localStorage.setItem('tajwid_last_module', kategori);

        // Naive streak update: if it's a new day, increment streak
        const lastStudyDate = localStorage.getItem('tajwid_last_study_date');
        const today = new Date().toLocaleDateString();
        if (lastStudyDate !== today) {
            const currentStreak = parseInt(localStorage.getItem('tajwid_streak') || '0');
            localStorage.setItem('tajwid_streak', (currentStreak + 1).toString());
            localStorage.setItem('tajwid_last_study_date', today);
        }
    };

    const handlePlayAudio = async (item: MateriTajwid) => {
        const contoh = item.contoh.trim();
        const mapping = audioMap[contoh];

        if (!mapping) {
            alert(`Mohon maaf, contoh bacaan tajwid "${contoh}" belum dipetakan ke sistem audio Al-Quran.`);
            return;
        }

        // Stop current playing
        if (playingId === item.id) {
            if (audioRef.current) audioRef.current.pause();
            setPlayingId(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.pause();
        }

        setIsAudioLoading(item.id);

        try {
            // Fetch the Specific Surah detail
            const res = await fetch(`https://equran.id/api/v2/surat/${mapping.surah}`);
            if (!res.ok) throw new Error("Gagal mengambil data EQuran API.");

            const data = await res.json();
            const ayatList = data.data.ayat;

            // Find the specific Ayat
            const targetAyat = ayatList.find((a: any) => a.nomorAyat === mapping.ayat);
            if (!targetAyat || !targetAyat.audio['05']) throw new Error("Audio ayat tidak ditemukan.");

            const audioUrl = targetAyat.audio['05'];

            audioRef.current = new Audio(audioUrl);
            audioRef.current.play();
            setPlayingId(item.id);

            audioRef.current.onended = () => {
                setPlayingId(null);
            };

        } catch (error) {
            console.error("Error playing audio:", error);
            alert("Terjadi kesalahan saat mencoba memutar contoh tajwid. Coba lagi nanti.");
        } finally {
            setIsAudioLoading(null);
        }
    };

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white transition-colors duration-300 relative shadow-xl">
            {/* Header */}
            <div className="bg-[#312e81] dark:bg-qareeb-black dark:border-b dark:border-white/5 text-white px-6 pt-10 pb-6 rounded-b-3xl dark:rounded-none shadow-md sticky top-0 z-50 transition-colors duration-300 relative">
                <div className="flex items-center gap-4">
                    {selectedKategori ? (
                        <button onClick={() => setSelectedKategori(null)} className="flex items-center gap-2 hover:text-indigo-200 dark:hover:text-qareeb-accent transition-colors">
                            <ArrowLeft size={24} className="text-indigo-100 dark:text-white" />
                        </button>
                    ) : (
                        <Link href="/">
                            <ArrowLeft size={24} className="text-indigo-100 hover:text-white dark:text-white dark:hover:text-qareeb-accent transition-colors" />
                        </Link>
                    )}
                    <h1 className="text-xl font-bold line-clamp-1 dark:text-white">
                        {selectedKategori ? selectedKategori : "Buku Tajwid Lengkap"}
                    </h1>
                </div>

                {/* Visual Header Bottom Border / Gradient for dark mode */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden dark:block"></div>
            </div>

            {/* Content */}
            <div className="px-6 mt-6 space-y-8">
                {loadingProgress >= 0 ? (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-700 dark:text-qareeb-accent absolute" size={40} />
                            <span className="text-xs font-bold dark:text-white">{loadingProgress}%</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-qareeb-muted font-medium animate-pulse">Memuat Materi...</p>
                    </div>
                ) : !selectedKategori ? (
                    /* Gallery View */
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pilih Bab Belajar</h2>
                            <p className="text-sm text-gray-500 dark:text-qareeb-muted">Mulai atau lanjutkan hafalan ilmu tajwidmu dari kategori di bawah ini.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {Object.keys(groupedMateri).map((kategori, index) => (
                                <button
                                    key={kategori}
                                    onClick={() => handleSelectKategori(kategori)}
                                    className="bg-white dark:bg-qareeb-card p-5 rounded-3xl dark:rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-indigo-300 dark:hover:border-qareeb-accent hover:shadow-md transition-all flex items-center justify-between group text-left w-full relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-white/5 rounded-bl-full -z-10 group-hover:bg-indigo-100 dark:group-hover:bg-qareeb-accent/10 transition-colors"></div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 dark:bg-qareeb-gray rounded-2xl flex items-center justify-center text-indigo-700 dark:text-qareeb-accent font-bold group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">{kategori}</h3>
                                            <div className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-qareeb-muted">
                                                <BookOpen size={14} className="text-indigo-500 dark:text-qareeb-accent" />
                                                {groupedMateri[kategori].length} Sub-bab
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-qareeb-gray flex items-center justify-center group-hover:bg-[#312e81] dark:group-hover:bg-qareeb-accent transition-colors">
                                        <ChevronRight size={18} className="text-gray-400 dark:text-qareeb-muted group-hover:text-white dark:group-hover:text-qareeb-black" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Detailed Category View */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b-2 border-indigo-100 dark:border-white/10 pb-2 mb-4">
                            <h2 className="text-sm font-bold text-indigo-800 dark:text-white tracking-wider uppercase">
                                Daftar Materi
                            </h2>
                            <div className="text-xs font-bold bg-indigo-50 dark:bg-white/5 text-indigo-700 dark:text-white px-3 py-1 rounded-full border dark:border-white/10">
                                {groupedMateri[selectedKategori]?.length || 0} Item
                            </div>
                        </div>

                        <div className="space-y-4">
                            {groupedMateri[selectedKategori]?.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-qareeb-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-50 dark:from-white/5 to-transparent rounded-bl-full opacity-50 pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-800 dark:group-hover:text-qareeb-accent transition-colors">{item.judul}</h3>
                                        <div className="bg-sky-100 dark:bg-qareeb-accent/10 text-sky-800 dark:text-qareeb-accent text-xs px-2 py-1 rounded-md font-semibold flex items-center gap-1 border dark:border-qareeb-accent/20">
                                            <CheckCircle2 size={12} />
                                            {item.id}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-qareeb-muted mb-4 leading-relaxed relative z-10">
                                        {item.deskripsi}
                                    </p>

                                    <div className="bg-indigo-50 dark:bg-qareeb-gray rounded-xl p-4 space-y-4 relative z-10 border border-indigo-100/50 dark:border-white/5">
                                        <div>
                                            <p className="text-[10px] text-indigo-600 dark:text-qareeb-muted font-bold uppercase tracking-wider mb-2">Huruf Hijaiyah</p>
                                            <p className="text-2xl font-arabic font-bold text-indigo-900 dark:text-white text-right leading-relaxed" dir="rtl">{item.huruf}</p>
                                        </div>
                                        <div className="border-t border-indigo-100/60 dark:border-white/10 pt-3 flex justify-between items-end">
                                            <button
                                                onClick={() => handlePlayAudio(item)}
                                                disabled={isAudioLoading === item.id}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-all text-xs font-bold uppercase tracking-wider ${isAudioLoading === item.id
                                                    ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-wait dark:bg-white/5 dark:border-white/10 dark:text-gray-400'
                                                    : playingId === item.id
                                                        ? 'bg-sky-100 border-sky-200 text-sky-700 dark:bg-qareeb-accent/20 dark:border-qareeb-accent/20 dark:text-qareeb-accent animate-pulse'
                                                        : 'bg-white border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-qareeb-accent dark:hover:text-qareeb-black hover:border-indigo-600 dark:hover:border-qareeb-accent'
                                                    }`}
                                            >
                                                {isAudioLoading === item.id ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : playingId === item.id ? (
                                                    <PauseCircle size={16} />
                                                ) : (
                                                    <Volume2 size={16} />
                                                )}
                                                <span>{isAudioLoading === item.id ? 'Memuat...' : playingId === item.id ? 'Memutar' : 'Bunyi'}</span>
                                            </button>
                                            <div className="text-right">
                                                <p className="text-[10px] text-indigo-600 dark:text-qareeb-muted font-bold uppercase tracking-wider mb-2">Contoh Bacaan</p>
                                                <p className="text-3xl font-arabic font-bold text-[#312e81] dark:text-qareeb-accent leading-tight" dir="rtl">{item.contoh}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}