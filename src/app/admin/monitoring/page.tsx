'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Activity,
  RotateCcw,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface Participant {
  no: number;
  studentId: string;
  nomorPeserta: string;
  nama: string;
  kelas: string;
  rombel: string | null;
  sessionId: string | null;
  status: 'BELUM_MULAI' | 'MENGERJAKAN' | 'SELESAI' | 'WAKTU_HABIS';
  progress: string;
  startedAt: string | null;
  remainingSeconds: number;
  score: number | null;
}

export default function AdminMonitoringPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Reset Session Modal state
  const [selectedSession, setSelectedSession] = useState<{
    sessionId: string;
    studentName: string;
    nomorPeserta: string;
  } | null>(null);
  const [resetReason, setResetReason] = useState('');
  const [resetting, setResetting] = useState(false);

  const fetchMonitoring = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await fetch('/api/admin/monitoring');
      if (res.ok) {
        const data = await res.json();
        setParticipants(data.participants || []);
      }
    } catch (err) {
      console.error('Failed to fetch monitoring data:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch('/api/admin/monitoring');
        if (res.ok && active) {
          const data = await res.json();
          setParticipants(data.participants || []);
        }
      } catch (err) {
        console.error('Failed to fetch monitoring data:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  // Auto-refresh interval (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoring();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchMonitoring]);

  const handleResetSession = async () => {
    if (!selectedSession) return;
    setResetting(true);

    try {
      const res = await fetch('/api/admin/exams/default/reset-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession.sessionId,
          confirmed: true,
          reason: resetReason || 'Permintaan guru pengawas',
        }),
      });

      if (res.ok) {
        setSelectedSession(null);
        setResetReason('');
        await fetchMonitoring();
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal mereset sesi.');
      }
    } catch {
      alert('Terjadi kesalahan saat mereset sesi.');
    } finally {
      setResetting(false);
    }
  };

  const formatSeconds = (secs: number) => {
    if (secs <= 0) return '-';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const filteredParticipants = participants.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.nomorPeserta.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-blue-600" />
            Monitoring Realtime Peserta
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pantau pergerakan progres pengerjaan, waktu tersisa, dan status peserta secara langsung
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300"
            />
            <span>Auto-Refresh (5s)</span>
          </label>

          <button
            onClick={() => fetchMonitoring()}
            disabled={refreshing}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors disabled:opacity-50"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau nomor peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Status</option>
            <option value="MENGERJAKAN">Sedang Mengerjakan</option>
            <option value="SELESAI">Selesai</option>
            <option value="WAKTU_HABIS">Waktu Habis</option>
            <option value="BELUM_MULAI">Belum Mulai</option>
          </select>
        </div>
      </div>

      {/* Live Table (Bagian AG) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4">NO. PESERTA</th>
                <th className="py-3 px-4">NAMA LENGKAP</th>
                <th className="py-3 px-4">KELAS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">PROGRES</th>
                <th className="py-3 px-4">SISA WAKTU</th>
                <th className="py-3 px-4 text-center">NILAI</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    Memuat data peserta...
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    Tidak ada data peserta yang cocok.
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((p) => {
                  return (
                    <tr key={p.studentId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono font-medium">
                        {p.no}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {p.nomorPeserta}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {p.nama}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.kelas} {p.rombel ? `(${p.rombel})` : ''}
                      </td>
                      <td className="py-3.5 px-4">
                        {p.status === 'MENGERJAKAN' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            Mengerjakan
                          </span>
                        )}
                        {p.status === 'SELESAI' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Selesai
                          </span>
                        )}
                        {p.status === 'WAKTU_HABIS' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200">
                            <Clock className="w-3.5 h-3.5 text-red-600" />
                            Waktu Habis
                          </span>
                        )}
                        {p.status === 'BELUM_MULAI' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            Belum Mulai
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {p.progress}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {p.remainingSeconds > 0 ? (
                          <span className={p.remainingSeconds < 600 ? 'text-red-600 font-bold' : ''}>
                            {formatSeconds(p.remainingSeconds)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        {p.score !== null ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono">
                            {p.score}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.sessionId && (
                          <button
                            onClick={() =>
                              setSelectedSession({
                                sessionId: p.sessionId!,
                                studentName: p.nama,
                                nomorPeserta: p.nomorPeserta,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors cursor-pointer"
                            title="Reset sesi jika terjadi masalah teknis siswa"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset Sesi
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Session Confirmation Modal (Bagian AI) */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-slate-900">Konfirmasi Reset Sesi</h3>
            </div>

            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-900 space-y-1">
              <p className="font-bold">PERINGATAN:</p>
              <p>
                Reset sesi akan menghapus lembar jawaban saat ini dan memungkinkan peserta{' '}
                <strong>{selectedSession.studentName} ({selectedSession.nomorPeserta})</strong>{' '}
                untuk memulai ulang ujian dari awal.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Alasan Reset (Audit Log)
              </label>
              <input
                type="text"
                placeholder="Contoh: Perangkat siswa mati / listrik padam"
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                disabled={resetting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetSession}
                disabled={resetting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mereset...</span>
                  </>
                ) : (
                  'YA, RESET SESI'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
