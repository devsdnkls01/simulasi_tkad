'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, KeyRound, AlertCircle, ArrowLeft, Loader2, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [nisn, setNisn] = useState('');
  const [tokenCode, setTokenCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01';

  const quickTokens = [
    { label: 'B. Indo', token: '12345', badge: 'Paket 1' },
    { label: 'Matematika', token: '23456', badge: 'Paket 2' },
    { label: 'IPAS', token: '34567', badge: 'Paket 3' },
    { label: 'Gabungan', token: '58321', badge: 'Paket 4' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedNisn = nisn.trim();
    const trimmedToken = tokenCode.trim().toUpperCase();

    if (!trimmedNisn) {
      setError('Harap masukkan NISN atau Nomor Peserta.');
      return;
    }

    if (!trimmedToken) {
      setError('Harap masukkan 5-digit Token Ujian.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nisn: trimmedNisn,
          token_code: trimmedToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'NISN atau Token Ujian tidak valid.');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="flex justify-center mb-3">
          <div className="relative p-2 bg-white rounded-2xl shadow-xs border border-slate-200/80">
            <Image
              src="/logo-tegal.svg"
              alt="Lambang Kabupaten Tegal"
              width={64}
              height={64}
              priority
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          MASUK SIMULASI TKA SD
        </h2>
        <p className="mt-1 text-center text-sm font-bold text-blue-700">
          {schoolName}
        </p>
        <p className="text-center text-xs text-slate-500 mt-1">
          Cukup masukkan <strong>NISN</strong> dan <strong>Token Ujian</strong> tanpa password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-md shadow-slate-200/60 border border-slate-200 rounded-3xl">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm leading-relaxed">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Gagal Masuk</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input NISN / Nomor Peserta */}
            <div>
              <label htmlFor="nisn" className="block text-sm font-bold text-slate-800 mb-1.5">
                NISN / Nomor Peserta
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
                  placeholder="Contoh: 0123456781 atau 260001"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-base font-semibold placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all tracking-wider"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1 pl-1">
                Gunakan 10 digit NISN atau Nomor Peserta resmi Anda.
              </p>
            </div>

            {/* Input Token Ujian */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="tokenCode" className="block text-sm font-bold text-slate-800">
                  Token Ujian (5 Digit)
                </label>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                  Diberikan Proktor
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                </div>
                <input
                  id="tokenCode"
                  type="text"
                  required
                  maxLength={5}
                  placeholder="Contoh: 12345"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.toUpperCase())}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-lg font-black tracking-widest placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all uppercase"
                />
              </div>

              {/* Quick Token Selector Pills */}
              <div className="mt-2.5">
                <p className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pilih Cepat Token Mata Pelajaran:</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickTokens.map((item) => (
                    <button
                      key={item.token}
                      type="button"
                      onClick={() => setTokenCode(item.token)}
                      className={`text-left px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        tokenCode === item.token
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                        tokenCode === item.token ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                      }`}>
                        {item.token}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-2xl text-base transition-all shadow-md shadow-blue-500/25 hover:shadow-lg active:scale-98 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memverifikasi Token & Akun...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>MASUK & MULAI UJIAN</span>
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
