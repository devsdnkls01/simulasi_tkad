'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from 'lucide-react';

interface QuestionReviewItem {
  display_number: number;
  question_text: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  student_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  is_unanswered: boolean;
}

interface ResultData {
  show_result: boolean;
  student: {
    nama_lengkap: string;
    nomor_peserta: string;
    kelas: string;
  };
  exam: {
    nama_ujian: string;
    mata_pelajaran: string;
  };
  result: {
    total_questions: number;
    correct_answers: number;
    wrong_answers: number;
    unanswered: number;
    score: number;
    duration_used: number;
    finished_at: string;
  } | null;
  reviews?: QuestionReviewItem[];
}

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

export default function ExamResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: examId } = use(params);

  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Filter State
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expandedQuestion, setExpandedQuestion] = useState<{ [num: number]: boolean }>({});

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/exams/${examId}/result`);
        const resData = await res.json();
        if (!res.ok) {
          setError(resData.error || 'Gagal memuat hasil ujian.');
          return;
        }
        setData(resData);
      } catch {
        setError('Gagal menghubungi server.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [examId]);

  const toggleExpand = (num: number) => {
    setExpandedQuestion((prev) => ({ ...prev, [num]: !prev[num] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Menghitung hasil dan menyiapkan pembahasan ujian...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Hasil Belum Tersedia</h2>
          <p className="text-sm text-slate-600">{error || 'Data hasil ujian tidak ditemukan.'}</p>
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

  const durationMinutes = data.result?.duration_used
    ? Math.ceil(data.result.duration_used / 60)
    : 0;

  const filteredReviews = (data.reviews || []).filter((q) => {
    if (reviewFilter === 'wrong') return !q.is_correct;
    if (reviewFilter === 'correct') return q.is_correct;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-start py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <Image
                src="/logo-tegal.svg"
                alt="Lambang Kabupaten Tegal"
                width={70}
                height={70}
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            HASIL & PEMBAHASAN SIMULASI TKA
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-blue-700">
            {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01'}
          </p>
        </div>

        {/* Result Summary Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Student & Exam Info */}
          <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Nama Peserta</p>
              <h2 className="text-lg font-extrabold text-slate-900">{data.student.nama_lengkap}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>No. Peserta: <strong className="text-slate-800">{data.student.nomor_peserta}</strong></span>
                <span>Kelas: <strong className="text-slate-800">{data.student.kelas}</strong></span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ujian Selesai
              </span>
              <p className="text-xs font-semibold text-slate-600 mt-1.5">{data.exam.nama_ujian}</p>
            </div>
          </div>

          {/* Score Highlight Box */}
          {data.show_result && data.result ? (
            <>
              <div className="text-center py-6 bg-gradient-to-b from-blue-50/70 via-sky-50/40 to-slate-50 rounded-2xl border border-blue-100 space-y-1">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  NILAI CAPAIAN AKADEMIK
                </p>
                <div className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
                  {data.result.score}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {data.result.score >= 80 ? '🎉 Luar Biasa! Pemahaman materi sangat mantap.' : data.result.score >= 60 ? '👍 Bagus! Terus tingkatkan pada materi yang salah.' : '💪 Tetap Semangat! Pelajari pembahasan dan modul belajar di bawah ini.'}
                </p>
              </div>

              {/* Statistics Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-900">
                    {data.result.correct_answers}
                  </p>
                </div>

                <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-red-700 font-bold text-xs mb-1">
                    <XCircle className="w-3.5 h-3.5" /> Salah
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-red-900">
                    {data.result.wrong_answers}
                  </p>
                </div>

                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-3 text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-600 font-bold text-xs mb-1">
                    <HelpCircle className="w-3.5 h-3.5" /> Kosong
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-slate-800">
                    {data.result.unanswered}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Total Butir Soal: <strong>{data.result.total_questions}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Waktu Pengerjaan: <strong>{durationMinutes} Menit</strong>
                </span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">
                Jawaban Anda telah tersimpan dan terekam di sistem.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push('/materi')}
              className="h-12 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Ruang Belajar & Modul</span>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DETAILED QUESTION REVIEW & PEMBAHASAN SECTION             */}
        {/* ========================================================= */}
        {data.show_result && data.reviews && data.reviews.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Pembahasan Lengkap Setiap Soal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pelajari jawaban benar dan logika pembahasan untuk setiap butir soal.
                  </p>
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setReviewFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === 'all' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({data.reviews.length})
                </button>
                <button
                  onClick={() => setReviewFilter('wrong')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === 'wrong' ? 'bg-red-50 text-red-700 shadow-xs' : 'text-slate-600 hover:text-red-700'
                  }`}
                >
                  Salah / Kosong ({data.reviews.filter((r) => !r.is_correct).length})
                </button>
                <button
                  onClick={() => setReviewFilter('correct')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    reviewFilter === 'correct' ? 'bg-emerald-50 text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Benar ({data.reviews.filter((r) => r.is_correct).length})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredReviews.map((q) => {
                const isExpanded = expandedQuestion[q.display_number] !== false; // default expanded
                const images = parseImageUrls(q.image_url);

                return (
                  <div
                    key={q.display_number}
                    className={`rounded-2xl border-2 transition-all p-4 sm:p-5 space-y-4 ${
                      q.is_correct
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : q.is_unanswered
                        ? 'border-slate-200 bg-slate-50/50'
                        : 'border-red-200 bg-red-50/20'
                    }`}
                  >
                    {/* Item Header */}
                    <div
                      onClick={() => toggleExpand(q.display_number)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                          {q.display_number}
                        </span>
                        {q.is_correct ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban Anda Benar ({q.student_answer})
                          </span>
                        ) : q.is_unanswered ? (
                          <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" /> Tidak Dijawab • Kunci: {q.correct_answer}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Salah (Pilihan: {q.student_answer}) • Kunci: {q.correct_answer}
                          </span>
                        )}
                      </div>

                      <button className="text-slate-400 hover:text-slate-600">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Expandable Body */}
                    {isExpanded && (
                      <div className="space-y-4 pt-2 border-t border-slate-200/60">
                        {/* Question Text */}
                        <div className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                          {q.question_text}
                        </div>

                        {/* Images if any */}
                        {images.length > 0 && (
                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto">
                            {images.map((src, idx) => (
                              <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 bg-white p-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src}
                                  alt={`Ilustrasi Soal ${q.display_number}`}
                                  className="w-full object-contain max-h-56"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Options List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                          {[
                            { key: 'A', text: q.option_a },
                            { key: 'B', text: q.option_b },
                            { key: 'C', text: q.option_c },
                            { key: 'D', text: q.option_d },
                          ].map((opt) => {
                            const isStudentChoice = q.student_answer === opt.key;
                            const isCorrectKey = q.correct_answer === opt.key;

                            let optClass = 'border-slate-200 bg-white text-slate-700';
                            if (isCorrectKey) {
                              optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                            } else if (isStudentChoice && !isCorrectKey) {
                              optClass = 'border-red-400 bg-red-50 text-red-900 line-through';
                            }

                            return (
                              <div
                                key={opt.key}
                                className={`p-3 rounded-xl border-2 flex items-center gap-2.5 ${optClass}`}
                              >
                                <div
                                  className={`w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center shrink-0 ${
                                    isCorrectKey
                                      ? 'bg-emerald-600 text-white'
                                      : isStudentChoice
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {opt.key}
                                </div>
                                <span className="flex-1 font-medium">{opt.text}</span>
                                {isCorrectKey && (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm shrink-0">
                                    Kunci Benar
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
