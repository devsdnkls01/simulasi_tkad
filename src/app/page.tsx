import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  BookOpen,
  Sparkles,
  ArrowRight,
  Layers,
  Lock,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function HomePage() {
  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Logo size={40} schoolName={schoolName} subtitle="PORTAL ASESMEN TKA" />

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Guru</span>
            </Link>

            <Link
              href="/login"
              className="h-10 px-4 sm:px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md active:scale-98 inline-flex items-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Masuk Siswa</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center flex-1 flex flex-col justify-center">
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 text-xs font-bold mb-6 mx-auto border border-blue-200/80 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Sistem Ujian Terstandar & Ruang Belajar Akademik SD</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-5 leading-tight sm:leading-tight">
          Platform Simulasi TKA &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
            Pusat Belajar Siswa SD
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal">
          Media asesmen kemampuan akademik resmi untuk siswa <strong className="text-slate-800">{schoolName}</strong>. Dilengkapi bank soal bergambar Pusmendik, timer otoritatif server, penguncian jawaban otomatis, serta modul belajar interaktif.
        </p>

        {/* Call to Action Buttons - Large, Prominent & High-Impact */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3.5 sm:gap-5 max-w-xl mx-auto mb-12 sm:mb-16 w-full">
          <Link
            href="/login"
            className="w-full sm:w-auto flex-1 min-h-[58px] sm:min-h-[64px] px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-base sm:text-lg font-black tracking-wide transition-all shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center justify-center gap-3 cursor-pointer"
          >
            <GraduationCap className="w-6 h-6 shrink-0" />
            <span>MULAI SIMULASI UJIAN</span>
            <ArrowRight className="w-5 h-5 shrink-0" />
          </Link>

          <Link
            href="/materi"
            className="w-full sm:w-auto flex-1 min-h-[58px] sm:min-h-[64px] px-8 py-4 rounded-2xl bg-white hover:bg-blue-50/40 text-slate-900 border-2 border-slate-300/90 hover:border-blue-600 text-base sm:text-lg font-extrabold transition-all shadow-md shadow-slate-200/80 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] inline-flex items-center justify-center gap-3 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0" />
            <span>Ruang Belajar & Modul</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
          {/* Card 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3.5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">4 Paket Ujian TKA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bahasa Indonesia (30), Matematika (30), IPAS (30), dan Paket Gabungan (50 Acak Dinamis).
              </p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 pt-3 flex items-center gap-1">
              Bank Soal Resmi <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Modul Pembelajaran</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rangkuman materi, trik rumus cepat, contoh soal bertahap, dan kuis mini berumpan balik instan.
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-700 pt-3 flex items-center gap-1">
              Tingkatkan Nilai <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Waktu Otoritatif Server</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Timer dihitung akurat dari server. Waktu ujian tidak akan ter-reset meskipun halaman dimuat ulang.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 pt-3 flex items-center gap-1">
              Timer Otomatis <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3.5">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Penguncian Jawaban</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jawaban otomatis dikunci begitu siswa melanjutkan soal, melatih ketelitian dan kejujuran ujian.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 pt-3 flex items-center gap-1">
              Anti-Manipulasi <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Bottom Guru & Admin Link on Mobile */}
        <div className="pt-10 sm:hidden">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal Pengawas & Administrator Ujian</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {schoolName} — Kabupaten Tegal</p>
          <p className="font-medium text-slate-400">Sistem Asesmen Standar TKA/TKAD Sekolah Dasar</p>
        </div>
      </footer>
    </div>
  );
}
