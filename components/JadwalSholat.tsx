'use client';

import { useState, useEffect } from 'react';
import { MapPin, Loader2, Moon, Sunrise, Sun, Sunset, Clock } from 'lucide-react';

interface PrayerTimes {
    Imsak: string;
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export default function JadwalSholat() {
    const [timings, setTimings] = useState<PrayerTimes | null>(null);
    const [locationName, setLocationName] = useState('D.K.I Jakarta');
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                // Menggunakan EQuran API v2
                const res = await fetch('https://equran.id/api/v2/shalat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        provinsi: "DKI Jakarta",
                        kabkota: "Kota Jakarta"
                    })
                });

                const data = await res.json();

                if (data.code === 200 && data.data && data.data.jadwal) {
                    const todayDate = new Date().getDate();
                    // Cari jadwal hari ini berdasarkan tanggal
                    const schedule = data.data.jadwal.find((j: any) => j.tanggal === todayDate);

                    if (schedule) {
                        setTimings({
                            Imsak: schedule.imsak,
                            Fajr: schedule.subuh,
                            Dhuhr: schedule.dzuhur,
                            Asr: schedule.ashar,
                            Maghrib: schedule.maghrib,
                            Isha: schedule.isya,
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch prayer times from EQuran", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimes();
    }, []);

    const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateString = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex items-center justify-center min-h-[140px]">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
            </div>
        );
    }

    if (!timings) return null;

    const prayerList = [
        { name: 'Imsak', time: timings.Imsak, icon: Moon },
        { name: 'Subuh', time: timings.Fajr, icon: Sunrise },
        { name: 'Dzuhur', time: timings.Dhuhr, icon: Sun },
        { name: 'Ashar', time: timings.Asr, icon: Sun },
        { name: 'Maghrib', time: timings.Maghrib, icon: Sunset },
        { name: 'Isya', time: timings.Isha, icon: Moon },
    ];

    return (
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
                        Jadwal Sholat
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {locationName} • {dateString}
                    </p>
                </div>
                <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-xl">
                    {timeString}
                </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {prayerList.map((prayer, index) => {
                    const Icon = prayer.icon;
                    return (
                        <div key={index} className="flex-shrink-0 w-[85px] bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col items-center gap-2 border border-slate-100 dark:border-slate-700 snap-center active:scale-95 transition-transform">
                            <Icon size={20} className="text-slate-400 dark:text-slate-400" />
                            <div className="text-center">
                                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider mb-0.5">{prayer.name}</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{prayer.time}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
