'use client';

import React, { useEffect, useState, useRef, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  WifiOff,
  Loader2,
  HelpCircle,
  LayoutGrid,
  X,
  XCircle,
  Lock,
  ZoomIn,
  BookOpen,
  Sparkles,
  Pause,
  Play,
  Coffee,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { playCorrectSound, playWrongSound, triggerCelebration } from '@/lib/audioAndEffects';

function normalizeImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('/soal-images/')) return trimmed;
  if (trimmed.startsWith('soal-images/')) return `/${trimmed}`;
  const filename = trimmed.replace(/^\/+/, '');
  return `/soal-images/${filename}`;
}

function parseImageUrls(raw: string | null): string[] {
  if (!raw) return [];
  if (raw.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(normalizeImageUrl).filter(Boolean);
    } catch {
      // fallback
    }
  }
  return raw.split(',').map((s) => normalizeImageUrl(s.trim())).filter(Boolean);
}

interface QuestionItem {
  id: string;
  display_number: number;
  question_text: string;
  image_url: string | null;
  audio_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  saved_answer: string | null;
  is_locked?: boolean;
  explanation?: string | null;
  correct_answer?: string | null;
}

type SaveState = 'saved' | 'saving' | 'error' | 'offline';

export default function ExamWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: examId } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam and Question state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [lockedQuestions, setLockedQuestions] = useState<{ [questionId: string]: boolean }>({});

  // Server Timer state
  const [expectedEndAt, setExpectedEndAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Autosave and Network state
  const [saveStatus, setSaveStatus] = useState<SaveState>('saved');
  const pendingSyncQueue = useRef<{ [questionId: string]: string }>({});

  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox Zoom state for question images
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Mobile navigation drawer state
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);

  // Pause Exam State
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseLoading] = useState(false);

  // Auto-submit guard
  const hasAutoSubmitted = useRef(false);

  // Minimum Answering Time per Question (5 seconds minimum to prevent rushing)
  const MIN_QUESTION_SECONDS = 5;
  const [minTimeRemaining, setMinTimeRemaining] = useState<number>(MIN_QUESTION_SECONDS);
  const [passedMinTimeQuestions, setPassedMinTimeQuestions] = useState<{ [questionId: string]: boolean }>({});
  const [minTimeAlert, setMinTimeAlert] = useState<string | null>(null);

  // Listen for mobile tab-switching / app-minimizing
  useEffect(() => {
    let warningTimeout: NodeJS.Timeout;
    const handleVisibility = () => {
      if (!document.hidden) {
        setTabSwitchWarning(true);
        warningTimeout = setTimeout(() => {
          setTabSwitchWarning(false);
        }, 4000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(warningTimeout);
    };
  }, []);

  // 1. Initial Load: Fetch questions & server authoritative timer
  useEffect(() => {
    async function loadExam() {
      try {
        const res = await fetch(`/api/exams/${examId}/questions`);
        const data = await res.json();

        if (!res.ok) {
          if (data.status === 'TIME_EXPIRED' || data.status === 'SUBMITTED') {
            router.push(`/exam/${examId}/result`);
            return;
          }
          setError(data.error || 'Gagal memuat lembar ujian.');
          setLoading(false);
          return;
        }

        setQuestions(data.questions || []);

        if (data.status === 'PAUSED') {
          setIsPaused(true);
        }

        // Populate initial answers and locked status
        const initialAnswers: { [key: string]: string } = {};
        const initialLocked: { [key: string]: boolean } = {};
        for (const q of data.questions) {
          if (q.saved_answer) {
            initialAnswers[q.id] = q.saved_answer;
          }
          if (q.is_locked) {
            initialLocked[q.id] = true;
          }
        }
        setAnswers(initialAnswers);
        setLockedQuestions(initialLocked);

        // Compute remaining seconds from server timestamp & expected_end_at
        const endAt = new Date(data.expected_end_at);
        setExpectedEndAt(endAt);

        const serverNow = new Date(data.server_time).getTime();
        const clientNow = Date.now();
        const serverOffset = serverNow - clientNow;

        const calculatedRemaining = Math.max(
          0,
          Math.floor((endAt.getTime() - (Date.now() + serverOffset)) / 1000)
        );
        setRemainingSeconds(calculatedRemaining);

        // Resume active question index if available
        if (data.current_question && data.current_question >= 1 && data.current_question <= data.questions.length) {
          setCurrentIndex(data.current_question - 1);
        }
      } catch {
        setError('Gagal menghubungi server untuk memuat ujian.');
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [examId, router]);

  // 2. Submit Action
  const submitExam = useCallback(
    async (autoExpired = false) => {
      if (submitting || hasAutoSubmitted.current) return;
      if (autoExpired) {
        hasAutoSubmitted.current = true;
      }
      setSubmitting(true);

      try {
        const res = await fetch(`/api/exams/${examId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autoExpired }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Gagal mengumpulkan lembar ujian.');
          setSubmitting(false);
          return;
        }

        if (data.success) {
          router.push(`/exam/${examId}/result`);
        }
      } catch (err) {
        console.error('Submit error:', err);
        // Fallback retry
        router.push(`/exam/${examId}/result`);
      } finally {
        setSubmitting(false);
      }
    },
    [examId, router, submitting]
  );

  // Toggle Pause/Resume handler
  const handleTogglePause = async (forcePause?: boolean) => {
    setPauseLoading(true);
    try {
      const nextAction =
        forcePause !== undefined
          ? forcePause
            ? 'pause'
            : 'resume'
          : isPaused
          ? 'resume'
          : 'pause';

      const res = await fetch(`/api/exams/${examId}/pause`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal mengubah status jeda ujian.');
        return;
      }

      if (nextAction === 'pause') {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        if (data.expected_end_at) {
          setExpectedEndAt(new Date(data.expected_end_at));
        }
        if (data.remaining_seconds !== undefined) {
          setRemainingSeconds(data.remaining_seconds);
        }
      }
    } catch (err) {
      console.error('Pause error:', err);
    } finally {
      setPauseLoading(false);
    }
  };

  // 3. Countdown Timer Interval (Authoritative based on expectedEndAt)
  useEffect(() => {
    if (!expectedEndAt || isPaused) return;

    const timer = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expectedEndAt.getTime() - Date.now()) / 1000)
      );
      setRemainingSeconds(diff);

      if (diff <= 0 && !hasAutoSubmitted.current) {
        clearInterval(timer);
        submitExam(true); // Auto-submit when time expires!
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expectedEndAt, isPaused, submitExam]);

  // Per-Question Minimum Answering Timer (5 seconds per question)
  useEffect(() => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const isAlreadyPassed = Boolean(passedMinTimeQuestions[currentQ.id] || lockedQuestions[currentQ.id]);

    if (isAlreadyPassed) {
      const t = setTimeout(() => setMinTimeRemaining(0), 0);
      return () => clearTimeout(t);
    }

    const initTimeout = setTimeout(() => setMinTimeRemaining(MIN_QUESTION_SECONDS), 0);

    const interval = setInterval(() => {
      setMinTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPassedMinTimeQuestions((passed) => ({ ...passed, [currentQ.id]: true }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(interval);
    };
  }, [currentIndex, questions, passedMinTimeQuestions, lockedQuestions]);

  // Auto-dismiss minimum time notification alert
  useEffect(() => {
    if (!minTimeAlert) return;
    const t = setTimeout(() => setMinTimeAlert(null), 3500);
    return () => clearTimeout(t);
  }, [minTimeAlert]);

  // 4. Autosave Worker
  const flushPendingAnswers = useCallback(async () => {
    const pendingKeys = Object.keys(pendingSyncQueue.current);
    if (pendingKeys.length === 0) return;

    setSaveStatus('saving');
    for (const qId of pendingKeys) {
      const ans = pendingSyncQueue.current[qId];
      try {
        const res = await fetch(`/api/exams/${examId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: qId,
            answer: ans,
            current_question: currentIndex + 1,
          }),
        });
        if (res.ok) {
          delete pendingSyncQueue.current[qId];
        } else {
          const d = await res.json();
          if (d.status === 'TIME_EXPIRED') {
            submitExam(true);
            return;
          }
        }
      } catch {
        setSaveStatus('offline');
        return;
      }
    }
    setSaveStatus('saved');
  }, [currentIndex, examId, submitExam]);

  // 5. Online/Offline Network Listeners
  useEffect(() => {
    const handleOnline = () => {
      // Flush pending queue
      flushPendingAnswers();
    };
    const handleOffline = () => {
      setSaveStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushPendingAnswers]);

  // 6. Navigation and Locking Logic: When student moves away from an answered question, lock it!
  const navigateToQuestion = useCallback((targetIndex: number) => {
    if (targetIndex === currentIndex) return;

    const currentQ = questions[currentIndex];
    if (currentQ) {
      // Guard: enforce minimum time spent on question before moving to another question
      if (minTimeRemaining > 0 && !passedMinTimeQuestions[currentQ.id] && !lockedQuestions[currentQ.id]) {
        setMinTimeAlert(`Harap baca dan pahami soal minimal ${minTimeRemaining} detik lagi sebelum berpindah.`);
        return;
      }

      const currentAns = answers[currentQ.id];
      // If student has answered the current question and is now navigating away:
      if (currentAns && !lockedQuestions[currentQ.id]) {
        // Lock this question locally
        setLockedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
        // Send is_final to server and receive explanation
        fetch(`/api/exams/${examId}/answer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question_id: currentQ.id,
            answer: currentAns,
            is_final: true,
            current_question: targetIndex + 1,
          }),
        })
          .then((res) => res.json())
          .then((resData) => {
            if (resData.explanation || resData.correct_answer) {
              setQuestions((prevQuestions) =>
                prevQuestions.map((q) =>
                  q.id === currentQ.id
                    ? {
                        ...q,
                        explanation: resData.explanation,
                        correct_answer: resData.correct_answer,
                        is_locked: true,
                      }
                    : q
                )
              );
            }
          })
          .catch(console.error);
      }
    }
    setCurrentIndex(targetIndex);
  }, [answers, currentIndex, examId, lockedQuestions, minTimeRemaining, passedMinTimeQuestions, questions]);

  const handleSelectOption = async (questionId: string, optionLetter: string) => {
    // If question is already locked, prevent modifying the answer!
    if (lockedQuestions[questionId]) return;

    // 1. Immediate UI update
    setAnswers((prev) => ({ ...prev, [questionId]: optionLetter }));
    setSaveStatus('saving');

    // 2. Queue and send to server
    pendingSyncQueue.current[questionId] = optionLetter;

    if (!navigator.onLine) {
      setSaveStatus('offline');
      return;
    }

    try {
      const res = await fetch(`/api/exams/${examId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: questionId,
          answer: optionLetter,
          current_question: currentIndex + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.status === 'TIME_EXPIRED') {
          submitExam(true);
          return;
        }
        if (data.is_locked) {
          setLockedQuestions((prev) => ({ ...prev, [questionId]: true }));
        }
        setSaveStatus('error');
        return;
      }

      delete pendingSyncQueue.current[questionId];
      setSaveStatus('saved');
    } catch {
      setSaveStatus('offline');
    }
  };

  const handleLockCurrentQuestion = async () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const currentAns = answers[currentQ.id];
    if (!currentAns || lockedQuestions[currentQ.id]) return;

    setLockedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
    setSaveStatus('saving');

    try {
      const res = await fetch(`/api/exams/${examId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQ.id,
          answer: currentAns,
          is_final: true,
          current_question: currentIndex + 1,
        }),
      });

      const resData = await res.json();
      const actualCorrect = (resData.correct_answer || currentQ.correct_answer || '').trim().toUpperCase();
      const studentChoice = (currentAns || '').trim().toUpperCase();
      const isCorrect = Boolean(actualCorrect && studentChoice && actualCorrect === studentChoice);

      // Play rich audio and visual effects
      if (isCorrect) {
        playCorrectSound();
        triggerCelebration();
      } else {
        playWrongSound();
      }

      if (resData.explanation || resData.correct_answer) {
        setQuestions((prevQuestions) =>
          prevQuestions.map((q) =>
            q.id === currentQ.id
              ? {
                  ...q,
                  explanation: resData.explanation,
                  correct_answer: resData.correct_answer,
                  is_locked: true,
                }
              : q
          )
        );
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Format seconds to 01:45:00
  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Menyiapkan lembar soal ujian...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ujian Tidak Dapat Diakses</h2>
          <p className="text-sm text-slate-600">{error || 'Tidak ada soal yang tersedia.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers[currentQuestion.id] || null;

  // Counts for modal
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  // Timer visual levels
  const isCritical = remainingSeconds < 600; // < 10 mins
  const isWarning = remainingSeconds < 1800 && remainingSeconds >= 600; // 10-30 mins
  const isAlert5Mins = remainingSeconds > 0 && remainingSeconds < 300; // < 5 mins

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col exam-content select-none">
      {/* Top Authoritative Header */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} showText={false} />
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                SIMULASI TKA/TKAD
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Soal {currentIndex + 1} dari {questions.length}
              </p>
            </div>
          </div>

          {/* Authoritative Timer & Status Badge */}
          <div className="flex items-center gap-3">
            {/* Autosave Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
              {saveStatus === 'saved' && (
                <span className="text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban tersimpan
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-blue-700 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-amber-700 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> Belum tersimpan — mencoba kembali...
                </span>
              )}
              {saveStatus === 'offline' && (
                <span className="text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 animate-pulse">
                  <WifiOff className="w-3.5 h-3.5" /> Koneksi terputus
                </span>
              )}
            </div>

            {/* Countdown Badge */}
            <div
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-mono font-black text-sm sm:text-base border shadow-xs transition-colors ${
                isCritical
                  ? 'bg-red-50 text-red-700 border-red-300 animate-pulse-subtle'
                  : isWarning
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-current shrink-0" />
              <span>{formatTimer(remainingSeconds)}</span>
            </div>

            {/* Pause Button */}
            <button
              type="button"
              onClick={() => handleTogglePause(true)}
              disabled={pauseLoading}
              className="h-10 px-3 sm:px-3.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              title="Jeda Ujian Sementara"
            >
              {pauseLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 fill-current" />
              )}
              <span className="hidden sm:inline">JEDA</span>
            </button>

            {/* Finish Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">SELESAI</span>
            </button>
          </div>
        </div>

        {/* 5-minute Warning Banner */}
        {isAlert5Mins && (
          <div className="bg-red-600 text-white text-xs sm:text-sm font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            PERHATIAN: Waktu ujian tersisa {formatTimer(remainingSeconds)}. Bersiaplah menyelesaikan ujian!
          </div>
        )}
      </header>

      {/* Real-time Notification when returning to tab / app */}
      {tabSwitchWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xl flex items-center gap-2 max-w-sm text-center animate-in fade-in slide-in-from-top-2 border border-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Perhatian: Waktu ujian terus berjalan saat kamu keluar layar.</span>
        </div>
      )}

      {/* Minimum Answering Time Warning Toast */}
      {minTimeAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black shadow-2xl flex items-center gap-2.5 max-w-md text-center border-2 border-amber-600 animate-in fade-in slide-in-from-top-2">
          <Clock className="w-4 h-4 text-slate-950 shrink-0 animate-spin" />
          <span className="flex-1">{minTimeAlert}</span>
          <button
            type="button"
            onClick={() => setMinTimeAlert(null)}
            className="p-1 rounded-full hover:bg-amber-600/30 text-slate-950 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-28 lg:pb-8">
        {/* Left: Question Card (8 columns on desktop) */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-8 flex flex-col justify-between min-h-[480px] sm:min-h-[520px]">
          <div>
            {/* Question Number & Status Header */}
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-blue-600 text-white font-black text-xs sm:text-sm rounded-lg shadow-xs">
                  SOAL NO. {currentQuestion.display_number}
                </span>

                {/* Minimum time indicator per question */}
                {minTimeRemaining > 0 && !lockedQuestions[currentQuestion.id] && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black animate-pulse">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Min: {minTimeRemaining}s</span>
                  </span>
                )}
                {minTimeRemaining === 0 && !lockedQuestions[currentQuestion.id] && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Min Selesai</span>
                  </span>
                )}

                {lockedQuestions[currentQuestion.id] ? (
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" /> Terkunci ({selectedAnswer})
                  </span>
                ) : selectedAnswer ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Terjawab ({selectedAnswer})
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Belum Dijawab
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 font-medium">
                {currentIndex + 1} / {questions.length}
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed mb-6 whitespace-pre-line">
              {currentQuestion.question_text}
            </div>

            {/* Question Images if exists */}
            {(() => {
              const images = parseImageUrls(currentQuestion.image_url);
              if (images.length === 0) return null;
              return (
                <div className="mb-6 space-y-4">
                  <div className={`grid gap-4 ${images.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {images.map((imgSrc, imgIdx) => (
                      <div
                        key={imgIdx}
                        onClick={() => setZoomedImage(imgSrc)}
                        className="group relative rounded-2xl overflow-hidden border-2 border-slate-200 bg-white p-2 sm:p-3 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-zoom-in text-center flex flex-col items-center justify-center"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={`Ilustrasi Soal ${currentQuestion.display_number} (${imgIdx + 1})`}
                          className="w-full object-contain max-h-80 rounded-xl"
                          loading="eager"
                        />
                        <div className="mt-2 text-xs font-semibold text-slate-500 group-hover:text-blue-600 flex items-center gap-1">
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Ketuk gambar untuk memperbesar</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {lockedQuestions[currentQuestion.id] && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 flex items-center gap-2 mb-3 font-medium">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Jawaban soal ini telah terkunci permanen karena Anda telah melanjutkan ke soal lain.</span>
                </div>
              )}

              {[
                { letter: 'A', text: currentQuestion.option_a },
                { letter: 'B', text: currentQuestion.option_b },
                { letter: 'C', text: currentQuestion.option_c },
                { letter: 'D', text: currentQuestion.option_d },
              ].map((opt) => {
                const isSelected = selectedAnswer === opt.letter;
                const isLocked = Boolean(lockedQuestions[currentQuestion.id]);
                const correctAnswer = (currentQuestion.correct_answer || '').trim().toUpperCase();
                const isCorrectOption = correctAnswer === opt.letter;
                const isSelectedCorrect = isLocked && isSelected && isCorrectOption;
                const isSelectedWrong = isLocked && isSelected && !isCorrectOption;
                const isMissedCorrect = isLocked && !isSelected && isCorrectOption;

                return (
                  <button
                    key={opt.letter}
                    type="button"
                    disabled={isLocked}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.letter)}
                    className={`w-full min-h-[60px] p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between gap-3.5 select-none ${
                      isLocked
                        ? isSelectedCorrect
                          ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-bold shadow-xs ring-2 ring-emerald-500/20 cursor-default'
                          : isSelectedWrong
                          ? 'border-rose-500 bg-rose-50/95 text-rose-950 font-bold shadow-xs ring-2 ring-rose-500/20 cursor-default animate-shake'
                          : isMissedCorrect
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold border-dashed cursor-default'
                          : 'border-slate-200 bg-slate-50/40 text-slate-400 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50/80 text-slate-900 shadow-xs ring-1 ring-blue-600/30 cursor-pointer active:scale-99'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/70 text-slate-800 cursor-pointer active:scale-99'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center shrink-0 transition-colors ${
                          isLocked
                            ? isSelectedCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isSelectedWrong
                              ? 'bg-rose-600 text-white shadow-xs'
                              : isMissedCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                            : isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {isLocked ? (
                          isSelectedCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : isSelectedWrong ? (
                            <XCircle className="w-5 h-5 text-white" />
                          ) : isMissedCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            opt.letter
                          )
                        ) : (
                          opt.letter
                        )}
                      </div>
                      <div className="text-sm sm:text-base font-medium leading-relaxed">
                        {opt.text}
                      </div>
                    </div>

                    {isLocked && (
                      <div className="shrink-0">
                        {isSelectedCorrect && (
                          <span className="text-[11px] sm:text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Jawaban Benar! 🎉</span>
                          </span>
                        )}
                        {isSelectedWrong && (
                          <span className="text-[11px] sm:text-xs font-black text-rose-800 bg-rose-100 border border-rose-300 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow-2xs">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Jawaban Kurang Tepat</span>
                          </span>
                        )}
                        {isMissedCorrect && (
                          <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                            <span>Kunci Jawaban</span>
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Action to Lock Answer & Unlock In-Depth Explanation */}
            {!lockedQuestions[currentQuestion.id] && selectedAnswer && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200">
                <div className="text-xs text-indigo-900 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Jawaban terpilih: <strong>Opsi {selectedAnswer}</strong>. Kunci untuk membuka pembahasan ilmiah.</span>
                </div>
                <button
                  type="button"
                  onClick={handleLockCurrentQuestion}
                  disabled={minTimeRemaining > 0}
                  className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {minTimeRemaining > 0 ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>BACA SOAL ({minTimeRemaining}S)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>KUNCI JAWABAN & BUKA PEMBAHASAN</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Comprehensive Pedagogical Explanation upon Locking */}
            {lockedQuestions[currentQuestion.id] && currentQuestion.explanation && (
              <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 p-4 sm:p-6 shadow-xs space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-indigo-100 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base text-slate-900 leading-tight">
                        Penjelasan & Pembahasan Akademik
                      </h4>
                      <p className="text-[11px] sm:text-xs text-indigo-700 font-semibold">
                        Materi pembelajaran untuk menambah ilmu dan pemahaman konsep
                      </p>
                    </div>
                  </div>
                  {currentQuestion.correct_answer && (
                    <span className="self-start sm:self-center text-xs font-black px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1 shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Kunci Jawaban: Opsi {currentQuestion.correct_answer}
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-800 font-normal leading-relaxed whitespace-pre-line bg-white/95 backdrop-blur-xs p-3.5 sm:p-5 rounded-xl border border-indigo-100/80 shadow-2xs">
                  {currentQuestion.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Navigation Controls (Hidden on Mobile, handled by bottom bar) */}
          <div className="hidden lg:flex items-center justify-between pt-6 border-t border-slate-100 mt-6 gap-3">
            <button
              type="button"
              onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="h-12 min-w-[150px] px-6 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-100 disabled:opacity-30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-98"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>SEBELUMNYA</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={minTimeRemaining > 0 && !passedMinTimeQuestions[currentQuestion.id] && !lockedQuestions[currentQuestion.id]}
                className="h-12 min-w-[150px] px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {minTimeRemaining > 0 && !passedMinTimeQuestions[currentQuestion.id] && !lockedQuestions[currentQuestion.id] ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>BACA ({minTimeRemaining}s)</span>
                  </>
                ) : (
                  <>
                    <span>BERIKUTNYA</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="h-12 min-w-[150px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>SELESAI UJIAN</span>
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>

        {/* Right: Question Navigation Grid (4 columns on desktop, hidden on mobile) */}
        <aside className="hidden lg:block lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Nomor Soal
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {answeredCount} / {questions.length} Terjawab
            </span>
          </div>

          {/* Grid 1 to 40 */}
          <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isLocked = !!lockedQuestions[q.id];
              const isAnswered = !!answers[q.id];
              const isActive = currentIndex === idx;

              return (
                <button
                  key={q.id}
                  onClick={() => navigateToQuestion(idx)}
                  className={`h-11 w-full rounded-xl font-mono text-xs sm:text-sm font-bold transition-all relative flex items-center justify-center cursor-pointer ${
                    isActive
                      ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-xs'
                      : isLocked
                      ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400/80 hover:bg-emerald-200'
                      : isAnswered
                      ? 'bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                  aria-label={`Buka Soal Nomor ${idx + 1}`}
                >
                  {idx + 1}
                  {isLocked && !isActive && (
                    <Lock className="w-2.5 h-2.5 text-amber-700 absolute top-1 right-1" />
                  )}
                  {isAnswered && !isLocked && !isActive && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3.5 h-3.5 rounded-md bg-blue-600 shrink-0" />
              <span>Soal Sedang Aktif</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-400 shrink-0 flex items-center justify-center">
                <Lock className="w-2 h-2 text-amber-700" />
              </span>
              <span>Jawaban Terkunci</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 shrink-0" />
              <span>Belum Dijawab ({unansweredCount})</span>
            </div>
          </div>

          {/* Selesai Button in Sidebar for Convenience */}
          <button
            onClick={() => setShowSubmitModal(true)}
            className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>KUMPULKAN JAWABAN</span>
          </button>
        </aside>
      </main>

      {/* Ergonomic Mobile Bottom Control Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2.5 shadow-lg">
        <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={() => navigateToQuestion(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="h-12 w-full rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 active:bg-slate-100 disabled:opacity-30 cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMobileDrawer(true)}
            className="h-12 w-full rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer shadow-2xs px-1"
          >
            <LayoutGrid className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">No. {currentIndex + 1} ({answeredCount}/{questions.length})</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => navigateToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
              disabled={minTimeRemaining > 0 && !passedMinTimeQuestions[currentQuestion.id] && !lockedQuestions[currentQuestion.id]}
              className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-98 cursor-pointer shadow-xs"
            >
              {minTimeRemaining > 0 && !passedMinTimeQuestions[currentQuestion.id] && !lockedQuestions[currentQuestion.id] ? (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>({minTimeRemaining}s)</span>
                </>
              ) : (
                <>
                  <span>Lanjut</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 active:scale-98 cursor-pointer shadow-xs"
            >
              <span>Selesai</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Question Grid Drawer / Bottom Sheet */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end lg:hidden">
          <div className="bg-white rounded-t-3xl p-5 max-h-[80vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Daftar Nomor Soal ({answeredCount}/{questions.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid 1 to 40 for mobile */}
            <div className="grid grid-cols-5 gap-2.5 overflow-y-auto py-2 max-h-[50vh] pr-1">
              {questions.map((q, idx) => {
                const isLocked = !!lockedQuestions[q.id];
                const isAnswered = !!answers[q.id];
                const isActive = currentIndex === idx;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      navigateToQuestion(idx);
                      setShowMobileDrawer(false);
                    }}
                    className={`h-12 rounded-xl font-mono text-sm font-bold transition-all relative flex items-center justify-center active:scale-95 ${
                      isActive
                        ? 'ring-2 ring-blue-600 bg-blue-600 text-white shadow-xs'
                        : isLocked
                        ? 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400'
                        : isAnswered
                        ? 'bg-blue-50 text-blue-900 border border-blue-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isLocked && !isActive && (
                      <Lock className="w-3 h-3 text-amber-700 absolute top-1 right-1" />
                    )}
                    {isAnswered && !isLocked && !isActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend & Submit inside drawer */}
            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-400 inline-block" /> {answeredCount} Terjawab
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200 inline-block" /> {unansweredCount} Kosong
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  setShowSubmitModal(true);
                }}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>SELESAI & KUMPULKAN UJIAN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Pause Overlay Modal */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-amber-300 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Coffee className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black">
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>UJIAN SEDANG DIJEDA</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Waktu Ujian Berhenti Sementara
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Silakan istirahat atau selesaikan urusan rumah terlebih dahulu (misal makan / dipanggil orang tua). Seluruh jawaban Anda tetap aman tersimpan di sistem.
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Soal Terakhir Aktif:</span>
                <span className="font-black text-blue-700">Nomor {currentIndex + 1}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Sisa Waktu Ujian:</span>
                <span className="font-mono font-black text-amber-800">{formatTimer(remainingSeconds)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Status Progres:</span>
                <span className="font-bold text-emerald-700">{answeredCount} dari {questions.length} Terjawab</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => handleTogglePause(false)}
              disabled={pauseLoading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm sm:text-base rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {pauseLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memulai Kembali...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>LANJUTKAN MENGERJAKAN SEKARANG</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 font-medium">
              Klik tombol di atas untuk membuka kembali lembar soal dan melanjutkan perhitungan waktu.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Bagian Z) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900 mb-2">
              Konfirmasi Selesai Ujian
            </h3>

            {/* Answered vs Unanswered summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Soal Sudah Dijawab:</span>
                <span className="font-bold text-emerald-700">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Soal Belum Dijawab:</span>
                <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                  {unansweredCount} Soal
                </span>
              </div>
            </div>

            {unansweredCount > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 space-y-1 font-semibold">
                  <div className="flex items-center gap-1.5 text-rose-700 font-black text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Belum Bisa Mengumpulkan!</span>
                  </div>
                  <p className="leading-relaxed">
                    Anda wajib menjawab <strong>seluruh {questions.length} butir soal</strong> hingga tuntas sebelum dapat mengumpulkan ujian ini. Masih ada <strong>{unansweredCount} soal</strong> yang belum terisi.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center active:scale-98"
                  >
                    KEMBALI
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const firstUnansweredIdx = questions.findIndex((q) => !answers[q.id]);
                      if (firstUnansweredIdx !== -1) {
                        navigateToQuestion(firstUnansweredIdx);
                      }
                      setShowSubmitModal(false);
                    }}
                    className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                  >
                    <span>ISI SOAL KOSONG</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 space-y-1 font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Luar Biasa! Semua Soal Terjawab</span>
                  </div>
                  <p className="leading-relaxed">
                    Seluruh {questions.length} butir soal telah berhasil Anda jawab. Apakah Anda yakin ingin mengakhiri dan mengumpulkan ujian sekarang?
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center active:scale-98"
                  >
                    PERIKSA LAGI
                  </button>
                  <button
                    type="button"
                    onClick={() => submitExam(false)}
                    disabled={submitting}
                    className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengumpulkan...</span>
                      </>
                    ) : (
                      'YA, KUMPULKAN'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[92vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs sm:text-sm">Tampilan Detail Ilustrasi Soal</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Tutup</span>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-auto max-h-[82vh] flex items-center justify-center bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedImage}
                alt="Detail Ilustrasi Soal"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
