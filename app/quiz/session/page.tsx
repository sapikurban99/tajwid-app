'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, XCircle, Trophy, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface MateriTajwid {
    id: string;
    kategori: string;
    judul: string;
    deskripsi: string;
    huruf: string;
    contoh: string;
}

interface Question {
    correctRule: MateriTajwid;
    options: string[]; // List of 'judul'
}

const TOTAL_QUESTIONS = 5;

export default function QuizSession() {
    const router = useRouter();
    const [materis, setMateris] = useState<MateriTajwid[]>([]);
    const [loadingProgress, setLoadingProgress] = useState(-1);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);

    // State for user interaction
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
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

        const fetchAndGenerateQuestions = async () => {
            try {
                const res = await fetch(process.env.NEXT_PUBLIC_GAS_URL || '');
                const { data } = await res.json();
                await new Promise(r => setTimeout(r, 600));


                if (data && data.length > 0) {
                    setMateris(data);
                    generateQuestions(data);
                }
            } catch (error) {
                console.error('Gagal mengambil data materi', error);
            } finally {
                clearInterval(interval);
                setLoadingProgress(100);
                setTimeout(() => setLoadingProgress(-1), 300);
            }
        };

        fetchAndGenerateQuestions();
        return () => clearInterval(interval);
    }, []);

    const generateQuestions = (data: MateriTajwid[]) => {
        // Filter out items without examples or with placeholder "-"
        const validItems = data.filter(item =>
            item.contoh &&
            item.contoh.trim() !== '' &&
            item.contoh !== '-' &&
            item.huruf !== '-' &&
            item.judul
        );

        // Get unique titles for options
        const allTitles = Array.from(new Set(validItems.map(item => item.judul)));

        const newQuestions: Question[] = [];

        // Generate random questions
        for (let i = 0; i < TOTAL_QUESTIONS; i++) {
            // Pick a random correct item
            const correctItem = validItems[Math.floor(Math.random() * validItems.length)];

            // Pick 3 random wrong titles
            let options = [correctItem.judul];
            const availableWrongTitles = allTitles.filter(title => title !== correctItem.judul);

            // Fisher-Yates shuffle for available wrong titles
            for (let j = availableWrongTitles.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [availableWrongTitles[j], availableWrongTitles[k]] = [availableWrongTitles[k], availableWrongTitles[j]];
            }

            // Take up to 3 wrong options
            const wrongOptions = availableWrongTitles.slice(0, 3);
            options = [...options, ...wrongOptions];

            // Shuffle options
            for (let j = options.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [options[j], options[k]] = [options[k], options[j]];
            }

            newQuestions.push({
                correctRule: correctItem,
                options: options
            });
        }

        setQuestions(newQuestions);
        setCurrentQuestionIdx(0);
        setScore(0);
        setSelectedOption(null);
        setIsFinished(false);
    };

    const handleOptionSelect = (option: string) => {
        if (selectedOption !== null) return; // Prevent multiple clicks

        setSelectedOption(option);

        const currentQ = questions[currentQuestionIdx];
        const isCorrect = option === currentQ.correctRule.judul;

        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        // Wait 1.5 seconds then move to next
        setTimeout(() => {
            if (currentQuestionIdx < TOTAL_QUESTIONS - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
                setSelectedOption(null);
            } else {
                // Selesaikan Kuis & Simpan Skor
                setIsFinished(true);

                // Kalkulasi skor akhir secara realtime
                const finalScore = isCorrect ? score + 1 : score;
                const savedObj = localStorage.getItem('quiz_high_score');
                const previousHigh = savedObj ? parseInt(savedObj) : 0;

                if (finalScore > previousHigh) {
                    localStorage.setItem('quiz_high_score', finalScore.toString());
                }

                // Simpan ke Riwayat (History)
                const now = new Date();
                const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                const historyObj = localStorage.getItem('quiz_history');
                const historyArr = historyObj ? JSON.parse(historyObj) : [];

                historyArr.unshift({
                    score: finalScore,
                    total: TOTAL_QUESTIONS,
                    date: dateStr
                });

                // Keep only last 10
                if (historyArr.length > 10) historyArr.pop();
                localStorage.setItem('quiz_history', JSON.stringify(historyArr));
            }
        }, 1500);
    };

    const resetQuiz = () => {
        setLoadingProgress(0);
        let pct = 0;
        const interval = setInterval(() => {
            pct += 20;
            if (pct >= 100) {
                clearInterval(interval);
                generateQuestions(materis);
                setLoadingProgress(-1);
            } else {
                setLoadingProgress(pct);
            }
        }, 100);
    };

    if (loadingProgress >= 0) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black flex flex-col justify-center items-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-4">
                    <Loader2 className="animate-spin text-indigo-700 dark:text-qareeb-accent absolute" size={48} />
                    <span className="text-sm font-bold dark:text-white">{loadingProgress}%</span>
                </div>
                <p className="text-gray-500 dark:text-qareeb-muted font-medium animate-pulse">Menyiapkan Latihan...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black flex flex-col justify-center items-center p-6 text-center">
                <XCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gagal Memuat Soal</h2>
                <p className="text-gray-500 dark:text-qareeb-muted mb-6">Pastikan koneksi internet stabil dan data tersedia.</p>
                <Link href="/quiz">
                    <button className="bg-indigo-700 dark:bg-qareeb-card dark:border dark:border-white/10 text-white px-6 py-2 rounded-full font-medium dark:hover:border-qareeb-accent transition-colors">Kembali</button>
                </Link>
            </div>
        );
    }

    // RESULT SCREEN
    if (isFinished) {
        const percentage = (score / TOTAL_QUESTIONS) * 100;
        let message = "";
        let emoji = "";

        if (percentage === 100) { message = "Sempurna! Masya Allah!"; emoji = "🏆"; }
        else if (percentage >= 80) { message = "Sangat Baik! Alhamdulillah!"; emoji = "🌟"; }
        else if (percentage >= 60) { message = "Cukup Baik. Terus Berlatih!"; emoji = "👍"; }
        else { message = "Jangan Menyerah. Ayo Belajar Lagi!"; emoji = "💪"; }

        return (
            <div className="max-w-md mx-auto min-h-screen bg-indigo-800 dark:bg-qareeb-black dark:border-x dark:border-white/5 text-white flex flex-col relative overflow-hidden transition-colors duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400 dark:bg-qareeb-accent rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-30 dark:opacity-10 translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-400 dark:bg-qareeb-accent/50 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-3xl opacity-20 dark:opacity-10 -translate-x-20 translate-y-20"></div>

                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10 relative">
                    <div className="bg-white/20 dark:bg-white/5 p-6 rounded-full backdrop-blur-md mb-8 ring-4 ring-white/10 dark:ring-white/5 shadow-2xl">
                        <Trophy size={80} className="text-yellow-400 dark:text-qareeb-accent drop-shadow-lg" />
                    </div>

                    <h2 className="text-4xl font-bold mb-2 dark:text-white">Latihan Selesai!</h2>
                    <p className="text-indigo-100 dark:text-qareeb-muted text-lg mb-8">{message} {emoji}</p>

                    <div className="bg-white dark:bg-qareeb-card rounded-3xl p-8 w-full shadow-2xl space-y-4 mb-10 text-gray-800 dark:text-white dark:border dark:border-white/5">
                        <p className="text-sm text-gray-400 dark:text-qareeb-muted/50 font-bold uppercase tracking-widest">Skor Akhir</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-6xl font-black text-[#312e81] dark:text-qareeb-accent">{score}</span>
                            <span className="text-2xl text-gray-300 dark:text-white/10">/</span>
                            <span className="text-2xl text-gray-400 dark:text-qareeb-muted font-bold">{TOTAL_QUESTIONS}</span>
                        </div>
                        <p className="text-sm font-medium text-indigo-600 dark:text-qareeb-accent bg-indigo-50 dark:bg-qareeb-accent/10 py-2 rounded-lg">
                            Keakuratan: {percentage}%
                        </p>
                    </div>

                    <div className="w-full space-y-4">
                        <button
                            onClick={resetQuiz}
                            className="w-full bg-sky-400 dark:bg-qareeb-accent text-indigo-900 dark:text-qareeb-black rounded-2xl py-4 font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:bg-sky-500 transition-colors dark:accent-glow"
                        >
                            <RefreshCcw size={20} />
                            Ulangi Latihan
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-transparent border-2 border-white/30 dark:border-white/10 text-white rounded-2xl py-4 font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                        >
                            <Home size={20} />
                            Kembali ke Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ACTIVE QUIZ SCREEN
    const currentQ = questions[currentQuestionIdx];

    return (
        <div className="max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-qareeb-black flex flex-col font-sans text-gray-800 dark:text-white transition-colors duration-300">
            {/* Header / Progress */}
            <div className="bg-white dark:bg-qareeb-black px-6 pt-10 pb-4 shadow-sm z-10 sticky top-0 dark:border-b dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => router.push('/quiz')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                        <ArrowLeft size={24} className="text-gray-600 dark:text-white" />
                    </button>
                    <div className="bg-indigo-50 dark:bg-white/5 text-indigo-800 dark:text-qareeb-accent text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase dark:border dark:border-white/10">
                        Soal {currentQuestionIdx + 1} / {TOTAL_QUESTIONS}
                    </div>
                    <div className="w-10"></div> {/* Placeholder for balance */}
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 dark:bg-qareeb-accent rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIdx) / TOTAL_QUESTIONS) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8 flex flex-col">

                {/* Question Card */}
                <div className="bg-white dark:bg-qareeb-card rounded-[2rem] p-8 shadow-lg border border-gray-100 dark:border-white/5 flex flex-col items-center mb-8 relative overflow-hidden transition-colors duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>

                    <p className="text-sm font-semibold text-gray-500 dark:text-qareeb-muted mb-6 relative z-10">Hukum bacaan apakah ini?</p>

                    <div className="bg-[#312e81] dark:bg-qareeb-gray w-full py-8 px-4 rounded-2xl text-center shadow-inner relative z-10 mb-2 border dark:border-white/5">
                        <p className="text-4xl font-arabic font-bold text-white tracking-widest leading-loose" dir="rtl">
                            {currentQ.correctRule.contoh}
                        </p>
                    </div>
                </div>

                {/* Options Space */}
                <div className="space-y-3 flex-1">
                    {currentQ.options.map((option, idx) => {
                        const isCorrectAnswer = option === currentQ.correctRule.judul;
                        const isSelected = selectedOption === option;

                        let buttonClass = "w-full bg-white dark:bg-qareeb-card border-2 border-gray-100 dark:border-white/5 text-gray-700 dark:text-white py-4 px-6 rounded-2xl font-bold text-left text-lg shadow-sm transition-all flex justify-between items-center";
                        let icon = null;

                        if (selectedOption !== null) {
                            if (isCorrectAnswer) {
                                buttonClass = "w-full bg-blue-50 dark:bg-qareeb-accent/10 border-2 border-blue-500 dark:border-qareeb-accent text-blue-800 dark:text-qareeb-accent py-4 px-6 rounded-2xl font-bold text-left text-lg shadow-md transition-all flex justify-between items-center";
                                icon = <CheckCircle className="text-blue-500 dark:text-qareeb-accent" size={24} />;
                            } else if (isSelected && !isCorrectAnswer) {
                                buttonClass = "w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-500 text-red-800 dark:text-red-400 py-4 px-6 rounded-2xl font-bold text-left text-lg shadow-sm transition-all flex justify-between items-center";
                                icon = <XCircle className="text-red-500 dark:text-red-400" size={24} />;
                            } else {
                                buttonClass = "w-full bg-gray-50 dark:bg-white/5 border-2 border-gray-100 dark:border-white/5 text-gray-400 dark:text-qareeb-muted py-4 px-6 rounded-2xl font-bold text-left text-lg opacity-50 transition-all flex justify-between items-center";
                            }
                        } else {
                            // Hover effect only before selection
                            buttonClass += " hover:border-indigo-300 dark:hover:border-qareeb-accent hover:shadow-md active:scale-[0.98]";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionSelect(option)}
                                disabled={selectedOption !== null}
                                className={buttonClass}
                            >
                                <span>{option}</span>
                                {icon}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
