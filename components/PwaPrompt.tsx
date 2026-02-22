'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';

export default function PwaPrompt() {
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Only show on iOS devices
        const isIos = () => {
            const userAgent = window.navigator.userAgent.toLowerCase();
            return /iphone|ipad|ipod/.test(userAgent);
        };

        // Check if it's already installed / running in standalone mode
        const isStandalone = () => {
            return ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);
        };

        // Show prompt if it's iOS Safari and not installed, and user hasn't dismissed it
        if (isIos() && !isStandalone()) {
            const hasDismissed = localStorage.getItem('tajwid_pwa_dismissed');
            if (!hasDismissed) {
                // Delay a bit so it doesn't interrupt initial load aggressively
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }
    }, []);

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('tajwid_pwa_dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white dark:bg-qareeb-card border border-indigo-100 dark:border-white/10 p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-5">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-qareeb-muted transition-colors"
            >
                <X size={18} />
            </button>

            <div className="flex items-start gap-4 mt-1">
                <div className="flex-shrink-0">
                    <img src="/icons/icon-192x192.png" alt="Logo" className="w-14 h-14 rounded-2xl shadow-indigo-200 dark:shadow-none shadow-lg border border-indigo-50 dark:border-white/10" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Install Tajwid App</h3>
                    <p className="text-xs text-gray-600 dark:text-qareeb-muted mt-1 leading-relaxed">
                        Install aplikasi ini di HP kamu untuk akses lebih cepat dan tanpa browser.
                    </p>

                    <div className="mt-3 text-xs text-gray-700 dark:text-gray-300 font-medium bg-indigo-50 dark:bg-white/5 p-2 rounded-lg border border-indigo-100 dark:border-white/10">
                        1. Tap tombol <Share size={14} className="inline mx-1 text-indigo-600 dark:text-qareeb-accent" /> di bawah layar<br />
                        2. Geser dan pilih <strong className="text-indigo-800 dark:text-white">"Add to Home Screen"</strong> <PlusSquare size={14} className="inline mx-1 text-gray-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}
