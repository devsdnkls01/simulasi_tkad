'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Clock,
  CheckCircle2,
  Activity,
  KeyRound,
  FileCheck,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  activeExam: {
    id: string;
    kode_ujian: string;
    nama_ujian: string;
    mata_pelajaran: string;
    durasi_menit: number;
    jumlah_soal: number;
    active_token: string | null;
  } | null;
  stats: {
    notStarted: number;
    inProgress: number;
    finished: number;
    averageScore: number;
  };
  classDistribution: { kelas: string; count: number }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/overview');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Memuat statistik dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Utama
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan aktivitas simulasi TKA/TKAD Sekolah Dasar
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/monitoring"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
          >
            <Activity className="w-4 h-4" />
            <span>Pantau Ujian Realtime</span>
          </Link>
        </div>
      </div>

      {/* 4 Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Peserta</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{data?.totalStudents ?? 0}</div>
          <p className="text-xs text-slate-500">
            {data?.activeStudents ?? 0} Siswa berstatus aktif
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Sedang Mengerjakan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{data?.stats.inProgress ?? 0}</div>
          <p className="text-xs text-slate-500">Siswa sedang aktif ujian</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Selesai Mengerjakan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{data?.stats.finished ?? 0}</div>
          <p className="text-xs text-slate-500">Lembar jawaban telah terkumpul</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Rata-Rata Nilai</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700">{data?.stats.averageScore ?? 0}</div>
          <p className="text-xs text-slate-500">Dari seluruh peserta yang selesai</p>
        </div>
      </div>

      {/* Active Exam Card & Token Banner */}
      {data?.activeExam ? (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                UJIAN SEDANG BERLANGSUNG
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                {data.activeExam.nama_ujian}
              </h3>
              <p className="text-sm text-blue-200">
                {data.activeExam.mata_pelajaran} — Durasi: {data.activeExam.durasi_menit} Menit ({data.activeExam.jumlah_soal} Soal)
              </p>
            </div>

            {/* Token Highlight Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-[220px]">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest block mb-1">
                TOKEN SISWA (5 DIGIT)
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-amber-300">
                {data.activeExam.active_token || 'BELUM ADA'}
              </div>
              <div className="mt-3 flex items-center justify-center gap-2">
                <Link
                  href="/admin/exams"
                  className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Kelola Token
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
          <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Belum Ada Ujian yang Aktif</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Aktifkan ujian pada menu Ujian & Token agar dapat diakses oleh siswa.
          </p>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Buka Pengaturan Ujian
          </Link>
        </div>
      )}

      {/* Class Distribution Breakdown */}
      {data?.classDistribution && data.classDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            Distribusi Siswa per Kelas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.classDistribution.map((item) => (
              <div key={item.kelas} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold">Kelas {item.kelas}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{item.count} Siswa</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
