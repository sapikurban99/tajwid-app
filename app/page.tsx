'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText, Home, CheckSquare,
  PlayCircle, BookMarked, Activity, Moon, Sun,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import PwaPrompt from '@/components/PwaPrompt';

export default function TajwidDashboard() {
  const [errorStatus, setErrorStatus] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Local Storage State
  const [streak, setStreak] = useState(0);
  const [modulSelesai, setModulSelesai] = useState(0);
  const [lastModule, setLastModule] = useState<string>("Belum Mulai Belajar");

  useEffect(() => {
    // Read from localStorage safely on client side
    const savedStreak = localStorage.getItem('tajwid_streak');
    const savedModul = localStorage.getItem('tajwid_modul_selesai');
    const savedLastMod = localStorage.getItem('tajwid_last_module');

    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedModul) setModulSelesai(parseInt(savedModul));
    if (savedLastMod) setLastModule(savedLastMod);

    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const gasUrl = process.env.NEXT_PUBLIC_GAS_URL;

      if (!gasUrl || gasUrl.trim() === '') {
        console.warn('⚠️ NEXT_PUBLIC_GAS_URL kosong.');
        setErrorStatus(true);
        return;
      }

      try {
        const url = gasUrl.includes('?')
          ? `${gasUrl}&sheet=MateriTajwid`
          : `${gasUrl}?sheet=MateriTajwid`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('✅ Data berhasil di-fetch:', data);

      } catch (error) {
        console.error("❌ Detail Error Fetch:", error);
        setErrorStatus(true);
      } finally {
        // Data fetch complete
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black pb-24 font-sans text-gray-800 dark:text-white relative shadow-xl overflow-hidden transition-colors duration-300">

      {/* Header */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white dark:bg-qareeb-black border-b border-transparent dark:border-white/5 transition-colors duration-300 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-qareeb-accent/20 text-indigo-700 dark:text-qareeb-accent flex items-center justify-center text-xl font-bold dark:accent-glow">
            H
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-qareeb-muted font-medium tracking-wider uppercase">Assalamu&apos;alaikum</p>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Hamba Allah</h1>
          </div>
        </div>

        {/* Toggle Theme */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-qareeb-gray border border-transparent dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-white/80 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}
      </div>

      <main className="px-5 py-6 space-y-8 pb-32">
        {/* Peringatan jika Offline */}
        {errorStatus && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-medium border border-amber-200">
            ⚠️ Sedang dalam mode offline (API belum terhubung).
          </div>
        )}

        {/* BEGIN: HeroCard (Active Learning) */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 p-6 text-white shadow-xl shadow-indigo-500/20">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex flex-col gap-5">
            <div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">Terakhir Belajar</span>
              <h2 className="text-2xl font-bold mt-3 leading-tight">{lastModule}</h2>
              <p className="text-indigo-100/80 text-sm mt-1">Lanjutkan progres belajarmu hari ini.</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-indigo-200">Status</span>
                <span className="text-xs font-bold text-white">{lastModule === "Belum Mulai Belajar" ? "0%" : "Sedang dipelajari"}</span>
              </div>
              <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full bg-sky-400 rounded-full ${lastModule === "Belum Mulai Belajar" ? "w-0" : "w-1/2"}`}></div>
              </div>
            </div>
            <Link href="/materi" className="w-full bg-white text-indigo-900 font-bold py-4 rounded-2xl shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span>Lanjutkan Belajar</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </Link>
          </div>
        </section>
        {/* END: HeroCard */}

        {/* PRIMARY PILLARS: Quran, Tajwid, Safinah */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold dark:text-white">Pilar Utama</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Al-Qur'an Card */}
            <Link href="/quran" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-transform">
              <div className="flex-shrink-0 w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                <BookOpen size={32} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Al-Qur'an</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Baca Al-Qur'an dengan terjemahan dan audio.</p>
              </div>
              <div className="p-2 text-sky-600 dark:text-sky-400">
                <ChevronRight size={24} />
              </div>
            </Link>

            {/* Ilmu Tajwid Card */}
            <Link href="/materi" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-transform">
              <div className="flex-shrink-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <FileText size={32} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Ilmu Tajwid</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Pelajari dasar-dasar tajwid dan makharijul huruf.</p>
              </div>
              <div className="p-2 text-indigo-600 dark:text-indigo-400">
                <ChevronRight size={24} />
              </div>
            </Link>

            {/* Fiqih Safinah Card */}
            <Link href="/safinatun" className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center gap-4 group active:scale-[0.98] transition-transform">
              <div className="flex-shrink-0 w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <BookMarked size={32} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">Safinatun Najah</h4>
                <p className="text-xs text-slate-500 font-medium mt-1">Kitab fiqih dasar tentang ibadah dan thaharah.</p>
              </div>
              <div className="p-2 text-emerald-600 dark:text-emerald-400">
                <ChevronRight size={24} />
              </div>
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold dark:text-white leading-tight">{streak} Hari</p>
              <p className="text-xs text-slate-500 font-medium">Streak Belajar</p>
            </div>
          </div>

          <Link href="/quiz">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 h-full active:scale-95 transition-transform group hover:border-orange-300 dark:hover:border-orange-500/50">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:bg-orange-100">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-xl font-bold dark:text-white leading-tight">Latihan</p>
                <p className="text-xs text-slate-500 font-medium">Uji pemahamanmu mengenai Ilmu Tajwid</p>
              </div>
            </div>
          </Link>
        </section>
      </main>

      {/* BEGIN: BottomNavigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-50 pb-safe max-w-md mx-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <div className="flex items-center justify-around h-20 px-4">
          <BottomNavItem href="/" icon={<Home size={24} />} label="Home" active />
          <BottomNavItem href="/quran" icon={<BookOpen size={24} />} label="Qur'an" />
          <BottomNavItem href="/materi" icon={<FileText size={24} />} label="Tajwid" />
          <BottomNavItem href="/safinatun" icon={<BookMarked size={24} />} label="Safinah" />
        </div>
      </nav>
      {/* END: BottomNavigation */}

      {/* PWA Install Prompt */}
      <PwaPrompt />
    </div>
  );
}

function BottomNavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  if (active) {
    return (
      <Link href={href} className="flex flex-col items-center gap-1.5 text-indigo-600 dark:text-indigo-400 relative">
        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full absolute -top-1"></div>
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className="flex flex-col items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}