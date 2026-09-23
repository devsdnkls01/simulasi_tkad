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
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 via-blue-50/40 to-slate-100 flex flex-col justify-center items-center py-3 sm:py-6 px-3 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header Compact */}
        <div className="text-center mb-2.5 sm:mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
              CBT Resmi SD
            </span>
          </div>

          <div className="flex justify-center mb-1">
            <div className="p-1.5 bg-white rounded-xl shadow-2xs border border-slate-200/80 inline-block">
              <Image
                src="/logo-tegal.svg"
                alt="Lambang Kabupaten Tegal"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
            </div>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            SIMULASI TKA SD
          </h2>
          <p className="text-xs font-bold text-blue-700">
            {schoolName}
          </p>
        </div>

        {/* Card Form 1 Layar Pas */}
        <div className="bg-white py-4 sm:py-6 px-4 sm:px-7 shadow-lg shadow-slate-200/50 border border-slate-200/90 rounded-2xl sm:rounded-3xl">
          {error && (
            <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs leading-tight">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Step 1: Grid 2-2 Mata Pelajaran */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  1. Pilih Mata Pelajaran
                </label>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                  {selectedSubject.name}
                </span>
              </div>

              {/* Strict 2x2 Grid on Mobile & Desktop */}
              <div className="grid grid-cols-2 gap-2">
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
                      className={`relative p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30 ring-2 ring-blue-500 ring-offset-1'
                          : 'bg-slate-50 hover:bg-blue-50/50 text-slate-800 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-base" role="img" aria-label={s.name}>
                            {s.icon}
                          </span>
                          <span className={`font-black text-xs sm:text-sm tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {s.name}
                          </span>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-0.5">
                        <span className={`text-[10px] font-medium leading-none truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {s.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Accordion Token Manual */}
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => setShowManualToken(!showManualToken)}
                  className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{showManualToken ? 'Tutup token manual' : 'Token khusus pengawas?'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showManualToken ? 'rotate-180' : ''}`} />
                </button>

                {showManualToken && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <input
                      id="customToken"
                      type="text"
                      maxLength={5}
                      placeholder="TOKEN: ABCDE"
                      value={customToken}
                      onChange={(e) => setCustomToken(e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1 bg-white border border-amber-300 rounded text-slate-900 text-xs font-black tracking-widest uppercase focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Input NISN / Nomor Peserta */}
            <div>
              <label htmlFor="nisn" className="block text-[11px] font-black text-slate-800 uppercase tracking-wider mb-1">
                2. NISN / Nomor Peserta
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm font-bold placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-0.5">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all shadow-md shadow-blue-500/25 hover:shadow-lg active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan Ujian...</span>
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

          {/* Footer Card */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-center">
            <Link
              href="/materi"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center justify-center gap-1 hover:underline"
            >
              <BookOpen className="w-3 h-3" />
              <span>Ruang Belajar & Modul Pembelajaran</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
