'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Clock,
  FileQuestion,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

interface StudentInfo {
  id: string;
  nomor_peserta: string;
  nama_lengkap: string;
  kelas: string;
}

export default function ExamInstructionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('tokenId');
  const { id: examId } = use(params);

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudent() {
      try {
        const res = await fetch('/api/auth/student/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setStudent(data.student);
      } catch {
        setError('Gagal memuat profil siswa.');
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [router]);

  const handleStartExam = async () => {
    setStarting(true);
    setError(null);

    try {
      const res = await fetch(`/api/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.status === 'SUBMITTED' || data.status === 'TIME_EXPIRED') {
          router.push(`/exam/${examId}/result`);
          return;
        }
        setError(data.error || 'Gagal memulai ujian.');
        setStarting(false);
        return;
      }

      // Navigate to active exam workspace
      router.push(`/exam/${examId}`);
    } catch {
      setError('Terjadi kendala jaringan saat memulai ujian.');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat petunjuk ujian...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
          <Logo
            size={46}
            schoolName={process.env.NEXT_PUBLIC_SCHOOL_NAME}
            subtitle="SIMULASI TKA/TKAD SD"
          />

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
            Token Terverifikasi
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Instructions Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              PETUNJUK PELAKSANAAN UJIAN
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Harap baca setiap peraturan di bawah ini dengan saksama sebelum menekan tombol mulai.
            </p>
          </div>

          <ol className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed list-decimal list-inside">
            <li className="font-medium">Bacalah setiap soal dengan teliti dan teliti setiap pilihan jawaban.</li>
            <li className="font-medium">Pilih satu opsi jawaban yang dianggap paling benar.</li>
            <li className="font-medium">
              Jawaban Anda akan <strong className="text-blue-700">tersimpan secara otomatis</strong> ke server setiap kali Anda memilih opsi.
            </li>
            <li className="font-medium">Jangan menutup tab atau jendela peramban selama ujian berlangsung.</li>
            <li className="font-medium">
              Durasi waktu pengerjaan adalah <strong className="text-slate-900">105 menit</strong>.
            </li>
            <li className="font-medium">
              Setelah waktu habis, ujian akan <strong className="text-red-600">otomatis berakhir</strong> dan jawaban terakhir Anda akan dihitung.
            </li>
            <li className="font-medium">Pastikan koneksi internet perangkat Anda tetap stabil.</li>
          </ol>

          {/* Student & Exam Metadata Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Nama Siswa</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{student?.nama_lengkap}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Nomor Peserta</p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{student?.nomor_peserta}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Durasi Ujian</p>
              <p className="text-sm font-bold text-blue-700 mt-0.5 flex items-center gap-1">
                <Clock className="w-4 h-4" /> 105 Menit
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Jumlah Soal</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <FileQuestion className="w-4 h-4" /> 40 Butir
              </p>
            </div>
          </div>

          {/* Notice: Server timer begins on button press */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Perhatian:</strong> Timer hitung mundur 105 menit akan <strong>langsung dimulai</strong> di server tepat setelah Anda menekan tombol di bawah ini.
            </p>
          </div>

          {/* Confirmation Button */}
          <div className="pt-2">
            <button
              onClick={handleStartExam}
              disabled={starting}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base sm:text-lg transition-all shadow-md shadow-blue-600/20 hover:shadow-lg active:scale-98 disabled:opacity-60 flex items-center justify-center gap-3 cursor-pointer"
            >
              {starting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Mempersiapkan Lembar Soal & Timer...</span>
                </>
              ) : (
                <>
                  <span>SAYA SIAP — MULAI UJIAN</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
