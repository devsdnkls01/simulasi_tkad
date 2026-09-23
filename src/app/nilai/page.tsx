'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Search,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Flame,
  Star,
} from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  rank: number;
  studentName: string;
  kelas: string;
  nisnMasked: string;
  examName: string;
  subject: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  totalQuestions: number;
  durationFormatted: string;
  durationSeconds: number;
  finishedAt: string;
  predikat: string;
  predikatColor: string;
}

interface StatsData {
  totalPeserta: number;
  highestScore: number;
  averageScore: number;
  tuntasCount: number;
  passingRate: number;
}

export default function PublicLeaderboardPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<LeaderboardEntry[]>([]);
  const [podium, setPodium] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalPeserta: 0,
    highestScore: 0,
    averageScore: 0,
    tuntasCount: 0,
    passingRate: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);

  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01';

  const subjectOptions = [
    { id: 'all', name: 'Semua Mapel', icon: '🌟' },
    { id: 'indo', name: 'B. Indonesia', icon: '📖' },
    { id: 'matematika', name: 'Matematika', icon: '📐' },
    { id: 'ipas', name: 'IPAS (Sains)', icon: '🔬' },
    { id: 'gabungan', name: 'Gabungan TKA', icon: '🏆' },
  ];

  const fetchLeaderboard = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedSubject !== 'all') {
        queryParams.set('subject', selectedSubject);
      }
      if (searchQuery.trim()) {
        queryParams.set('search', searchQuery.trim());
      }

      const res = await fetch(`/api/public/leaderboard?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Gagal mengambil data nilai');

      const data = await res.json();
      if (data.success) {
        setResults(data.results || []);
        setPodium(data.podium || []);
        setStats(
          data.stats || {
            totalPeserta: 0,
            highestScore: 0,
            averageScore: 0,
            tuntasCount: 0,
            passingRate: 0,
          }
        );
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, searchQuery]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Auto-refresh interval (10 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchLeaderboard();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/85 border-b border-slate-700/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/80 text-xs font-bold transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Beranda CBT</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Auto refresh status badge */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Klik untuk menyalakan/mematikan pembaruan otomatis"
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{autoRefresh ? `Realtime (${refreshCountdown}d)` : 'Jeda Realtime'}</span>
            </button>

            {/* Manual refresh button */}
            <button
              onClick={() => {
                setLoading(true);
                fetchLeaderboard();
                setRefreshCountdown(10);
              }}
              disabled={loading}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Segarkan data sekarang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 w-full space-y-8">
        {/* Hero Banner with School Emblem & Title */}
        <div className="text-center relative">
          <div className="flex justify-center mb-3">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-400/30 backdrop-blur-xs inline-block">
              <Image
                src="/logo-tegal.svg"
                alt="Lambang Kabupaten Tegal"
                width={52}
                height={52}
                priority
                className="object-contain drop-shadow-md"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-extrabold mb-2 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Papan Prestasi & Nilai Publik Siswa</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            HALL OF FAME SIMULASI TKA
          </h1>
          <p className="text-sm sm:text-base font-bold text-blue-400 mt-1">
            {schoolName} • Tahun Ajaran 2026/2027
          </p>
          <p className="text-xs text-slate-400 max-w-xl mx-auto mt-2 leading-relaxed">
            Daftar peringkat dan skor capaian simulasi ujian akademik siswa. Data diperbarui secara langsung untuk mengapresiasi kerja keras dan menyemangati seluruh anak-anak! 🌟
          </p>
        </div>

        {/* Live Summary Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg shadow-black/20">
            <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Ujian Selesai</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.totalPeserta} <span className="text-xs font-normal text-slate-400">Siswa</span></h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg shadow-black/20">
            <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nilai Tertinggi (Top)</p>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">{stats.highestScore} <span className="text-xs font-normal text-slate-400">/ 100</span></h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg shadow-black/20">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rata-Rata Nilai</p>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{stats.averageScore} <span className="text-xs font-normal text-slate-400">Poin</span></h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-lg shadow-black/20">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tingkat Ketuntasan</p>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-300 mt-0.5">{stats.passingRate}% <span className="text-xs font-normal text-slate-400">({stats.tuntasCount} Tuntas)</span></h3>
            </div>
          </div>
        </div>

        {/* Top 3 Hall of Fame Podium */}
        {podium.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  🏆 Podium 3 Besar Terbaik
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-400">
                Peringkat Tertinggi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {podium.map((p, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                let cardStyle = 'border-amber-400/40 bg-gradient-to-b from-amber-950/40 via-slate-800 to-slate-850 ring-1 ring-amber-400/30';
                let medalBadge = 'bg-amber-400 text-slate-950';
                let medalTitle = 'JUARA 1 • EMAS';
                let trophyIcon = '🥇';

                if (isSecond) {
                  cardStyle = 'border-slate-400/40 bg-gradient-to-b from-slate-700/40 via-slate-800 to-slate-850';
                  medalBadge = 'bg-slate-300 text-slate-950';
                  medalTitle = 'JUARA 2 • PERAK';
                  trophyIcon = '🥈';
                } else if (isThird) {
                  cardStyle = 'border-amber-700/40 bg-gradient-to-b from-amber-900/20 via-slate-800 to-slate-850';
                  medalBadge = 'bg-amber-600 text-white';
                  medalTitle = 'JUARA 3 • PERUNGGU';
                  trophyIcon = '🥉';
                }

                return (
                  <div
                    key={p.id}
                    className={`relative p-5 rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between ${cardStyle}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${medalBadge}`}>
                        {trophyIcon} {medalTitle}
                      </span>
                      <span className="text-2xl font-black text-amber-300">{p.score}</span>
                    </div>

                    <div className="my-2">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        {p.studentName}
                      </h3>
                      <p className="text-xs text-blue-300 font-semibold mt-0.5">
                        {p.kelas} • {p.subject}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-700/60 mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {p.correctAnswers} Benar / {p.totalQuestions}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {p.durationFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="space-y-3">
          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjectOptions.map((opt) => {
              const isSelected = selectedSubject === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedSubject(opt.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Cari nama siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-slate-800 transition-all"
            />
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="bg-slate-850 border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-800/60">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-blue-400" />
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Daftar Peringkat Nilai Siswa
              </h3>
            </div>
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 font-medium">
                Update: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-sm font-bold">Memperbarui papan nilai realtime...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-slate-400 px-4">
              <Award className="w-12 h-12 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Belum Ada Data Nilai Tersedia</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ada siswa dengan kata kunci "${searchQuery}". Coba gunakan nama lain.`
                  : 'Hasil ujian akan otomatis tampil di papan prestasi ini segera setelah siswa menyelesaikan simulasi ujian.'}
              </p>
              <div className="mt-5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-md"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Mulai Ujian Sekarang</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-800 text-slate-400 font-bold uppercase text-[11px] tracking-wider border-b border-slate-700">
                    <th className="py-3.5 px-4 text-center w-16">Rank</th>
                    <th className="py-3.5 px-4">Nama Siswa & Kelas</th>
                    <th className="py-3.5 px-4">Mata Pelajaran</th>
                    <th className="py-3.5 px-4 text-center">Skor</th>
                    <th className="py-3.5 px-4 text-center hidden sm:table-cell">Akurasi Soal</th>
                    <th className="py-3.5 px-4 text-center hidden md:table-cell">Waktu</th>
                    <th className="py-3.5 px-4 text-right">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {results.map((r) => {
                    const isTop1 = r.rank === 1;
                    const isTop2 = r.rank === 2;
                    const isTop3 = r.rank === 3;

                    return (
                      <tr
                        key={r.id}
                        className={`transition-colors hover:bg-slate-800/80 ${
                          isTop1
                            ? 'bg-amber-500/10'
                            : isTop2
                            ? 'bg-slate-700/20'
                            : isTop3
                            ? 'bg-amber-900/10'
                            : ''
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-4 text-center font-black">
                          {isTop1 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-950 text-xs shadow-md">
                              🥇 1
                            </span>
                          ) : isTop2 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-950 text-xs shadow-md">
                              🥈 2
                            </span>
                          ) : isTop3 ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-600 text-white text-xs shadow-md">
                              🥉 3
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">#{r.rank}</span>
                          )}
                        </td>

                        {/* Student Name */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-white text-xs sm:text-sm">
                            {r.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            {r.kelas} • NISN: {r.nisnMasked}
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-blue-300 text-[11px] font-bold">
                            {r.subject}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-base sm:text-lg font-black ${
                              r.score >= 90
                                ? 'text-emerald-400'
                                : r.score >= 75
                                ? 'text-blue-400'
                                : r.score >= 60
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {r.score}
                          </span>
                        </td>

                        {/* Accuracy */}
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <span className="text-xs font-semibold text-slate-300">
                            <strong className="text-emerald-400">{r.correctAnswers}</strong> / {r.totalQuestions}
                          </span>
                        </td>

                        {/* Duration */}
                        <td className="py-3.5 px-4 text-center hidden md:table-cell text-xs text-slate-400 font-medium">
                          {r.durationFormatted}
                        </td>

                        {/* Predikat */}
                        <td className="py-3.5 px-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              r.score >= 90
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : r.score >= 75
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                                : r.score >= 60
                                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                                : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {r.score >= 75 ? 'Tuntas' : 'Belum Tuntas'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Motivation Card for Kids */}
        <div className="bg-gradient-to-r from-blue-900/60 via-indigo-900/50 to-blue-950/60 border border-blue-500/30 rounded-3xl p-6 text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-2 bg-blue-500/20 rounded-full text-amber-300">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Teruslah Belajar & Berlatih! 🚀
          </h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mx-auto leading-relaxed">
            &ldquo;Setiap butir soal yang kamu pelajari dan setiap simulasi yang kamu ikuti adalah langkah nyata menuju masa depan yang gemilang. Jangan ragu mencoba lagi untuk meraih skor terbaik!&rdquo;
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 active:scale-95 inline-flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Ikuti Simulasi Ujian</span>
            </Link>
            <Link
              href="/materi"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-extrabold text-xs sm:text-sm transition-all inline-flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Buka Modul Belajar</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} CBT TKA {schoolName} • Papan Prestasi Realtime</p>
      </footer>
    </div>
  );
}
