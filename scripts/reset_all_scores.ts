import { prisma } from '../src/lib/db';

async function resetAllScores() {
  console.log('🔄 Memulai proses reset semua nilai dan sesi ujian...');

  try {
    const deletedResults = await prisma.result.deleteMany({});
    console.log(`✅ Berhasil menghapus ${deletedResults.count} data nilai/hasil (Result).`);

    const deletedAnswers = await prisma.answer.deleteMany({});
    console.log(`✅ Berhasil menghapus ${deletedAnswers.count} jawaban siswa (Answer).`);

    const deletedSessionQuestions = await prisma.examSessionQuestion.deleteMany({});
    console.log(`✅ Berhasil menghapus ${deletedSessionQuestions.count} susunan soal sesi (ExamSessionQuestion).`);

    const deletedSessions = await prisma.examSession.deleteMany({});
    console.log(`✅ Berhasil menghapus ${deletedSessions.count} riwayat sesi ujian (ExamSession).`);

    console.log('🎉 Semua nilai dan riwayat sesi ujian telah berhasil di-reset menjadi bersih (0).');
  } catch (error) {
    console.error('❌ Gagal melakukan reset nilai:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllScores();
