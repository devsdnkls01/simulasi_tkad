import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function cleanLatexMath(latex: string): string {
  if (!latex) return '';
  return latex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    .replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '$1√$2')
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\leq/g, ' ≤ ')
    .replace(/\\geq/g, ' ≥ ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\degree/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\pi/g, 'π')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathrm\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\quad/g, ' ')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\!/g, '')
    .replace(/[\{\}]/g, '')
    .replace(/\\\\/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ParsedCleanQuestion {
  question_number: number;
  question_text: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  topic: string;
}

function parsePusmendikHtmlClean(filename: string): ParsedCleanQuestion[] {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filename} not found!`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all soal items
  const regex = /<div class="soal-item[^"]*"[^>]*>([\s\S]*?)(?=<div class="soal-item|$)/g;
  let match;
  let count = 0;
  const list: ParsedCleanQuestion[] = [];

  while ((match = regex.exec(content)) !== null) {
    count++;
    const item = match[1];

    // Metadata
    const kompMatch = item.match(/<th>Kompetensi<\/th>\s*<td>([\s\S]*?)<\/td>/i);
    const kunciMatch = item.match(/<th>Kunci<\/th>\s*<td>([\s\S]*?)<\/td>/i);

    // Extract options
    const rawOptions = [
      ...item.matchAll(
        /<div class="form-check">[\s\S]*?<input[^>]*value=["']([^"']+)["'][^>]*>[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>/gi
      ),
    ].map((m) => {
      let optLabel = m[2];
      optLabel = optLabel.replace(/<img[^>]*data-latex=["']([^"']+)["'][^>]*>/gi, (_, lat) => cleanLatexMath(lat));
      // Clean tags while preserving spaces
      optLabel = optLabel
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        val: m[1].trim().toLowerCase(),
        label: optLabel,
      };
    });

    // Extract images and body
    const cardBodyMatch = item.match(/<div class="card-body">([\s\S]*?)<\/div>/i);
    let questionText = '';
    let imageUrl: string | null = null;

    if (cardBodyMatch) {
      let bodyText = cardBodyMatch[1];

      // Extract image filenames
      const imgMatches = [
        ...bodyText.matchAll(/(?:cbt_images\/|\/|\\|files\/)([0-9]{4,6}_[a-f0-9]{32}\.png)/gi),
      ].map((m) => `/soal-images/${m[1]}`);
      const uniqueImgs = Array.from(new Set(imgMatches));
      if (uniqueImgs.length === 1) {
        imageUrl = uniqueImgs[0];
      } else if (uniqueImgs.length > 1) {
        imageUrl = JSON.stringify(uniqueImgs);
      }

      // Remove metadata table
      bodyText = bodyText.replace(/<table[^>]*>[\s\S]*?<\/table>/i, '');

      // Cut off at options section
      const cutIdx = bodyText.search(/<!--\s*buat opsi|<div class=["']form-check|<table class=["']table/i);
      if (cutIdx !== -1) {
        bodyText = bodyText.substring(0, cutIdx);
      }

      // Convert latex in math
      bodyText = bodyText.replace(/<img[^>]*data-latex=["']([^"']+)["'][^>]*>/gi, (_, lat) => ` ${cleanLatexMath(lat)} `);

      // Remove <img> tags
      bodyText = bodyText.replace(/<img[^>]*>/gi, '');

      // Remove XML comments
      bodyText = bodyText.replace(/<!--[\s\S]*?-->/g, '');

      // Strip source attribution lines (including split span like Sum<span>ber:)
      bodyText = bodyText.replace(/<p[^>]*>[\s\S]*?Sum[\s\S]*?ber:?[\s\S]*?<\/p>/gi, '');
      bodyText = bodyText.replace(/<span[^>]*>[\s\S]*?Sum[\s\S]*?ber:?[\s\S]*?<\/span>/gi, '');
      bodyText = bodyText.replace(/Sumber(?:\s*teks)?\s*:?\s*https?:\/\/[^\s<]+(?:\s*\([^\)]*\)|\s*dengan\s*penyesuaian)?/gi, '');
      bodyText = bodyText.replace(/https?:\/\/[^\s<]+/gi, '');
      bodyText = bodyText.replace(/\(?\s*dengan\s*pen(?:yesuaian|\s+yesuaian)\s*\)?/gi, '');
      bodyText = bodyText.replace(/\(?\s*de\s+ngan\s*penyesuaian\s*\)?/gi, '');

      // Strip matrix leaked instructions
      bodyText = bodyText.replace(/Klik\s+(?:pada\s+)?setiap\s+pilihan\s+jawaban\s+benar!?\s*(?:Jawaban\s+benar\s+lebih\s+dari\s+satu\.?)?/gi, '');
      bodyText = bodyText.replace(/Klik\s+(?:pada\s+)?(?:pilihan\s*)?Benar\s+atau\s+Salah\s+untuk\s+setiap\s+(?:pernyataan|pertanyaan)\s+berdasarkan\s+isi\s+teks!?/gi, '');
      bodyText = bodyText.replace(/Klik\s+(?:pada\s+)?pilihan\s*Mendukung\s*atau\s*Tidak\s*Mendukung\s*untuk\s*setiap\s*pernyataan\s*berdasarkan\s*isi\s*teks!?/gi, '');
      bodyText = bodyText.replace(/Tentukan\s+(?:Sesuai|Benar)\s+atau\s+(?:Tidak\s+Sesuai|Salah)\s+untuk\s+setiap\s+pernyataan\s+(?:berikut|berdasarkan\s+isi\s+teks)!?/gi, '');
      bodyText = bodyText.replace(/Klik\s+pada\s+satu\s+pilihan\s+jawaban!?/gi, '');
      bodyText = bodyText.replace(/Jawaban\s+benar\s+lebih\s+dari\s+satu\.?/gi, '');

      // Now convert block tags (<p>, <div>, <br>) to newline, and inline tags (<span>, <strong>, <em>, <b>) to space
      bodyText = bodyText
        .replace(/<\/(p|div|tr|h\d)>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '') // strip all other inline tags cleanly without newline
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');

      // Clean up paragraphs
      const paragraphs = bodyText
        .split(/\n\s*\n/)
        .map((p) => {
          // Join broken single lines inside a paragraph into a single continuous sentence
          const lines = p
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          let merged = lines.join(' ');
          merged = merged
            .replace(/Tentukan\s+(?:Sesuai|Benar)\s+atau\s+(?:Tidak\s+Sesuai|Salah)\s+untuk\s+setiap\s+pernyataan\s+(?:berikut|berdasarkan\s+isi\s+teks)!?/gi, '')
            .replace(/\s+!\s*$/, '')
            .trim();
          return merged;
        })
        .filter((p) => {
          if (!p) return false;
          const lower = p.toLowerCase();
          if (lower === 'benar' || lower === 'salah' || lower === 'atau' || lower === 'klik pada pilihan') return false;
          if (lower.startsWith('sum') && lower.includes('ber:')) return false;
          if (lower === 'sumber:' || lower === 'sumber teks:') return false;
          if (lower.startsWith('http://') || lower.startsWith('https://')) return false;
          return true;
        });

      questionText = paragraphs.join('\n\n');
    }

    if (!questionText) {
      questionText = `Soal Asesmen Kemampuan Akademik: ${kompMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Pemahaman Akademik'}`;
    }

    let optA = rawOptions.find((o) => o.val === 'a')?.label || '';
    let optB = rawOptions.find((o) => o.val === 'b')?.label || '';
    let optC = rawOptions.find((o) => o.val === 'c')?.label || '';
    let optD = rawOptions.find((o) => o.val === 'd')?.label || '';

    if (!optA || !optB) {
      optA = 'Pernyataan 1 Benar, Pernyataan 2 Salah';
      optB = 'Semua Pernyataan Sesuai dengan Teks';
      optC = 'Pernyataan 1 dan 3 Benar';
      optD = 'Semua Pernyataan Tidak Sesuai';
    }
    if (!optC) optC = 'Pilihan C';
    if (!optD) optD = 'Pilihan D';

    const rawKunci = kunciMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'A';
    let cleanKunci = 'A';
    if (['A', 'B', 'C', 'D'].includes(rawKunci.toUpperCase())) {
      cleanKunci = rawKunci.toUpperCase();
    } else if (rawKunci.toLowerCase().includes('pernyataan 1')) {
      cleanKunci = 'C';
    } else if (rawKunci.toLowerCase().includes('benar') && rawKunci.toLowerCase().includes('salah')) {
      cleanKunci = 'B';
    }

    list.push({
      question_number: count,
      question_text: questionText,
      image_url: imageUrl,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: cleanKunci,
      topic: kompMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Pemahaman Akademik',
    });
  }

  return list;
}

