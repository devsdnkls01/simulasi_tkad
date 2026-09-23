'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileCheck,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Loader2,
} from 'lucide-react';

interface ExamItem {
  id: string;
  kode_ujian: string;
  nama_ujian: string;
  deskripsi: string | null;
  mata_pelajaran: string;
  kelas: string;
  durasi_menit: number;
  jumlah_soal: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'FINISHED' | 'ARCHIVED';
  randomize_questions: boolean;
  randomize_options: boolean;
  show_result: boolean;
  _count: {
    questions: number;
    exam_sessions: number;
    results: number;
  };
  tokens: {
    id: string;
    token_code: string;
    status: string;
    valid_until: string;
  }[];
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Token Generator Modal state
  const [selectedExamForToken, setSelectedExamForToken] = useState<ExamItem | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [validityHours, setValidityHours] = useState('4');
  const [generatingToken, setGeneratingToken] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState<string | null>(null);

  const fetchExams = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch('/api/admin/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error('Fetch exams error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch('/api/admin/exams');
        if (res.ok && active) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch (err) {
        console.error('Fetch exams error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForToken) return;

    setGeneratingToken(true);
    setGeneratedSuccess(null);

    try {
      const res = await fetch(`/api/admin/exams/${selectedExamForToken.id}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_code: manualToken.trim() || undefined,
          validity_hours: Number(validityHours) || 4,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedSuccess(data.token.token_code);
        setManualToken('');
        await fetchExams();
      } else {
        alert(data.error || 'Gagal menghasilkan token.');
      }
    } catch {
      alert('Terjadi kesalahan saat membuat token.');
    } finally {
      setGeneratingToken(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck className="w-6 h-6 text-blue-600" />
            Manajemen Ujian & Token
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola jadwal ujian, konfigurasi soal, dan pembuatan token 5 digit siswa
          </p>
        </div>

        <button
          onClick={() => fetchExams()}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors self-start sm:self-center"
          title="Muat Ulang"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            Memuat daftar ujian...
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Belum ada ujian yang dibuat.
          </div>
        ) : (
          exams.map((exam) => {
            const activeToken = exam.tokens[0];

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                        {exam.kode_ujian}
                      </span>
                      {exam.status === 'ACTIVE' && (
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ujian Aktif
                        </span>
                      )}
                      {exam.status === 'DRAFT' && (
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                          Draft
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-500">
                        Kelas {exam.kelas}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {exam.nama_ujian}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">{exam.mata_pelajaran}</p>
                  </div>

                  {/* Token Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between sm:justify-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Token Siswa
                      </span>
                      <div className="text-2xl sm:text-3xl font-mono font-black text-blue-700 tracking-widest">
                        {activeToken ? activeToken.token_code : '— — — — —'}
                      </div>
                      {activeToken && (
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Berlaku s/d: {new Date(activeToken.valid_until).toLocaleTimeString('id-ID')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedExamForToken(exam);
                        setGeneratedSuccess(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      Generate Token
                    </button>
                  </div>
                </div>

                {/* Exam Settings & Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Durasi Waktu</span>
                    <strong className="text-slate-800 text-sm">{exam.durasi_menit} Menit</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Jumlah Butir Soal</span>
                    <strong className="text-slate-800 text-sm">{exam._count.questions} Soal</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Peserta Ujian</span>
                    <strong className="text-slate-800 text-sm">{exam._count.exam_sessions} Siswa</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block font-semibold">Selesai Dinilai</span>
                    <strong className="text-slate-800 text-sm">{exam._count.results} Siswa</strong>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Token Generator Modal (Bagian AP) */}
      {selectedExamForToken && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Generate Token 5 Digit
            </h3>
            <p className="text-xs text-slate-600">
              Ujian: <strong>{selectedExamForToken.nama_ujian}</strong>
            </p>

            {generatedSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 uppercase">Token Baru Berhasil Dibuat!</p>
                <div className="text-4xl font-mono font-black tracking-widest text-emerald-950">
                  {generatedSuccess}
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Bagikan 5 digit angka di atas kepada siswa di ruang ujian.
                </p>
                <button
                  onClick={() => setSelectedExamForToken(null)}
                  className="mt-4 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Selesai
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Token Manual (Opsional, kosongkan untuk acak aman)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Kosongkan untuk otomatis 5 digit acak"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm font-mono tracking-wider bg-slate-50 border border-slate-300 rounded-xl text-center"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Masa Berlaku Token
                  </label>
                  <select
                    value={validityHours}
                    onChange={(e) => setValidityHours(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="2">2 Jam</option>
                    <option value="4">4 Jam (Standar Pelaksanaan)</option>
                    <option value="8">8 Jam (Satu Hari Penuh)</option>
                    <option value="24">24 Jam</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedExamForToken(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={generatingToken}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    {generatingToken ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Membuat Token...</span>
                      </>
                    ) : (
                      'GENERATE SEKARANG'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
