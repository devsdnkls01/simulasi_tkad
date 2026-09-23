import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function cleanQuestionText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove leaked instructions from Pusmendik complex question formats
  cleaned = cleaned.replace(/Klik\s+(?:pada\s+)?setiap\s+pilihan\s+jawaban\s+benar!?\s*Jawaban\s+benar\s+lebih\s+dari\s+satu\.?/gi, '');
  cleaned = cleaned.replace(/Klik\s+(?:pada\s+)?(?:pilihan\s*)?Benar\s+atau\s+Salah\s+untuk\s+setiap\s+(?:pernyataan|pertanyaan)\s+berdasarkan\s+isi\s+teks!?/gi, '');
  cleaned = cleaned.replace(/Klik\s+(?:pada\s+)?pilihan\s*Mendukung\s*atau\s*Tidak\s*Mendukung\s*untuk\s*setiap\s*pernyataan\s*berdasarkan\s*isi\s*teks!?/gi, '');
  cleaned = cleaned.replace(/Tentukan\s*Sesuai\s*atau\s*Tidak\s*Sesuai\s*untuk\s*setiap\s*pernyataan\s*berikut!?/gi, '');
  cleaned = cleaned.replace(/Klik\s+pada\s+satu\s+pilihan\s+jawaban!?/gi, '');
  cleaned = cleaned.replace(/Klik\s+pada\s+pilihan\s*\n*\s*Benar\s*\n*\s*atau\s*\n*\s*Salah\s*\n*\s*untuk\s*setiap\s*(?:pernyataan|pertanyaan)\s*berdasarkan\s*isi\s*teks!?/gi, '');

  // 2. Remove broken URLs and source references
  cleaned = cleaned.replace(/Sumber(?:\s*teks)?\s*:?\s*https?:\/\/[^\s]+(?:\s*\([^\)]*\)|\s*dengan\s*penyesuaian)?/gi, '');
  cleaned = cleaned.replace(/https?:\/\/[^\s]+/gi, '');
  cleaned = cleaned.replace(/\(?\s*dengan\s*pen(?:yesuaian|\s+yesuaian)\s*\)?\.?/gi, '');
  cleaned = cleaned.replace(/\(?\s*de\s+ngan\s*penyesuaian\s*\)?\.?/gi, '');
  cleaned = cleaned.replace(/Sumb\s*er\s*:/gi, '');
  cleaned = cleaned.replace(/Sumber\s*:/gi, '');

  // 3. Fix broken quotes & line wraps
  cleaned = cleaned.replace(/“\s*\n+/g, '“');
  cleaned = cleaned.replace(/\n+\s*”/g, '”');
  cleaned = cleaned.replace(/,\s*\n+\s*lho\./gi, ', lho.');

  // 4. Normalize lines
  const lines = cleaned
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => {
      if (!l) return false;
      const lower = l.toLowerCase();
      if (lower === 'benar' || lower === 'salah' || lower === 'atau' || lower === 'klik pada pilihan') return false;
      if (lower.startsWith('http://') || lower.startsWith('https://')) return false;
      if (lower === 'sumber' || lower === 'sumber:' || lower === 'sumber teks:') return false;
      return true;
    });

  return lines.join('\n\n');
}

export function cleanOptionText(text: string): string {
  if (!text) return '';
  let cleaned = text;
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

async function main() {
  console.log('--- Memulai Audit & Pembersihan Teks Seluruh Soal ---');
  const questions = await prisma.question.findMany({
    select: {
      id: true,
      question_number: true,
      question_text: true,
      option_a: true,
      option_b: true,
      option_c: true,
      option_d: true,
      exam: {
        select: {
          nama_ujian: true,
        },
      },
    },
  });

  let count = 0;
  for (const q of questions) {
    const cleanedText = cleanQuestionText(q.question_text);
    const cleanedA = cleanOptionText(q.option_a);
    const cleanedB = cleanOptionText(q.option_b);
    const cleanedC = cleanOptionText(q.option_c);
    const cleanedD = cleanOptionText(q.option_d);

    if (
      cleanedText !== q.question_text ||
      cleanedA !== q.option_a ||
      cleanedB !== q.option_b ||
      cleanedC !== q.option_c ||
      cleanedD !== q.option_d
    ) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          question_text: cleanedText,
          option_a: cleanedA,
          option_b: cleanedB,
          option_c: cleanedC,
          option_d: cleanedD,
        },
      });
      count++;
    }
  }

  console.log(`✓ Sukses membersihkan ${count} soal dari ${questions.length} butir soal di database!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
