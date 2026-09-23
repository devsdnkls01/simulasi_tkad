'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Key,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface StudentItem {
  id: string;
  nomor_peserta: string;
  nama_lengkap: string;
  nis: string | null;
  nisn: string | null;
  kelas: string;
  rombel: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedStudentForReset, setSelectedStudentForReset] = useState<StudentItem | null>(null);

  // Single Add Form
  const [formData, setFormData] = useState({
    nomor_peserta: '',
    nama_lengkap: '',
    nis: '',
    nisn: '',
    kelas: 'VI',
    rombel: 'A',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Import Text / CSV Form
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<{ inserted: number; errors: string[] } | null>(null);

  // Password reset form
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  const fetchStudents = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const query = new URLSearchParams({
        page: String(page),
        limit: '20',
        q: search,
        kelas: kelasFilter,
      });

      const res = await fetch(`/api/admin/students?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalStudents(data.pagination.total || 0);
      }
    } catch (err) {
      console.error('Fetch students error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, kelasFilter]);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: '20',
          q: search,
          kelas: kelasFilter,
        });
        const res = await fetch(`/api/admin/students?${query.toString()}`);
        if (res.ok && active) {
          const data = await res.json();
          setStudents(data.students || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalStudents(data.pagination.total || 0);
        }
      } catch (err) {
        console.error('Fetch students error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [page, search, kelasFilter]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menambahkan data siswa.');
        return;
      }

      setShowAddModal(false);
      setFormData({
        nomor_peserta: '',
        nama_lengkap: '',
        nis: '',
        nisn: '',
        kelas: 'VI',
        rombel: 'A',
        password: '',
      });
      await fetchStudents();
    } catch {
      setFormError('Terjadi kesalahan server.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    setImportReport(null);

    // Parse CSV rows
    const lines = csvText.trim().split('\n');
    const parsedStudents = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('nomor_peserta')) continue; // Skip header
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        // Flexible format detection:
        // Format A (Simple): nomor_peserta, nama_lengkap, nisn, (optional: kelas)
        // Format B (Full): nomor_peserta, nama_lengkap, nis, nisn, kelas, rombel, password
        const noPeserta = parts[0];
        const nama = parts[1];
        let nisnVal = null;
        let kelasVal = 'VI';
        let pwVal = 'Siswa#2026!';

        if (parts.length === 3) {
          nisnVal = parts[2];
        } else if (parts.length === 4) {
          nisnVal = parts[2];
          kelasVal = parts[3] || 'VI';
        } else if (parts.length >= 7) {
          nisnVal = parts[3] || parts[2];
          kelasVal = parts[4] || 'VI';
          pwVal = parts[6] || 'Siswa#2026!';
        } else {
          nisnVal = parts[2] || null;
        }

        parsedStudents.push({
          nomor_peserta: noPeserta,
          nama_lengkap: nama,
          nis: null,
          nisn: nisnVal,
          kelas: kelasVal,
          rombel: null,
          password: pwVal,
        });
      }
    }

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: parsedStudents }),
      });

      const data = await res.json();
      if (res.ok) {
        setImportReport({
          inserted: data.insertedCount || 0,
          errors: data.errors || [],
        });
        await fetchStudents();
      } else {
        alert(data.error || 'Gagal mengimpor siswa.');
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setImporting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForReset || !newPassword.trim()) return;

    setResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/students/${selectedStudentForReset.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() }),
      });

      if (res.ok) {
        alert(`Password untuk ${selectedStudentForReset.nama_lengkap} berhasil diperbarui.`);
        setSelectedStudentForReset(null);
        setNewPassword('');
      } else {
        const d = await res.json();
        alert(d.error || 'Gagal mereset password.');
      }
    } catch {
      alert('Terjadi kendala jaringan.');
    } finally {
      setResettingPassword(false);
    }
  };

  const toggleStudentStatus = async (student: StudentItem) => {
    const nextStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        await fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Manajemen Peserta Ujian
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola data siswa, reset password, dan impor data peserta massal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setShowImportModal(true);
              setImportReport(null);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import CSV / Excel</span>
          </button>

          <button
            onClick={() => {
              setShowAddModal(true);
              setFormError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, nomor peserta, NISN..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={kelasFilter}
            onChange={(e) => {
              setKelasFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Semua Kelas</option>
            <option value="VI">Kelas VI</option>
            <option value="V">Kelas V</option>
          </select>
          <span className="text-xs text-slate-500 font-semibold pl-2">
            Total: {totalStudents} Siswa
          </span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">NO. PESERTA</th>
                <th className="py-3 px-4">NAMA LENGKAP</th>
                <th className="py-3 px-4">NISN</th>
                <th className="py-3 px-4">KELAS</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    Memuat data siswa...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Tidak ada data siswa.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {s.nomor_peserta}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {s.nama_lengkap}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-xs font-semibold">
                      {s.nisn || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      Kelas {s.kelas}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleStudentStatus(s)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                          s.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        {s.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-600" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedStudentForReset(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Reset Password Siswa"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Single Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Tambah Peserta Baru</h3>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nomor Peserta (Wajib & Unik)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 260010"
                  value={formData.nomor_peserta}
                  onChange={(e) => setFormData({ ...formData, nomor_peserta: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 3141701144"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelas</label>
                <input
                  type="text"
                  required
                  readOnly
                  value="VI"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-xl text-slate-700 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password Awal
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siswa#2026!"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import CSV Modal (Bagian AK) */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Impor Siswa Massal (CSV)</h3>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
              <p className="font-bold">Format Baris CSV:</p>
              <p className="font-mono text-[11px]">
                nomor_peserta,nama_lengkap,nis,nisn,kelas,rombel,password
              </p>
              <p className="text-slate-500 pt-1">
                Contoh: 260010,Ahmad Fauzi,10299,0123456799,VI,A,Siswa#2026!
              </p>
            </div>

            {importReport && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-emerald-700">
                  ✓ {importReport.inserted} Siswa berhasil diimpor.
                </p>
                {importReport.errors.length > 0 && (
                  <div className="text-red-600 pt-1 space-y-0.5 max-h-24 overflow-y-auto">
                    {importReport.errors.map((err, i) => (
                      <p key={i}>• {err}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tempelkan Teks CSV
              </label>
              <textarea
                rows={6}
                placeholder="260010,Ahmad Fauzi,10299,0123456799,VI,A,Siswa#2026!&#10;260011,Budi Santoso,10300,0123456800,VI,B,Siswa#2026!"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={importing || !csvText.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses Data...</span>
                  </>
                ) : (
                  'Mulai Impor Siswa'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedStudentForReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Reset Password Siswa
            </h3>
            <p className="text-xs text-slate-600">
              Peserta: <strong>{selectedStudentForReset.nama_lengkap}</strong> ({selectedStudentForReset.nomor_peserta})
            </p>

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Password Baru
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForReset(null)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword || !newPassword.trim()}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  {resettingPassword ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
