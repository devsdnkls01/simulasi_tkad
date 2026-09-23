'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Download,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface ResultRow {
  studentId: string;
  nomorPeserta: string;
  nama: string;
  kelas: string;
  rombel: string | null;
  status: string;
  score: number | null;
  progress: string;
  startedAt: string | null;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/monitoring');
      if (res.ok) {
        const data = await res.json();
        setResults(data.participants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch('/api/admin/monitoring');
        if (res.ok && active) {
          const data = await res.json();
          setResults(data.participants || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleExport = (format: 'xlsx' | 'csv') => {
    setExporting(format);
    const link = document.createElement('a');
    link.href = `/api/admin/results/export?format=${format}`;
    link.setAttribute('download', `Hasil_Simulasi.${format}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setExporting(null), 2000);
  };

  const filtered = results.filter((r) => {
    return (
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.nomorPeserta.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-blue-600" />
            Hasil Penilaian & Rekapitulasi
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Rekap skor ujian peserta dan ekspor data nilai resmi dalam format Excel dan CSV
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari siswa atau nomor peserta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <button
          onClick={fetchResults}
          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
          title="Segarkan data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4">NO. PESERTA</th>
                <th className="py-3 px-4">NAMA SISWA</th>
                <th className="py-3 px-4">KELAS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4">PROGRES</th>
                <th className="py-3 px-4 text-center">SKOR AKHIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    Memuat hasil penilaian...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Belum ada data nilai tersedia.
                  </td>
                </tr>
              ) : (
                filtered.map((r, index) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {r.nomorPeserta}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {r.nama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.kelas} {r.rombel ? `(${r.rombel})` : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      {r.status === 'SELESAI' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai
                        </span>
                      ) : r.status === 'MENGERJAKAN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Sedang Ujian
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          {r.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 font-mono">
                      {r.progress}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {r.score !== null ? (
                        <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-900 font-black text-sm font-mono border border-blue-100">
                          {r.score}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
