'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Calculator,
  Leaf,
  Clock,
  Search,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  Award,
  BookMarked,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { LEARNING_MATERIALS, LearningChapter } from '@/data/learningMaterials';
import { playCorrectSound, playWrongSound, triggerCelebration } from '@/lib/audioAndEffects';

export default function LearningCenterPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'bindo' | 'mtk' | 'ipas'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChapter, setActiveChapter] = useState<LearningChapter | null>(null);

  // Mini Quiz Interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<{ [quizId: string]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<{ [quizId: string]: boolean }>({});

  const filteredMaterials = LEARNING_MATERIALS.filter((item) => {
    const matchSubject = selectedSubject === 'all' || item.subjectCode === selectedSubject;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const handleSelectQuizOption = (quizId: string, optionKey: string) => {
    if (quizSubmitted[quizId]) return;
    setSelectedQuizAnswers((prev) => ({ ...prev, [quizId]: optionKey }));
  };

  const handleCheckQuiz = (quizId: string) => {
    const chosen = selectedQuizAnswers[quizId];
    if (!chosen) return;
    setQuizSubmitted((prev) => ({ ...prev, [quizId]: true }));

    const targetQuiz = activeChapter?.miniQuiz.find((q) => q.id === quizId);
    if (targetQuiz) {
      if (chosen.toUpperCase() === targetQuiz.correctAnswer.toUpperCase()) {
        playCorrectSound();
        triggerCelebration();
      } else {
        playWrongSound();
      }
    }
  };

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'bindo':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'mtk':
        return <Calculator className="w-5 h-5 text-amber-600" />;
      case 'ipas':
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (activeChapter ? setActiveChapter(null) : router.push('/dashboard'))}
              className="h-10 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{activeChapter ? 'Daftar Materi' : 'Dashboard'}</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Logo size={36} showText={false} />
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">
                  Ruang Belajar & Materi Akademik SD
                </h1>
                <p className="text-xs text-slate-500 font-medium hidden sm:block">
                  Pusat Peningkatan Pemahaman Konsep & Trik Cepat TKA
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Belajar Mandiri</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {!activeChapter ? (
          /* ========================================================= */
          /* LIST OF CHAPTERS & SEARCH / FILTER VIEW                   */
          /* ========================================================= */
          <div className="space-y-6">
            {/* Banner Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-700 to-sky-600 p-6 sm:p-8 text-white shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Modul Akademik Resmi Siswa SD</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Kuasai Konsep, Bukan Sekadar Hafalan!
                </h2>
                <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed">
                  Pelajari rangkuman materi inti, rumus praktis berhitung cepat, trik menemukan ide pokok, dan kuis pemahaman mandiri untuk mendongkrak kemampuan akademikmu.
                </p>
              </div>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none hidden md:block">
                <BookMarked className="w-64 h-64 text-white" />
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              {/* Subject Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { key: 'all' as const, label: 'Semua Mapel' },
                  { key: 'bindo' as const, label: 'B. Indonesia' },
                  { key: 'mtk' as const, label: 'Matematika' },
                  { key: 'ipas' as const, label: 'IPAS' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedSubject(tab.key)}
                    className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                      selectedSubject === tab.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari topik atau rumus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Chapter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveChapter(item);
                    setSelectedQuizAnswers({});
                    setQuizSubmitted({});
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {getSubjectIcon(item.subjectCode)}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.color.badge}`}>
                          {item.subject} • Bab {item.chapterNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.durationMinutes} mnt</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">
                      {item.subtitle}
                    </p>

                    {/* Summary bullets preview */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-100">
                      {item.summaryPoints.slice(0, 2).map((pt, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-blue-600 font-bold text-xs">
                    <span>Pelajari Materi & Kuis</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Materi tidak ditemukan</p>
                <p className="text-xs text-slate-500">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================= */
          /* DETAILED CHAPTER READING & INTERACTIVE MINI QUIZ VIEW     */
          /* ========================================================= */
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Chapter Header */}
            <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${activeChapter.color.gradient} text-white shadow-md space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider">
                  {activeChapter.subject} • Bab {activeChapter.chapterNumber}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold bg-white/10 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  <span>Estimasi Baca: {activeChapter.durationMinutes} Menit</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black leading-tight">
                {activeChapter.title}
              </h2>
              <p className="text-sm sm:text-base text-white/90 font-medium">
                {activeChapter.subtitle}
              </p>
            </div>

            {/* Quick Summary Box */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  Rangkuman Konsep Inti (Wajib Diingat!)
                </h3>
              </div>
              <ul className="space-y-2.5">
                {activeChapter.summaryPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Content Sections */}
            <div className="space-y-6">
              {activeChapter.contentSections.map((sec, secIdx) => (
                <div key={secIdx} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-4">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{sec.title}</span>
                  </h4>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-line">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* Tips Box if any */}
                  {sec.tips && (
                    <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-start gap-2.5 font-medium">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Tips Cepat: </span>
                        <span>{sec.tips}</span>
                      </div>
                    </div>
                  )}

                  {/* Formula Box if any */}
                  {sec.formula && (
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 font-mono font-bold">
                      {sec.formula}
                    </div>
                  )}

                  {/* Example Problem if any */}
                  {sec.example && (
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        Contoh Soal & Langkah Pengerjaan
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">
                        {sec.example.problem}
                      </p>
                      <div className="space-y-1.5 pl-3 border-l-2 border-indigo-400 text-xs sm:text-sm text-slate-600">
                        {sec.example.stepByStep.map((st, stIdx) => (
                          <p key={stIdx}>{st}</p>
                        ))}
                      </div>
                      <div className="p-3 bg-emerald-50 text-emerald-900 font-bold rounded-lg text-xs sm:text-sm border border-emerald-200">
                        {sec.example.conclusion}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Formula Banner */}
            {activeChapter.quickFormula && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md space-y-2">
                <div className="text-xs font-bold tracking-wider uppercase text-violet-200">
                  {activeChapter.quickFormula.title}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-amber-300">
                  {activeChapter.quickFormula.formulaText}
                </div>
                <p className="text-xs sm:text-sm text-violet-100 font-medium">
                  {activeChapter.quickFormula.description}
                </p>
              </div>
            )}

            {/* Interactive Mini Quiz */}
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-5 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Kuis Pemahaman Mandiri (Uji Kemampuanmu!)
                  </h3>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                  {activeChapter.miniQuiz.length} Soal Latihan
                </span>
              </div>

              <div className="space-y-6">
                {activeChapter.miniQuiz.map((quiz, qIdx) => {
                  const selectedOpt = selectedQuizAnswers[quiz.id];
                  const isChecked = !!quizSubmitted[quiz.id];
                  const isCorrect = selectedOpt === quiz.correctAnswer;

                  return (
                    <div key={quiz.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-start gap-2">
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-md text-xs font-black">
                          No. {qIdx + 1}
                        </span>
                        <span className="leading-relaxed">{quiz.question}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {quiz.options.map((opt) => {
                          const isOptionSelected = selectedOpt === opt.key;
                          let btnStyle = 'border-slate-200 bg-white hover:border-blue-300 text-slate-700';

                          if (isChecked) {
                            if (opt.key === quiz.correctAnswer) {
                              btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'border-red-500 bg-red-50 text-red-950';
                            } else {
                              btnStyle = 'border-slate-200 bg-white text-slate-400 opacity-60';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-bold ring-2 ring-blue-600/30';
                          }

                          return (
                            <button
                              key={opt.key}
                              type="button"
                              disabled={isChecked}
                              onClick={() => handleSelectQuizOption(quiz.id, opt.key)}
                              className={`p-3 rounded-xl border-2 text-left text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${btnStyle}`}
                            >
                              <div className="w-7 h-7 rounded-lg bg-slate-100 font-bold text-xs flex items-center justify-center shrink-0">
                                {opt.key}
                              </div>
                              <span className="flex-1 font-medium">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>

                      {!isChecked ? (
                        <button
                          type="button"
                          disabled={!selectedOpt}
                          onClick={() => handleCheckQuiz(quiz.id)}
                          className="h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                        >
                          Cek Jawaban
                        </button>
                      ) : (
                        <div className={`p-4 rounded-xl text-xs sm:text-sm space-y-1.5 ${
                          isCorrect ? 'bg-emerald-50 border border-emerald-300 text-emerald-950' : 'bg-red-50 border border-red-300 text-red-950'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Hebat! Jawabanmu Benar!</span>
                              </>
                            ) : (
                              <>
                                <HelpCircle className="w-4 h-4 text-red-600" />
                                <span>Jawaban Kurang Tepat (Kunci: {quiz.correctAnswer})</span>
                              </>
                            )}
                          </div>
                          <p className="font-normal leading-relaxed text-slate-700">
                            <span className="font-bold">Pembahasan: </span>
                            {quiz.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  setActiveChapter(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="h-12 px-6 rounded-xl border-2 border-slate-300 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Materi</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-98"
              >
                <span>Mulai Latihan Simulasi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
