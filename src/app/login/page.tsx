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
  Trophy,
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
      name: 'B. Indonesia',
      fullName: 'Bahasa Indonesia',
      badge: 'Paket 1 • 30 Soal',
      icon: '📖',
      token: '12345',
    },
    {
      id: 'matematika',
      name: 'Matematika',
      fullName: 'Matematika',
      badge: 'Paket 2 • 30 Soal',
      icon: '📐',
      token: '23456',
    },
    {
      id: 'ipas',
      name: 'IPAS (Sains)',
      fullName: 'IPAS (Sains)',
      badge: 'Paket 3 • 30 Soal',
      icon: '🔬',
      token: '34567',
    },
    {
      id: 'gabungan',
      name: 'Gabungan TKA',
      fullName: 'Gabungan Standar TKA',
      badge: 'Paket 4 • 50 Soal',
      icon: '🏆',
      token: '58321',
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
    <div className="min-h-dvh bg-gradient-to-b from-slate-100 via-blue-50/70 to-slate-100 flex flex-col justify-between py-2 sm:py-6">
      {/* Top Mobile/Desktop App Bar */}
      <header className="w-full max-w-xl mx-auto px-4 pt-1 sm:pt-2 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-700 hover:text-blue-600 border border-slate-200/90 text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Beranda</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-700 border border-blue-200/80 text-[11px] font-extrabold tracking-wide uppercase shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            CBT Online Resmi
          </span>
        </div>
      </header>

      {/* Main Form Section - Fills Viewport Harmoniously */}
      <main className="w-full max-w-lg mx-auto px-4 py-2 sm:py-4 flex-1 flex flex-col justify-center">
        {/* Card Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-slate-200/70 border border-slate-200/90">
          {/* Logo & School Header */}
          <div className="text-center mb-4 sm:mb-5">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo-tegal.svg"
                alt="Lambang Kabupaten Tegal"
                width={48}
                height={48}
                priority
                className="object-contain drop-shadow-sm"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              MASUK SIMULASI TKA SD
            </h1>
            <p className="text-xs sm:text-sm font-bold text-blue-700 tracking-wide mt-0.5">
              {schoolName}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Pilih paket mata pelajaran dan masukkan nomor identitas siswa.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-semibold leading-snug">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Grid 2-2 Mata Pelajaran */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  1. Pilih Mata Pelajaran
                </label>
                <span className="text-[11px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {selectedSubject.name}
                </span>
              </div>

              {/* 2x2 Grid Layout */}
              <div className="grid grid-cols-2 gap-2.5">
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
                      className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[72px] sm:min-h-[80px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-600 shadow-md shadow-blue-600/30 ring-2 ring-blue-500 ring-offset-2'
                          : 'bg-slate-50 hover:bg-blue-50/60 text-slate-800 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" role="img" aria-label={s.name}>
                            {s.icon}
                          </span>
                          <div>
                            <span className={`block font-black text-xs sm:text-sm tracking-tight leading-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                              {s.name}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] font-semibold tracking-wide ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {s.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accordion Token Khusus Pengawas */}
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowManualToken(!showManualToken)}
                  className="text-[11px] font-bold text-slate-500 hover:text-blue-700 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                  <span>{showManualToken ? 'Tutup input token manual' : 'Punya token khusus dari pengawas?'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualToken ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showManualToken && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in duration-200">
                  <label htmlFor="customToken" className="block text-[10px] font-black text-amber-900 uppercase tracking-wider mb-1">
                    Token Khusus Dari Pengawas
                  </label>
                  <input
                    id="customToken"
                    type="text"
                    maxLength={5}
                    placeholder="CONTOH: 58321"
                    value={customToken}
                    onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-slate-900 text-xs font-black tracking-widest uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Input NISN / Nomor Peserta */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="nisn" className="block text-[11px] font-black text-slate-700 uppercase tracking-wider">
                  2. NISN / Nomor Peserta
                </label>
                <span className="text-[10px] text-slate-400 font-medium">10 Digit Angka</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  id="nisn"
                  type="text"
                  required
                  autoFocus
                  placeholder="Ketik 10 Digit NISN (Contoh: 00xxxxxxxx)"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Gunakan 10 digit NISN atau Nomor Peserta yang tercantum di kartu ujian.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-13 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white font-black rounded-2xl text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Lembar Ujian...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>MULAI UJIAN {selectedSubject.name.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Links: Modul & Papan Nilai */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/nilai"
              className="px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-amber-300/70 shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Papan Nilai Siswa</span>
            </Link>
            <Link
              href="/materi"
              className="px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-blue-200/60"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Modul Belajar TKA</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer Info / Support */}
      <footer className="w-full max-w-xl mx-auto px-4 pb-3 sm:pb-5 text-center">
        <p className="text-[11px] font-medium text-slate-400 sm:text-slate-500">
          Ada kendala login? Hubungi Pengawas Ujian di ruangan Anda.
        </p>
        <p className="text-[10px] text-slate-500/70 sm:text-slate-400 mt-0.5">
          &copy; {new Date().getFullYear()} CBT TKA {schoolName}
        </p>
      </footer>
    </div>
  );
}