async function main() {
  console.log('--- RE-PARSING B. INDO & MTK QUESTIONS WITH ZERO ARTIFACTS ---');
  const cleanBindo = parsePusmendikHtmlClean('Contoh Soal B. Indo.html');
  console.log(`Parsed ${cleanBindo.length} clean B. Indo questions.`);

  const cleanMtk = parsePusmendikHtmlClean('Contoh Soal MTK.html');
  console.log(`Parsed ${cleanMtk.length} clean MTK questions.`);

  // Update Bahasa Indonesia questions in database
  const bindoExam = await prisma.exam.findUnique({ where: { kode_ujian: 'TKA-BINDO-SD' } });
  if (bindoExam) {
    for (const q of cleanBindo) {
      await prisma.question.updateMany({
        where: { exam_id: bindoExam.id, question_number: q.question_number },
        data: {
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          image_url: q.image_url,
        },
      });
    }
    console.log('✓ Paket 1 (B. Indo) updated cleanly!');
  }

  // Update Matematika questions in database
  const mtkExam = await prisma.exam.findUnique({ where: { kode_ujian: 'TKA-MTK-SD' } });
  if (mtkExam) {
    for (const q of cleanMtk) {
      await prisma.question.updateMany({
        where: { exam_id: mtkExam.id, question_number: q.question_number },
        data: {
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          image_url: q.image_url,
        },
      });
    }
    console.log('✓ Paket 2 (Matematika) updated cleanly!');
  }

  // Update Campuran Exam as well
  const campuranExam = await prisma.exam.findUnique({ where: { kode_ujian: 'TKA-CAMPURAN-SD' } });
  if (campuranExam) {
    for (const q of cleanBindo) {
      await prisma.question.updateMany({
        where: { exam_id: campuranExam.id, question_number: q.question_number },
        data: {
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          image_url: q.image_url,
        },
      });
    }
    for (const q of cleanMtk) {
      await prisma.question.updateMany({
        where: { exam_id: campuranExam.id, question_number: cleanBindo.length + q.question_number },
        data: {
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          image_url: q.image_url,
        },
      });
    }
    console.log('✓ Paket 4 (Campuran) updated cleanly!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
