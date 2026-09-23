'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  AlertCircle,
  ArrowLeft,
  Loader2,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  ChevronDown,
} from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [nisn, setNisn] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('indo');
  const [customToken, setCustomToken] = useState('');
  const [showManualToken, setShowManualToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01';

  const subjects = [
    {
      id: 'indo',
      name: 'Bahasa Indonesia',
      badge: 'Paket 1 • 30 Soal',
      icon: '📖',
      token: '12345',
      desc: 'Literasi teks sastra & informasi',
    },
    {
      id: 'matematika',
      name: 'Matematika',
      badge: 'Paket 2 • 30 Soal',
      icon: '📐',
      token: '23456',
      desc: 'Numerasi & pemecahan masalah',
    },
    {
      id: 'ipas',
      name: 'IPAS (Sains)',
      badge: 'Paket 3 • 30 Soal',
      icon: '🔬',
      token: '34567',
      desc: 'Sains alam & sosial tematik',
    },
    {
      id: 'gabungan',
      name: 'Gabungan Standar TKA',
      badge: 'Paket 4 • 50 Soal',
      icon: '🏆',
      token: '58321',
      desc: 'Simulasi komprehensif 3 mapel',
    },
  ];

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedNisn = nisn.trim();
    const effectiveToken = showManualToken && customToken.trim()
      ? customToken.trim().toUpperCase()
      : selectedSubject.token;

    if (!trimmedNisn) {
      setError('Harap masukkan NISN atau Nomor Peserta resmi Anda.');
      return;
    }

    if (!effectiveToken) {
      setError('Harap pilih mata pelajaran atau masukkan token ujian.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nisn: trimmedNisn,
          token_code: effectiveToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Data NISN atau Token Ujian tidak valid.');
        return;
      }

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="flex justify-center mb-3">
          <div className="relative p-2.5 bg-white rounded-2xl shadow-xs border border-slate-200/80">
            <Image
              src="/logo-tegal.svg"
              alt="Lambang Kabupaten Tegal"
              width={60}
              height={60}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          MASUK SIMULASI TKA SD
        </h2>
        <p className="mt-1 text-center text-sm font-extrabold text-blue-700">
          {schoolName}
        </p>
        <p className="text-center text-xs text-slate-500 mt-1">
          Pilih mata pelajaran yang ingin dikerjakan lalu masukkan nomor identitas siswa
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-7 px-5 sm:px-9 shadow-lg shadow-slate-200/50 border border-slate-200/90 rounded-3xl">
          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm leading-relaxed">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Gagal Masuk</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Pilih Mata Pelajaran */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  1. Pilih Mata Pelajaran
                </label>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  {selectedSubject.name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subjects.map((s) => {
                  const isSelected = selectedSubjectId === s.id && !showManualToken;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubjectId(s.id);
                        setShowManualToken(false);
                      }}
                      className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 ring-2 ring-blue-500 ring-offset-2'
                          : 'bg-slate-50 hover:bg-blue-50/50 text-slate-800 border-slate-200/90 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" role="img" aria-label={s.name}>
                            {s.icon}
                          </span>
                          <span className={`font-black text-sm tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {s.name}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[11px] font-medium leading-tight ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {s.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Opsi masukkan token kustom manual jika diberikan oleh proktor */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualToken(!showManualToken)}
                  className="text-[11px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{showManualToken ? 'Tutup input token manual' : 'Punya token khusus dari pengawas? Klik di sini'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualToken ? 'rotate-180' : ''}`} />
                </button>

                {showManualToken && (
                  <div className="mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                    <label htmlFor="customToken" className="block text-[11px] font-bold text-amber-900">
                      Masukkan Token Khusus (5 Digit):
                    </label>
                    <input
                      id="customToken"
                      type="text"
                      maxLength={5}
                      placeholder="CONTOH: ABCDE"
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 text-sm font-black tracking-widest uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Input NISN / Nomor Peserta */}
            <div>
              <label htmlFor="nisn" className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                2. NISN / Nomor Peserta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <input
                  id="nisn"
                  type="text"
                  required
                  autoFocus
                  placeholder="Ketik 10 Digit NISN (Contoh: 00xxxxxxxx)"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base font-bold placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 pl-1">
                Gunakan 10 digit NISN atau Nomor Peserta yang tercantum di kartu ujian Anda.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl text-base transition-all shadow-md shadow-blue-500/25 hover:shadow-lg active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Menyiapkan Lembar Soal...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>MULAI UJIAN {selectedSubject.name.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-2.5 text-center">
            <Link
              href="/materi"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center justify-center gap-1.5 py-1 hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Belum siap ujian? Masuk Ruang Belajar & Modul</span>
            </Link>

            <p className="text-[11px] text-slate-400">
              Ujian Terstandar CBT Kemendikdasmen • SD Negeri Kalisalak 01
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
