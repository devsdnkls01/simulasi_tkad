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
  Trophy,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function HomePage() {
  const schoolName = process.env.NEXT_PUBLIC_SCHOOL_NAME || 'SD NEGERI KALISALAK 01';

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-slate-50 flex flex-col justify-between selection:bg-blue-600 selection:text-white lg:overflow-hidden">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Logo size={34} schoolName={schoolName} subtitle="PORTAL ASESMEN TKA" />

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal Guru</span>
            </Link>

            <Link
              href="/nilai"
              className="h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs hover:shadow-md active:scale-98 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Lihat Peringkat</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-4 text-center flex-1 flex flex-col justify-center items-center w-full">
        {/* Verification Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] sm:text-xs font-bold mb-3 sm:mb-4 mx-auto border border-blue-200/80 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Sistem Ujian Terstandar & Ruang Belajar Akademik SD</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2.5 sm:mb-3 leading-tight sm:leading-tight max-w-3xl">
          Platform Simulasi TKA &{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600">
            Pusat Belajar Siswa SD
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed font-normal">
          Media asesmen kemampuan akademik resmi untuk siswa <strong className="text-slate-800 font-bold">{schoolName}</strong>. Dilengkapi bank soal Pusmendik, timer otoritatif server, penguncian jawaban otomatis, serta modul belajar.
        </p>

        {/* Call to Action Buttons - Proportional, Sleek & Non-Wrapping */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-xl mx-auto mb-6 sm:mb-8 w-full px-2">
          <Link
            href="/login"
            className="w-full sm:w-auto min-w-[220px] h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-xs sm:text-sm font-black tracking-wide transition-all shadow-md shadow-blue-600/30 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-98 inline-flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
          >
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>MULAI SIMULASI UJIAN</span>
            <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
          </Link>

          <Link
            href="/materi"
            className="w-full sm:w-auto min-w-[200px] h-12 sm:h-13 px-6 sm:px-7 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-blue-400 text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-98 inline-flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 shrink-0" />
            <span>Ruang Belajar & Modul</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5 text-left w-full max-w-4.5xl">
          {/* Card 1 */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-xs sm:text-sm">4 Paket Ujian TKA</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                B. Indonesia (30), Matematika (30), IPAS (30), dan Gabungan (50 Acak).
              </p>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 pt-2 flex items-center gap-0.5">
              Bank Soal Resmi <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-xs sm:text-sm">Modul Pembelajaran</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                Rangkuman materi, trik rumus, dan kuis mini berumpan balik instan.
              </p>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 pt-2 flex items-center gap-0.5">
              Tingkatkan Nilai <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-xs sm:text-sm">Waktu Otoritatif Server</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                Timer dihitung akurat dari server & tidak ter-reset saat reload.
              </p>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 pt-2 flex items-center gap-0.5">
              Timer Otomatis <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 mb-0.5 text-xs sm:text-sm">Penguncian Jawaban</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
                Jawaban otomatis dikunci begitu lanjut soal, melatih ketelitian siswa.
              </p>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 pt-2 flex items-center gap-0.5">
              Anti-Manipulasi <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Bottom Guru & Admin Link on Mobile */}
        <div className="pt-4 sm:hidden">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal Pengawas & Administrator Ujian</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-2.5 sm:py-3 shrink-0 text-center text-[11px] text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2">
          <p>© {new Date().getFullYear()} {schoolName} — Kabupaten Tegal</p>
          <p className="font-medium text-slate-400 text-[10px] sm:text-[11px]">Sistem Asesmen Standar TKA/TKAD Sekolah Dasar</p>
        </div>
      </footer>
    </div>
  );
}
