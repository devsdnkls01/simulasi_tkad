'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Trophy,
  RefreshCw,
  Search,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  Star,
  Award,
  Crown,
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
    { id: 'all', name: 'Semua', icon: '🌟' },
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

  // Initial fetch with cleanup
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const queryParams = new URLSearchParams();
        if (selectedSubject !== 'all') {
          queryParams.set('subject', selectedSubject);
        }
        if (searchQuery.trim()) {
          queryParams.set('search', searchQuery.trim());
        }

        const res = await fetch(`/api/public/leaderboard?${queryParams.toString()}`);
        if (!res.ok) return;

        const data = await res.json();
        if (active && data.success) {
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
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial fetch error:', err);
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [selectedSubject, searchQuery]);

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

  // Arrange podium in 2 - 1 - 3 order for classic champion podium visual
  const top1 = podium.find((p) => p.rank === 1);
  const top2 = podium.find((p) => p.rank === 2);
  const top3 = podium.find((p) => p.rank === 3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Mobile/Desktop App Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 px-3 sm:px-6 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Auto refresh status toggle */}
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black border transition-all cursor-pointer ${
                autoRefresh
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>{autoRefresh ? `${refreshCountdown}s` : 'Jeda'}</span>
            </button>

            {/* Manual refresh button */}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchLeaderboard();
                setRefreshCountdown(10);
              }}
              disabled={loading}
              className="p-1.5 sm:p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-90 disabled:opacity-50 cursor-pointer shadow-xs"
              title="Segarkan data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex-1 w-full space-y-4 sm:space-y-6">
        {/* Compact Header Title */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo-tegal.svg"
              alt="Lambang Kabupaten Tegal"
              width={28}
              height={28}
              priority
              className="object-contain"
            />
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              Papan Prestasi Siswa
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            LEADERBOARD SIMULASI TKA
          </h1>
          <p className="text-xs font-bold text-blue-400">
            {schoolName}
          </p>
        </div>

        {/* Compact 4-Card Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400 truncate">Total Selesai</p>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">{stats.totalPeserta} <span className="text-[10px] font-normal text-slate-400">siswa</span></h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Star className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400 truncate">Top Skor</p>
              <h3 className="text-base sm:text-lg font-black text-amber-300 leading-tight">{stats.highestScore} <span className="text-[10px] font-normal text-slate-400">/ 100</span></h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400 truncate">Rata-Rata</p>
              <h3 className="text-base sm:text-lg font-black text-emerald-300 leading-tight">{stats.averageScore} <span className="text-[10px] font-normal text-slate-400">poin</span></h3>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400 truncate">Ketuntasan</p>
              <h3 className="text-base sm:text-lg font-black text-indigo-300 leading-tight">{stats.passingRate}% <span className="text-[10px] font-normal text-slate-400">({stats.tuntasCount})</span></h3>
            </div>
          </div>
        </div>

        {/* Exciting Gamified 3-Podium (Classic 2 - 1 - 3 Order) */}
        {podium.length > 0 && (
          <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 rounded-2xl p-3 sm:p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">
                  Top 3 Prestasi Terbaik
                </h2>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                Juara Simulasi
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-2">
              {/* #2 Silver (Left) */}
              {top2 ? (
                <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-2 sm:p-3.5 text-center flex flex-col items-center justify-between h-[155px] sm:h-[190px] shadow-sm relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center shadow-md -mt-5 sm:-mt-6 border-2 border-slate-600">
                    🥈 2
                  </div>
                  <div className="w-full my-auto">
                    <p className="font-black text-xs sm:text-sm text-white truncate px-1">
                      {top2.studentName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">
                      {top2.kelas} • {top2.subject}
                    </p>
                  </div>
                  <div className="w-full pt-1.5 border-t border-slate-700/60">
                    <span className="text-base sm:text-xl font-black text-slate-200 block">
                      {top2.score}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold block truncate">
                      {top2.correctAnswers}/{top2.totalQuestions} Benar
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-[155px] sm:h-[190px] border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-600">
                  Posisi 2
                </div>
              )}

              {/* #1 Gold Crown (Center - Tallest) */}
              {top1 ? (
                <div className="bg-gradient-to-b from-amber-950/60 via-slate-850 to-slate-900 border-2 border-amber-400/60 rounded-xl p-2 sm:p-4 text-center flex flex-col items-center justify-between h-[180px] sm:h-[220px] shadow-lg shadow-amber-500/10 relative ring-2 ring-amber-400/20">
                  <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-amber-400 text-slate-950 font-black text-xs sm:text-base flex items-center justify-center shadow-lg -mt-6 sm:-mt-8 border-2 border-amber-200">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900" />
                  </div>
                  <div className="w-full my-auto">
                    <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-400/40 mb-1">
                      🥇 JUARA 1
                    </span>
                    <p className="font-black text-xs sm:text-base text-white truncate px-1">
                      {top1.studentName}
                    </p>
                    <p className="text-[10px] sm:text-xs text-blue-300 font-semibold truncate">
                      {top1.kelas} • {top1.subject}
                    </p>
                  </div>
                  <div className="w-full pt-1.5 border-t border-amber-500/30">
                    <span className="text-xl sm:text-2xl font-black text-amber-300 block">
                      {top1.score}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-300 font-bold block truncate">
                      {top1.correctAnswers}/{top1.totalQuestions} Benar • {top1.durationFormatted}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] sm:h-[220px] border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-600">
                  Posisi 1
                </div>
              )}

              {/* #3 Bronze (Right) */}
              {top3 ? (
                <div className="bg-slate-800/80 border border-amber-900/50 rounded-xl p-2 sm:p-3.5 text-center flex flex-col items-center justify-between h-[145px] sm:h-[180px] shadow-sm relative">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-600 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-md -mt-5 sm:-mt-6 border-2 border-amber-800">
                    🥉 3
                  </div>
                  <div className="w-full my-auto">
                    <p className="font-black text-xs sm:text-sm text-white truncate px-1">
                      {top3.studentName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold truncate">
                      {top3.kelas} • {top3.subject}
                    </p>
                  </div>
                  <div className="w-full pt-1.5 border-t border-slate-700/60">
                    <span className="text-base sm:text-xl font-black text-amber-400 block">
                      {top3.score}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-bold block truncate">
                      {top3.correctAnswers}/{top3.totalQuestions} Benar
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-[145px] sm:h-[180px] border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-600">
                  Posisi 3
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls: Compact Filter Tabs & Search */}
        <div className="space-y-2">
          {/* Scrollable Subject Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {subjectOptions.map((opt) => {
              const isSelected = selectedSubject === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedSubject(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs">{opt.icon}</span>
                  <span>{opt.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Cari nama siswa atau NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Complete Leaderboard: Mobile Card List & Desktop Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <h3 className="font-extrabold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Daftar Lengkap Peringkat Siswa</span>
            </h3>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 font-medium">
                {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
              <p className="text-xs font-bold">Memperbarui papan nilai...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-slate-400 px-4 space-y-2">
              <Award className="w-8 h-8 mx-auto text-slate-600" />
              <h4 className="text-xs sm:text-sm font-bold text-white">Belum Ada Hasil Ujian</h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? `Tidak ada hasil untuk "${searchQuery}".`
                  : 'Data akan tampil segera setelah siswa menyelesaikan simulasi ujian.'}
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Mulai Ujian</span>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile View: High-Impact Compact Ranking Cards */}
              <div className="block sm:hidden divide-y divide-slate-800/80">
                {results.map((r) => {
                  const isTop1 = r.rank === 1;
                  const isTop2 = r.rank === 2;
                  const isTop3 = r.rank === 3;

                  return (
                    <div
                      key={r.id}
                      className={`p-3 flex items-center justify-between gap-2.5 transition-colors ${
                        isTop1
                          ? 'bg-amber-500/10'
                          : isTop2
                          ? 'bg-slate-800/40'
                          : isTop3
                          ? 'bg-amber-900/10'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Left: Rank & Student Info */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                            isTop1
                              ? 'bg-amber-400 text-slate-950 shadow-xs'
                              : isTop2
                              ? 'bg-slate-300 text-slate-950 shadow-xs'
                              : isTop3
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : r.rank}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-black text-xs text-white truncate">
                            {r.studentName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">
                            {r.kelas} • <span className="text-blue-400">{r.subject}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Score & Stats */}
                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1">
                          <span
                            className={`text-base font-black ${
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
                          <span className="text-[9px] text-slate-500">/100</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[9px]">
                          <span className="text-emerald-400 font-bold">{r.correctAnswers}/{r.totalQuestions}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">{r.durationFormatted}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop View: Clean High-Density Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-850 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <th className="py-2.5 px-3 text-center w-12">Rank</th>
                      <th className="py-2.5 px-3">Nama Siswa & Kelas</th>
                      <th className="py-2.5 px-3">Mata Pelajaran</th>
                      <th className="py-2.5 px-3 text-center">Skor</th>
                      <th className="py-2.5 px-3 text-center">Akurasi</th>
                      <th className="py-2.5 px-3 text-center">Waktu</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {results.map((r) => {
                      const isTop1 = r.rank === 1;
                      const isTop2 = r.rank === 2;
                      const isTop3 = r.rank === 3;

                      return (
                        <tr
                          key={r.id}
                          className={`transition-colors hover:bg-slate-800/50 ${
                            isTop1
                              ? 'bg-amber-500/10'
                              : isTop2
                              ? 'bg-slate-800/30'
                              : isTop3
                              ? 'bg-amber-900/10'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-black">
                            {isTop1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-400 text-slate-950 font-black text-xs">
                                🥇 1
                              </span>
                            ) : isTop2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-300 text-slate-950 font-black text-xs">
                                🥈 2
                              </span>
                            ) : isTop3 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-600 text-white font-black text-xs">
                                🥉 3
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">#{r.rank}</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-black text-white text-xs">
                              {r.studentName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {r.kelas} • NISN: {r.nisnMasked}
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300 text-[10px] font-bold">
                              {r.subject}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-sm font-black ${
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

                          <td className="py-2.5 px-3 text-center">
                            <span className="text-[11px] font-semibold text-slate-300">
                              <strong className="text-emerald-400">{r.correctAnswers}</strong>/{r.totalQuestions}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-center text-[11px] text-slate-400">
                            {r.durationFormatted}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                r.score >= 75
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
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
            </>
          )}
        </div>

        {/* Encouragement Footer Banner */}
        <div className="bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-blue-950/60 border border-blue-500/30 rounded-2xl p-3 sm:p-4 text-center space-y-2">
          <p className="text-xs text-blue-200 font-semibold leading-relaxed">
            &ldquo;Latihan konsisten adalah kunci keberhasilan akademik! Terus tingkatkan skormu.&rdquo; ⭐
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Mulai Ujian</span>
            </Link>
            <Link
              href="/materi"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs transition-all inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Modul Belajar</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-[10px] text-slate-500">
        <p>&copy; {new Date().getFullYear()} CBT TKA {schoolName} • Papan Prestasi</p>
      </footer>
    </div>
  );
}
