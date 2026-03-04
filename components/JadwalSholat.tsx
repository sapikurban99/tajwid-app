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

// Default: Bandung
const DEFAULT_LAT = -6.9175;
const DEFAULT_LON = 107.6191;

export default function JadwalSholat() {
    const [timings, setTimings] = useState<PrayerTimes | null>(null);
    const [locationName, setLocationName] = useState('Bandung');
    const [loading, setLoading] = useState(true);
    const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [locationError, setLocationError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchTimes = useCallback(async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const today = new Date();
            const dateStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

            // Aladhan API: method=20 = Kementerian Agama RI
            const res = await fetch(
                `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=20`
            );
            const data = await res.json();

            if (data.code === 200 && data.data?.timings) {
                const t = data.data.timings;
                setTimings({
                    Imsak: t.Imsak,
                    Fajr: t.Fajr,
                    Dhuhr: t.Dhuhr,
                    Asr: t.Asr,
                    Maghrib: t.Maghrib,
                    Isha: t.Isha,
                });
            }
        } catch (err) {
            console.error("Failed to fetch prayer times from Aladhan", err);
        } finally {
            setLoading(false);
            setIsUpdatingLocation(false);
        }
    }, []);

    const reverseGeocode = useCallback(async (lat: number, lon: number) => {
        try {
            const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
                { headers: { 'Accept-Language': 'id-ID,id;q=0.9' } }
            );
            const geoData = await geoRes.json();
            if (geoData?.address) {
                const city = geoData.address.city || geoData.address.county || geoData.address.town || geoData.address.village || '';
                const state = geoData.address.state || '';
                if (city && state) {
                    setLocationName(`${city}, ${state}`);
                } else if (city) {
                    setLocationName(city);
                }
            }
        } catch {
            // Geocoding gagal, tetap pakai nama lokasi sebelumnya
        }
    }, []);

    const fetchByGeolocation = useCallback(() => {
        setIsUpdatingLocation(true);
        setLocationError(null);

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    reverseGeocode(lat, lon);
                    fetchTimes(lat, lon);
                },
                (error) => {
                    let errorMsg = '';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = 'Izin lokasi ditolak. Buka pengaturan browser dan izinkan akses lokasi.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = 'GPS tidak tersedia. Pastikan GPS HP sudah dinyalakan.';
                            break;
                        case error.TIMEOUT:
                            errorMsg = 'Waktu habis mencari lokasi. Pastikan GPS HP aktif dan coba lagi.';
                            break;
                        default:
                            errorMsg = 'Gagal mendapatkan lokasi. Coba lagi.';
                    }
                    console.warn("Geolocation failed:", error.message);
                    setLocationError(errorMsg);
                    setTimeout(() => setLocationError(null), 8000);
                    fetchTimes(DEFAULT_LAT, DEFAULT_LON);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            setLocationError('Browser tidak mendukung GPS.');
            setTimeout(() => setLocationError(null), 8000);
            fetchTimes(DEFAULT_LAT, DEFAULT_LON);
        }
    }, [fetchTimes, reverseGeocode]);

    // Initial load - default Bandung
    useEffect(() => {
        fetchTimes(DEFAULT_LAT, DEFAULT_LON);
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
                    {locationError && (
                        <div className="mt-2 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 animate-pulse">
                            ⚠️ {locationError}
                        </div>
                    )}
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
