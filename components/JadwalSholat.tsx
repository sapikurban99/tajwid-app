'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, Loader2, Moon, Sunrise, Sun, Sunset, Clock, RefreshCw } from 'lucide-react';

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
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTimes = useCallback(async (provinsi: string, kabkota: string) => {
        setLoading(true);
        try {
            // Menggunakan EQuran API v2
            const res = await fetch('https://equran.id/api/v2/shalat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provinsi: provinsi,
                    kabkota: kabkota
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
                    setLocationName(`${kabkota}, ${provinsi}`);
                }
            }
        } catch (err) {
            console.error("Failed to fetch prayer times from EQuran", err);
        } finally {
            setLoading(false);
            setIsUpdatingLocation(false);
        }
    }, []);

    const fetchByGeolocation = useCallback(() => {
        setIsUpdatingLocation(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const lat = position.coords.latitude;
                        const lon = position.coords.longitude;

                        // Reverse geocoding with Nominatim
                        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                        const geoData = await geoRes.json();

                        if (geoData && geoData.address) {
                            // Default fallback to Jakarta if mapping fails
                            let mappedProvinsi = "DKI Jakarta";
                            let mappedKabkota = "Kota Jakarta";

                            const state = geoData.address.state || geoData.address.region || "";
                            const city = geoData.address.city || geoData.address.county || geoData.address.town || "";

                            // Simple mapping heuristic
                            if (state.toLowerCase().includes("jakarta")) {
                                mappedProvinsi = "DKI Jakarta";
                                mappedKabkota = "Kota Jakarta";
                            } else if (state && city) {
                                mappedProvinsi = state;
                                mappedKabkota = city.startsWith("Kota") || city.startsWith("Kab") ? city : `Kota ${city}`;
                            }

                            fetchTimes(mappedProvinsi, mappedKabkota);
                        } else {
                            fetchTimes("DKI Jakarta", "Kota Jakarta");
                        }
                    } catch (e) {
                        console.warn("Reverse geocoding failed, using default (Jakarta)", e);
                        fetchTimes("DKI Jakarta", "Kota Jakarta");
                    }
                },
                (error) => {
                    console.warn("Geolocation blocked or failed, using default (Jakarta)");
                    fetchTimes("DKI Jakarta", "Kota Jakarta");
                },
                { timeout: 5000 }
            );
        } else {
            fetchTimes("DKI Jakarta", "Kota Jakarta");
        }
    }, [fetchTimes]);

    // Initial load - safely fallback to Jakarta first so it doesn't block the UI
    useEffect(() => {
        fetchTimes("DKI Jakarta", "Kota Jakarta");
    }, [fetchTimes]);

    const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const dateString = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (loading && !timings) {
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
        <section className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm relative overflow-hidden transition-colors duration-300">
            {/* Loading Overlay for Background Update */}
            {loading && timings && (
                <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-3xl">
                    <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold dark:text-white flex items-center gap-2">
                        <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
                        Jadwal Sholat
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {locationName} • {dateString}
                    </p>
                    <button
                        onClick={fetchByGeolocation}
                        disabled={isUpdatingLocation || loading}
                        className="mt-3 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/50 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
                    >
                        <RefreshCw size={12} className={isUpdatingLocation ? "animate-spin" : ""} />
                        {isUpdatingLocation ? 'Mencari Lokasi...' : 'Update Lokasi GPS'}
                    </button>
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
