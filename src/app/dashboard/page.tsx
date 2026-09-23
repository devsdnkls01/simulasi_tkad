'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  LogOut,
  Clock,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileQuestion,
  Award,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface StudentData {
  id: string;
  nomor_peserta: string;
  nama_lengkap: string;
  kelas: string;
  rombel: string | null;
  nis: string | null;
  nisn: string | null;
  foto_url: string | null;
}

interface ExamItem {
  id: string;
  kode_ujian: string;
  nama_ujian: string;
  deskripsi: string | null;
  mata_pelajaran: string;
  kelas: string;
  durasi_menit: number;
  jumlah_soal: number;
  status: string;
  session_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'TIME_EXPIRED';
  session_id: string | null;
  has_result: boolean;
  score: number | null;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Token Modal State
  const [selectedExam, setSelectedExam] = useState<ExamItem | null>(null);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [validatingToken, setValidatingToken] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const studentRes = await fetch('/api/auth/student/me');
        if (!studentRes.ok) {
          router.push('/login');
          return;
        }
        const studentData = await studentRes.json();
        setStudent(studentData.student);

        const examsRes = await fetch('/api/exams/available');
        if (examsRes.ok) {
          const examsData = await examsRes.json();
          setExams(examsData.exams || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/student/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleOpenTokenModal = (exam: ExamItem) => {
    setSelectedExam(exam);
    setTokenInput('');
    setTokenError(null);
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    if (!tokenInput.trim() || tokenInput.trim().length !== 5 || !/^\d{5}$/.test(tokenInput.trim())) {
      setTokenError('Token harus tepat 5 digit angka.');
      return;
    }

    setValidatingToken(true);
    setTokenError(null);

    try {
      const res = await fetch(`/api/exams/${selectedExam.id}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setTokenError(data.error || 'Token tidak valid.');
        return;
      }

      // Token is valid! Navigate to Instructions page
      router.push(`/exam/${selectedExam.id}/instructions?tokenId=${data.tokenId}`);
    } catch {
      setTokenError('Gagal memvalidasi token. Periksa koneksi internet Anda.');
    } finally {
      setValidatingToken(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat data peserta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Logo
            size={44}
            schoolName={process.env.NEXT_PUBLIC_SCHOOL_NAME}
            subtitle="SIMULASI TKA/TKAD SD"
          />

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Student Welcome Card */}
        {student && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-wider text-blue-600 uppercase">
                  Selamat Datang
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {student.nama_lengkap}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-600">
                  <span>
                    No. Peserta: <strong className="text-slate-800">{student.nomor_peserta}</strong>
                  </span>
                  <span>
                    Kelas: <strong className="text-slate-800">{student.kelas}</strong>
                  </span>
                  {student.nisn && (
                    <span>
                      NISN: <strong className="text-slate-800">{student.nisn}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 self-start sm:self-center">
              <CheckCircle2 className="w-4 h-4" />
              Akun Aktif
            </div>
          </div>
        )}

        {/* Ruang Belajar & Peningkatan Akademik Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 rounded-3xl p-6 sm:p-7 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5 border border-blue-400/30">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pusat Belajar & Materi Akademik SD</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Tingkatkan Pemahaman & Nilai Akademikmu
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Pelajari rangkuman konsep penting Bahasa Indonesia, rumus praktis Matematika, materi sains IPAS, serta coba kuis latihan mandiri dengan pembahasan lengkap!
            </p>
          </div>

          <button
            onClick={() => router.push('/materi')}
            className="h-12 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Buka Modul Belajar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Exams Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-blue-600" />
            Paket Simulasi Ujian TKA Tersedia
          </h3>

          {exams.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-base text-slate-600 font-medium">
                Tidak ada ujian yang tersedia saat ini.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Silakan tanyakan kepada pengawas atau guru jika ujian dijadwalkan sekarang.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                        {exam.kode_ujian}
                      </span>
                      {exam.session_status === 'IN_PROGRESS' && (
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200 animate-pulse">
                          Sedang Dikerjakan
                        </span>
                      )}
                      {(exam.session_status === 'SUBMITTED' || exam.session_status === 'TIME_EXPIRED') && (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                          Selesai
                        </span>
                      )}
                      {exam.session_status === 'NOT_STARTED' && (
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-xs">
                          Belum Dimulai
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-slate-900">{exam.nama_ujian}</h4>
                    <p className="text-xs sm:text-sm text-slate-600">{exam.mata_pelajaran}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {exam.durasi_menit} Menit
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileQuestion className="w-4 h-4 text-slate-400" />
                        {exam.jumlah_soal} Butir Soal
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {exam.session_status === 'NOT_STARTED' && (
                      <button
                        onClick={() => handleOpenTokenModal(exam)}
                        className="w-full sm:w-auto h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>MASUK UJIAN</span>
                      </button>
                    )}

                    {exam.session_status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => router.push(`/exam/${exam.id}`)}
                        className="w-full sm:w-auto h-12 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>LANJUTKAN UJIAN</span>
                      </button>
                    )}

                    {(exam.session_status === 'SUBMITTED' || exam.session_status === 'TIME_EXPIRED') && (
                      <button
                        onClick={() => router.push(`/exam/${exam.id}/result`)}
                        className="w-full sm:w-auto h-12 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-slate-200"
                      >
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>LIHAT HASIL</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 5-Digit Token Input Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Validasi Masuk</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedExam.nama_ujian}</h3>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Masukkan <strong>Token 5 Digit</strong> yang diberikan oleh pengawas atau guru di ruangan ujian.
            </p>

            {tokenError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-red-700 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{tokenError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyToken} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  TOKEN UJIAN (5 DIGIT ANGKA)
                </label>
                <input
                  type="text"
                  maxLength={5}
                  autoFocus
                  required
                  placeholder="Contoh: 58321"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl sm:text-3xl font-mono tracking-widest py-3 bg-slate-50 border-2 border-blue-500/50 rounded-xl text-slate-900 font-bold focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all placeholder:text-slate-300 placeholder:text-xl"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExam(null)}
                  className="flex-1 h-12 px-4 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer active:scale-98"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={validatingToken || tokenInput.length !== 5}
                  className="flex-1 h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {validatingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    'KONFIRMASI'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
