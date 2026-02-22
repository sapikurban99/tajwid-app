'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText, Home, CheckSquare,
  PlayCircle, BookMarked, Activity, Moon, Sun
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

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
        const res = await fetch(gasUrl);

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

      <div className="px-6 space-y-6 bg-white dark:bg-qareeb-black pb-6 transition-colors duration-300">
        {/* Peringatan jika Offline */}
        {errorStatus && (
          <div className="bg-amber-50 text-amber-700 p-3 rounded-xl text-xs font-medium border border-amber-200">
            ⚠️ Sedang dalam mode offline (API belum terhubung).
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-[#312e81] dark:bg-qareeb-card dark:card-gradient rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-all duration-300">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400 dark:bg-qareeb-accent rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-50 dark:opacity-20"></div>

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="bg-white/20 dark:bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium dark:border dark:border-white/10">
              <BookMarked size={14} className="dark:text-qareeb-accent" />
              <span className="dark:text-white/90">Modul Terakhir</span>
            </div>
            <Link href="/materi">
              <div className="w-10 h-10 rounded-2xl bg-sky-400 dark:bg-qareeb-accent flex items-center justify-center shadow-inner cursor-pointer hover:bg-sky-500 dark:hover:bg-cyan-400 transition dark:accent-glow">
                <PlayCircle size={24} className="text-indigo-900 dark:text-black" />
              </div>
            </Link>
          </div>

          <p className="text-indigo-100 dark:text-qareeb-muted text-xs font-semibold tracking-wider uppercase mb-1 relative z-10">LANJUTKAN BELAJAR</p>
          <h2 className="text-2xl font-bold mb-6 line-clamp-2 relative z-10">{lastModule}</h2>

          <div className="relative z-10">
            <div className="flex justify-between text-xs text-indigo-100 dark:text-qareeb-muted mb-2">
              <span>Status</span>
              <span>{lastModule === "Belum Mulai Belajar" ? "0%" : "Sedang dipelajari"}</span>
            </div>
            <div className="w-full h-2 bg-indigo-800 dark:bg-white/10 rounded-full overflow-hidden">
              <div className={`h-full bg-sky-400 dark:bg-qareeb-accent rounded-full ${lastModule === "Belum Mulai Belajar" ? "w-0" : "w-1/2"} dark:accent-glow`}></div>
            </div>
          </div>
        </div>

        {/* Mini Stats Card */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-100 dark:border-white/5 bg-white dark:bg-qareeb-card rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
            <Activity size={24} className="text-orange-400 dark:text-cyan-400 mb-2" />
            <p className="text-xs text-gray-500 dark:text-qareeb-muted font-medium uppercase">Streak Belajar</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{streak} Hari</p>
          </div>
          <div className="border border-gray-100 dark:border-white/5 bg-white dark:bg-qareeb-card rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm transition-colors duration-300">
            <BookOpen size={24} className="text-yellow-400 dark:text-qareeb-accent mb-2" />
            <p className="text-xs text-gray-500 dark:text-qareeb-muted font-medium uppercase">Modul Selesai</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">{modulSelesai}</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="px-6 py-6 mt-2 bg-gray-50 dark:bg-qareeb-black transition-colors duration-300">
        <h3 className="text-xs font-bold text-gray-400 dark:text-qareeb-muted tracking-wider mb-6">AKSES CEPAT</h3>

        <div className="grid grid-cols-3 gap-y-8 gap-x-4">
          <QuickAction href="/quran" icon={<BookOpen size={24} className="text-blue-600 dark:text-white group-hover:dark:text-qareeb-accent transition-colors" />} label="Al-Qur'an" bg="bg-blue-50 dark:bg-qareeb-gray dark:border dark:border-white/5" />
          <QuickAction href="/materi" icon={<FileText size={24} className="text-indigo-600 dark:text-white group-hover:dark:text-qareeb-accent transition-colors" />} label="Buku Tajwid" bg="bg-indigo-50 dark:bg-qareeb-gray dark:border dark:border-white/5" />
          <QuickAction href="/quiz" icon={<CheckSquare size={24} className="text-orange-600 dark:text-white group-hover:dark:text-qareeb-accent transition-colors" />} label="Latihan" bg="bg-orange-50 dark:bg-qareeb-gray dark:border dark:border-white/5" />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md mx-auto bg-white dark:bg-qareeb-black/90 dark:backdrop-blur-xl border-t border-gray-100 dark:border-white/5 px-6 py-4 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none transition-colors duration-300">
        <BottomNavItem href="/" icon={<Home size={24} />} label="Home" active />
        <BottomNavItem href="/materi" icon={<BookOpen size={24} />} label="Modul" />
        <BottomNavItem href="/quiz" icon={<CheckSquare size={24} />} label="Latihan" />
      </div>
    </div>
  );
}

// Sub-components diperbarui agar memakai Link Next.js
function QuickAction({ href, icon, label, bg }: { href: string, icon: React.ReactNode, label: string, bg: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-qareeb-accent`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-600 dark:text-qareeb-muted uppercase tracking-tighter text-center">{label}</span>
    </Link>
  );
}

function BottomNavItem({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  if (active) {
    return (
      <Link href={href} className="flex flex-col items-center gap-1 group">
        <div className="relative">
          <div className="text-[#312e81] dark:text-qareeb-accent transition-colors">
            {icon}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#312e81] dark:bg-qareeb-accent"></div>
        </div>
        <span className="text-[10px] font-bold text-[#312e81] dark:text-qareeb-accent uppercase tracking-tighter mt-1">{label}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex flex-col items-center gap-1 cursor-pointer text-gray-400 dark:text-qareeb-muted hover:text-[#312e81] dark:hover:text-white transition-colors`}>
      <div>
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-tighter mt-1">{label}</span>
    </Link>
  );
}