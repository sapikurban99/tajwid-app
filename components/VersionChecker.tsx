'use client';

import { useEffect, useState } from 'react';

export default function VersionChecker() {
    // Hidden component that polls for app updates
    const [currentVersion, setCurrentVersion] = useState<string | null>(null);

    const checkVersion = async () => {
        try {
            const res = await fetch('/api/version', { cache: 'no-store' });
            const data = await res.json();

            if (currentVersion === null) {
                // First load, save the version but don't refresh
                setCurrentVersion(data.version);
            } else if (data.version !== currentVersion) {
                // Version mismatch! A new deployment has happened. Force a hard refresh.
                console.log("New app version detected. Reloading...");
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to check app version:", error);
        }
    };

    useEffect(() => {
        // 1. Check immediately on mount
        checkVersion();

        // 2. Check every 5 minutes while the app is open
        const intervalId = setInterval(checkVersion, 5 * 60 * 1000);

        // 3. Check every time the user brings the app back to the foreground (e.g., unlocking phone)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                checkVersion();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [currentVersion]);

    return null; // This component doesn't render anything
}
