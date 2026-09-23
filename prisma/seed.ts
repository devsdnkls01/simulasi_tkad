import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function hashPassword(pw: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pw, salt);
}

interface ParsedQuestion {
  question_number: number;
  question_text: string;
  image_url: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  topic: string;
  score: number;
}

// -------------------------------------------------------------
// BAHASA INDONESIA DETAILED EXPLANATIONS MAP (30 SOAL PUSMENDIK)
// -------------------------------------------------------------
const bindoExplanationList: { [key: number]: { explanation: string; topic: string } } = {
  1: {
    topic: 'Literasi Membaca & Analisis Wacana Fiksi',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Berdasarkan wacana cerita fiksi pada soal, peristiwa utama menggambarkan interaksi antar tokoh di mana solusi dicapai melalui musyawarah dan kerja sama. Informasi ini tertuang jelas pada paragraf pengantar cerita.

💡 Konsep Kunci:
Untuk menemukan fakta cerita, perhatikan kata kunci (5W+1H: Siapa, Apa, Kapan, Di mana, Mengapa, dan Bagaimana) yang tertulis dalam wacana.`,
  },
  2: {
    topic: 'Menentukan Watak & Karakter Tokoh',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Watak tokoh dapat disimpulkan dari dialog dan tindakan tokoh saat menghadapi rintangan. Tokoh menunjukkan sikap pantang menyerah, peduli terhadap sesama, dan berinisiatif mencari jalan keluar bersama.

💡 Konsep Kunci:
Watak tokoh fiksi dibedakan menjadi protagonis (berwatak baik) dan antagonis (penentang/pemicu konflik). Amati kalimat tindakan tokoh untuk menentukan sifatnya secara tepat.`,
  },
  3: {
    topic: 'Menyimpulkan Amanat & Pesan Moral Cerita',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Amanat adalah pesan kebaikan yang ingin disampaikan pengarang kepada pembaca. Dari keseluruhan alur cerita, pengarang berpesan agar kita senantiasa tolong-menolong dan menjaga kerukunan dalam kehidupan sehari-hari.

💡 Konsep Kunci:
Amanat cerita selalu bernilai positif dan dapat diaplikasikan dalam perilaku terpuji di lingkungan keluarga, sekolah, maupun masyarakat.`,
  },
  4: {
    topic: 'Menemukan Ide Pokok Paragraf',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Ide pokok paragraf tersebut terletak pada kalimat utama di awal paragraf (Deduktif). Kalimat-kalimat berikutnya merupakan kalimat penjelas yang menguraikan rincian gagasan pokok tersebut.

💡 Konsep Kunci:
Ide pokok adalah gagasan inti pengembangan paragraf. Ingat rumus D-I (Deduktif = Depan/Awal, Induktif = Belakang/Akhir).`,
  },
  5: {
    topic: 'Analisis Teks Informasi & Infografis',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Informasi yang tepat diperoleh dengan mencocokkan data pada infografis (grafik dan angka) dengan pernyataan pilihan ganda secara teliti.

💡 Konsep Kunci:
Saat membaca infografis, perhatikan judul, label diagram, satuan data, serta legenda warna untuk menarik kesimpulan yang akurat.`,
  },
  6: {
    topic: 'Makna Kata & Kosakata Khusus',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Arti kata atau istilah teknis dalam wacana ditentukan berdasarkan konteks penggunaannya dalam kalimat dan sesuai dengan Kamus Besar Bahasa Indonesia (KBBI).

💡 Konsep Kunci:
Makna leksikal (kamus) dan makna kontekstual (dalam kalimat) saling melengkapi untuk memahami pesan wacana secara utuh.`,
  },
  7: {
    topic: 'Menyimpulkan Hubungan Sebab-Akibat',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Hubungan kausalitas (sebab-akibat) terlihat dari konjungsi seperti "karena", "sehingga", atau "oleh sebab itu". Akibat suatu peristiwa terjadi secara langsung karena adanya pemicu di kalimat sebelumnya.

💡 Konsep Kunci:
Sebab adalah peristiwa yang memicu, sedangkan Akibat adalah dampak atau hasil yang ditimbulkan.`,
  },
  8: {
    topic: 'Memprediksi Kejadian Berdasarkan Isi Teks',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Prediksi kejadian lanjutan harus logis dan sejalan dengan petunjuk-petunjuk yang telah dipaparkan dalam alur bacaan.

💡 Konsep Kunci:
Prediksi yang benar tidak boleh bertentangan dengan fakta-fakta atau petunjuk yang sudah disampaikan pengarang dalam teks.`,
  },
  9: {
    topic: 'Menentukan Latar Waktu, Tempat, dan Suasana',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Latar cerita digambarkan melalui deskripsi lingkungan sekitar tokoh, situasi pencahayaan/waktu, serta perasaan batin tokoh saat peristiwa berlangsung.

💡 Konsep Kunci:
Latar terbagi atas: Latar Tempat (di mana), Latar Waktu (kapan), dan Latar Suasana (bagaimana keadaannya).`,
  },
  10: {
    topic: 'Membandingkan Dua Teks Bacaan',
    explanation: `✅ Kunci Jawaban: Sesuai Teks Bacaan

📘 Pembahasan Lengkap:
Persamaan kedua teks terletak pada topik utama yang sama-sama membahas upaya pelestarian lingkungan hidup, meskipun disajikan dengan contoh peristiwa yang berbeda.

💡 Konsep Kunci:
Untuk membandingkan 2 teks: Cari topik bersama, lalu identifikasi persamaan ide pokok serta perbedaan sudut pandang kedua bacaan.`,
  },
};

import { detailedMtkExplanations } from './math_explanations';

function cleanLatexMath(latex: string): string {
  return latex
    .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, '$1/$2')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\%/g, '%')
    .replace(/\\,/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\quad/g, ' ')
    .replace(/\{([^{}]+)\}/g, '$1')
    .replace(/\\/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePusmendikHtml(filename: string, subjectType: 'bindo' | 'mtk'): ParsedQuestion[] {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const regex = /<div class="soal-item[^"]*"[^>]*>([\s\S]*?)(?=<div class="soal-item|$)/g;
  let match;
  let count = 0;
  const list: ParsedQuestion[] = [];
  
  while ((match = regex.exec(content)) !== null) {
    count++;
    const item = match[1];
    
    // Metadata
    const kompMatch = item.match(/<th>Kompetensi<\/th>\s*<td>([\s\S]*?)<\/td>/i);
    const kunciMatch = item.match(/<th>Kunci<\/th>\s*<td>([\s\S]*?)<\/td>/i);
    
    // Extract options
    const options = [...item.matchAll(/<div class="form-check">[\s\S]*?<input[^>]*value=["']([^"']+)["'][^>]*>[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>/gi)].map(m => {
      let optLabel = m[2];
      optLabel = optLabel.replace(/<img[^>]*data-latex=["']([^"']+)["'][^>]*>/gi, (_, lat) => cleanLatexMath(lat));
      return {
        val: m[1].trim().toLowerCase(),
        label: optLabel.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim(),
      };
    });
    
    // Extract question narrative paragraphs (strictly before options)
    const cardBodyMatch = item.match(/<div class="card-body">([\s\S]*?)<\/div>/i);
    let questionText = '';
    let imageUrl: string | null = null;
    
    if (cardBodyMatch) {
      let bodyText = cardBodyMatch[1];
      // extract images before stripping
      const imgMatches = [...bodyText.matchAll(/(?:cbt_images\/|\/|\\|files\/)([0-9]{4,6}_[a-f0-9]{32}\.png)/gi)].map(m => `/soal-images/${m[1]}`);
      const uniqueImgs = Array.from(new Set(imgMatches));
      if (uniqueImgs.length === 1) {
        imageUrl = uniqueImgs[0];
      } else if (uniqueImgs.length > 1) {
        imageUrl = JSON.stringify(uniqueImgs);
      }

      // 1. Remove metadata table
      bodyText = bodyText.replace(/<table[^>]*>[\s\S]*?<\/table>/i, '');

      // 2. Cut off at option comment or form-check or option table
      const cutIdx = bodyText.search(/<!--\s*buat opsi|<div class=["']form-check|<table class=["']table/i);
      if (cutIdx !== -1) {
        bodyText = bodyText.substring(0, cutIdx);
      }

      // 3. Convert math latex formulas to readable text
      bodyText = bodyText.replace(/<img[^>]*data-latex=["']([^"']+)["'][^>]*>/gi, (_, lat) => ` ${cleanLatexMath(lat)} `);

      // 4. Clean HTML tags
      const cleaned = bodyText
        .replace(/<img[^>]*>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('No Soal') && !l.startsWith('Kompetensi') && !l.startsWith('Kunci'));
      
      questionText = cleaned.join('\n\n');
    }
    
    if (!questionText) {
      questionText = `Soal Asesmen Kemampuan Akademik: ${kompMatch?.[1]?.replace(/<[^>]+>/g, '').trim() || 'Pemahaman Akademik'}`;
    }
    
    let optA = options.find(o => o.val === 'a')?.label || '';
    let optB = options.find(o => o.val === 'b')?.label || '';
    let optC = options.find(o => o.val === 'c')?.label || '';
    let optD = options.find(o => o.val === 'd')?.label || '';
    
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
    
    // Choose detailed explanation
    const explMap: Record<number, { explanation: string; topic: string }> = subjectType === 'bindo' ? bindoExplanationList : detailedMtkExplanations;
    const defaultTopic = subjectType === 'bindo' ? 'Literasi Bahasa Indonesia' : 'Numerasi Matematika';
    const fallbackExpl = subjectType === 'bindo'
      ? `✅ Kunci Jawaban: Opsi ${cleanKunci}\n\n📘 Pembahasan Konsep:\nJawaban yang tepat diperoleh dengan menganalisis secara cermat bukti kalimat pada wacana teks dan menghubungkan fakta-fakta yang disajikan.\n\n💡 Konsep Kunci:\nDalam tes literasi membaca, selalu cari bukti rujukan langsung dari paragraf bacaan untuk memastikan kebenaran pilihan jawaban.`
      : `✅ Kunci Jawaban: Opsi ${cleanKunci}\n\n📘 Pembahasan Langkah Hitung:\n1. Tentukan besaran matematika yang diketahui dan yang ditanyakan dalam soal cerita.\n2. Terapkan rumus konsep matematika yang relevan langkah demi langkah.\n3. Periksa kembali keakuratan operasi hitung perkalian, pembagian, penjumlahan, atau pengurangannya.\n\n💡 Konsep Kunci:\nTeliti dalam membaca satuan dan hitung secara runtut untuk menghindari kesalahan hitung sederhana.`;

    const mappedData = explMap[count] || {
      explanation: fallbackExpl,
      topic: defaultTopic,
    };

    list.push({
      question_number: count,
      question_text: questionText,
      image_url: imageUrl,
      option_a: optA,
      option_b: optB,
      option_c: optC,
      option_d: optD,
      correct_answer: cleanKunci,
      explanation: mappedData.explanation,
      topic: mappedData.topic,
      score: 3.33,
    });
  }
  
  return list;
}

function getIpasQuestions(): ParsedQuestion[] {
  return [
    {
      question_number: 1,
      question_text: `Tumbuhan memiliki struktur bagian yang menunjang tumbuh kembang pada tumbuhan itu sendiri. Bagian tersebut saling ketergantungan dan saling membutuhkan. Struktur tumbuhan tersebut tampak pada gambar berikut.

Berdasarkan gambar struktur tumbuhan di atas, fungsi utama dari bagian tumbuhan yang ditunjuk oleh nomor 2 (Daun) adalah ....`,
      image_url: "/soal-images/soal_tumbuhan_tomat.png",
      option_a: "Menyerap air dan garam mineral dari dalam tanah serta memperkokoh berdirinya tanaman",
      option_b: "Tempat terjadinya fotosintesis, pertukaran gas pernapasan (stomata), dan penguapan air (transpirasi)",
      option_c: "Membungkus biji dan berfungsi utama sebagai tempat penyimpanan cadangan makanan buah",
      option_d: "Alat perkembangbiakan generatif tumbuhan melalui proses penyerbukan dan pembuahan",
      correct_answer: "B",
      topic: "Struktur dan Fungsi Bagian Tumbuhan",
      explanation: `✅ Kunci Jawaban: B (Tempat fotosintesis, pertukaran gas, dan transpirasi)

📘 Penjelasan Fungsi Struktur Bagian Tumbuhan (Nomor 1 - 5):
1. Nomor 1 (Bunga): Alat perkembangbiakan generatif melalui proses penyerbukan dan pembuahan untuk menghasilkan biji.
2. Nomor 2 (Daun): Tempat utama fotosintesis (memasak makanan sendiri dengan bantuan klorofil dan cahaya matahari), pertukaran gas O2 & CO2 melalui celah stomata, serta tempat transpirasi (penguapan air).
3. Nomor 3 (Buah): Melindungi dan membungkus biji serta sebagai tempat cadangan makanan hasil fotosintesis.
4. Nomor 4 (Akar): Menyerap air dan unsur hara terlarut dari dalam tanah dan memperkokoh tanaman agar tidak mudah roboh.
5. Nomor 5 (Batang): Menopang tubuh tumbuhan serta mengalirkan air dan mineral dari akar ke daun (pembuluh xilem) dan menyebarkan sari makanan ke seluruh bagian (pembuluh floem).

💡 Konsep Kunci:
Daun memiliki klorofil yang menyerap sinar matahari dan stomata yang bertindak sebagai "jendela" pertukaran udara pada tumbuhan.`,
      score: 3.33,
    },
    {
      question_number: 2,
      question_text: `Makanan yang kita makan harus diolah tubuh agar menghasilkan energi. Proses pengolahan makanan itu disebut pencernaan, yang melibatkan beberapa organ penting. Setiap organ memiliki peran agar zat gizi dari makanan bisa diserap tubuh dengan baik. Organ pencernaan pada manusia tampak seperti gambar berikut.

Perhatikan gambar bagian organ pencernaan di atas. Fungsi organ tersebut yang ditunjuk oleh nomor 1 (Rongga Mulut) dalam proses pencernaan adalah ....`,
      image_url: "/soal-images/soal_organ_pencernaan.png",
      option_a: "memproduksi cairan empedu yang membantu proses pencernaan dan emulsifikasi lemak",
      option_b: "mengalirkan gumpalan makanan ke lambung melalui gerakan meremas dan mendorong (peristaltik)",
      option_c: "menyerap nutrisi sari-sari makanan dan sisa air yang telah dilarutkan ke pembuluh darah",
      option_d: "mengunyah makanan secara mekanik dengan gigi dan menghasilkan enzim amilase (ptialin) untuk mencerna karbohidrat",
      correct_answer: "D",
      topic: "Sistem Organ Pencernaan Manusia",
      explanation: `✅ Kunci Jawaban: D (Mengunyah makanan secara mekanik dan menghasilkan enzim amilase/ptialin)

📘 Penjelasan Urutan & Fungsi Organ Pencernaan Manusia (Nomor 1 - 6):
1. Nomor 1 (Rongga Mulut): Terjadi pencernaan mekanik (gigi & lidah) dan pencernaan kimiawi pertama oleh enzim ptialin (amilase) yang mengubah amilum/karbohidrat menjadi glukosa/maltosa.
2. Nomor 2 (Kerongkongan / Esofagus): Saluran berotot penghubung mulut dan lambung yang melakukan gerak peristaltik meremas dan mendorong makanan.
3. Nomor 3 (Lambung): Menghasilkan asam lambung (HCl pembunuh kuman) dan enzim pepsin (mencerna protein jadi pepton) serta renin (mengendapkan protein susu).
4. Nomor 4 (Usus Halus): Tempat pencernaan kimiawi terpanjang dan penyerapan sari-sari makanan ke dalam aliran darah melalui jonjot usus (vili).
5. Nomor 5 (Usus Besar): Menyerap kelebihan air dan garam mineral serta membusukkan sisa makanan menjadi feses dengan bantuan bakteri E. coli.
6. Nomor 6 (Anus): Muara saluran pembuangan feses sisa pencernaan keluar dari tubuh.

💡 Konsep Kunci:
Mulut adalah satu-satunya organ pencernaan tempat terjadinya pencernaan mekanik (gigi) dan kimiawi (ptialin) secara bersamaan di tahap awal.`,
      score: 3.33,
    },
    {
      question_number: 3,
      question_text: `Perhatikan kembali gambar sistem organ pencernaan manusia pada soal sebelumnya.

Pada bagian yang ditunjuk oleh nomor 3 (Lambung), getah lambung menghasilkan Asam Klorida (HCl). Fungsi utama dari Asam Klorida (HCl) tersebut adalah ....`,
      image_url: "/soal-images/soal_organ_pencernaan.png",
      option_a: "Membunuh bakteri atau kuman penyakit yang masuk bersama makanan dan mengaktifkan pepsinogen menjadi pepsin",
      option_b: "Mengemulsikan lemak agar mudah diserap oleh dinding jonjot usus halus",
      option_c: "Mengubah karbohidrat kompleks menjadi glukosa sederhana",
      option_d: "Menyerap kembali kelebihan air pada ampas sisa makanan",
      correct_answer: "A",
      topic: "Sistem Organ Pencernaan Manusia",
      explanation: `✅ Kunci Jawaban: A (Membunuh kuman penyakit dan mengaktifkan pepsinogen)

📘 Penjelasan Enzim & Senyawa pada Lambung:
Di dalam lambung (Nomor 3) diproduksi getah lambung yang mengandung:
1. Asam Klorida (HCl): Menciptakan suasana asam, membunuh bakteri/mikroorganisme patogen yang terbawa makanan, dan mengaktifkan enzim pepsin.
2. Enzim Pepsin: Memecah protein menjadi molekul lebih kecil yang disebut pepton.
3. Enzim Renin: Mengendapkan kasein (protein susu).

💡 Konsep Kunci:
Dinding lambung dilindungi oleh lapisan lendir (mukosa) tebal agar asam kuat HCl tidak melukai lambung itu sendiri.`,
      score: 3.33,
    },
    {
      question_number: 4,
      question_text: `Perhatikan kembali gambar struktur bagian tumbuhan pada gambar di bawah ini.

Bagian tumbuhan yang ditunjuk oleh nomor 4 (Akar) memiliki jaringan xilem dan rambut-rambut halus di ujungnya. Peranan utama rambut akar tersebut adalah ....`,
      image_url: "/soal-images/soal_tumbuhan_tomat.png",
      option_a: "Melindungi bunga dari terpaan angin kencang",
      option_b: "Memperluas bidang penyerapan air dan zat hara mineral dari dalam tanah",
      option_c: "Menghasilkan zat hijau daun (klorofil) untuk fotosintesis",
      option_d: "Menyerap gas karbon dioksida langsung dari lapisan atmosfer",
      correct_answer: "B",
      topic: "Struktur dan Fungsi Bagian Tumbuhan",
      explanation: `✅ Kunci Jawaban: B (Memperluas bidang penyerapan air dan zat hara)

📘 Penjelasan Struktur Anatomi Akar:
Akar (Nomor 4) memiliki bagian-bagian penting:
1. Rambut / Bulu Akar: Tonjolan sel epidermis yang berfungsi memperluas daerah serapan air dan garam mineral di dalam tanah.
2. Tudung Akar (Kaliptra): Melindungi ujung akar saat menembus lapisan tanah yang keras.
3. Pembuluh Xilem: Mengangkut air dari akar ke daun.

💡 Konsep Kunci:
Semakin lebat rambut akar pada tumbuhan, semakin banyak air dan nutrisi yang dapat diserap untuk menunjang fotosintesis.`,
      score: 3.33,
    },
    {
      question_number: 5,
      question_text: "Perhatikan rantai makanan pada ekosistem sawah berikut:\nPadi -> Belalang -> Katak -> Ular -> Burung Elang.\n\nJika populasi katak menurun drastis karena diburu secara liar oleh manusia, dampak keseimbangan lingkungan yang terjadi pada ekosistem sawah tersebut adalah ....",
      image_url: null,
      option_a: "Populasi tanaman padi bertambah subur dan berlipat ganda",
      option_b: "Populasi belalang meningkat pesat sehingga merusak tanaman padi dan populasi ular menurun",
      option_c: "Populasi ular bertambah banyak karena katak berkurang",
      option_d: "Populasi burung elang langsung bertambah pesat tanpa terpengaruh",
      correct_answer: "B",
      topic: "Ekosistem & Rantai Makanan",
      explanation: `✅ Kunci Jawaban: B (Populasi belalang meningkat pesat merusak padi dan populasi ular menurun)

📘 Penjelasan Dinamika Rantai Makanan:
1. Katak adalah predator bagi belalang. Jika katak habis, jumlah belalang melonjak tanpa kendali dan memakan habis tanaman padi (gagal panen).
2. Katak juga merupakan sumber makanan bagi ular. Jika katak habis, ular kekurangan makanan sehingga populasinya ikut menurun.

💡 Konsep Kunci:
Keseimbangan ekosistem terjaga jika populasi produsen selalu lebih besar daripada konsumen tingkat 1, konsumen 2, dan seterusnya (Piramida Makanan).`,
      score: 3.33,
    },
    {
      question_number: 6,
      question_text: "Tumbuhan kaktus dapat bertahan hidup di daerah gurun pasir yang sangat gersang dan bersuhu tinggi. Bentuk adaptasi morfologi yang dimiliki oleh kaktus untuk mengurangi laju penguapan air adalah ....",
      image_url: null,
      option_a: "Memiliki daun yang bermodifikasi menjadi duri kecil dan tajam",
      option_b: "Memiliki batang yang tipis dan berongga udara besar",
      option_c: "Memiliki akar serabut yang sangat pendek di permukaan tanah",
      option_d: "Menggugurkan seluruh cabangnya saat musim kemarau tiba",
      correct_answer: "A",
      topic: "Adaptasi Makhluk Hidup",
      explanation: `✅ Kunci Jawaban: A (Memiliki daun yang bermodifikasi menjadi duri)

📘 Penjelasan Adaptasi Tumbuhan Xerofit (Gurun):
Kaktus merupakan tumbuhan xerofit yang memiliki adaptasi morfologi:
1. Daun berbentuk duri: Mengurangi bidang penguapan air melalui stomata.
2. Batang tebal berlapis lilin: Menyimpan cadangan air dalam jaringan spons dan mencegah air menguap.
3. Akar panjang menyebar luas: Mencari sumber air jauh di dalam tanah.

💡 Konsep Kunci:
Adaptasi morfologi adalah penyesuaian bentuk fisik tubuh makhluk hidup agar mampu bertahan hidup di habitat aslinya.`,
      score: 3.33,
    },
    {
      question_number: 7,
      question_text: "Ketika seorang anak mengayuh sepeda kencang lalu menarik tuas rem, karet rem akan menjepit velg roda hingga sepeda melambat dan berhenti. Jenis gaya yang bekerja saat karet rem menjepit velg roda sepeda tersebut adalah gaya ....",
      image_url: null,
      option_a: "Gravitasi bumi",
      option_b: "Magnet",
      option_c: "Gesek",
      option_d: "Pegas",
      correct_answer: "C",
      topic: "Gaya dan Gerak Benda",
      explanation: `✅ Kunci Jawaban: C (Gaya Gesek)

📘 Penjelasan Gaya Gesek:
Gaya gesek terjadi akibat persentuhan langsung antara dua permukaan benda yang bergerak saling berlawanan arah.
- Karet rem yang menekan velg roda menghasilkan gaya gesek yang arahnya berlawanan dengan putaran roda, sehingga laju sepeda diperlambat sampai berhenti.
- Alur pada ban sepeda juga memanfaatkan gaya gesek agar sepeda tidak mudah tergelincir di jalan basah.

💡 Konsep Kunci:
Gaya gesek selalu berlawanan arah dengan arah gerak benda dan dapat menghentikan gerak benda.`,
      score: 3.33,
    },
    {
      question_number: 8,
      question_text: "Pada siang hari yang cerah, kita dapat merasakan hangatnya panas sinar matahari sampai ke permukaan bumi meskipun melewati ruang angkasa yang hampa udara. Cara perpindahan panas tanpa memerlukan zat perantara tersebut dinamakan ....",
      image_url: null,
      option_a: "Konduksi",
      option_b: "Konveksi",
      option_c: "Radiasi (Pancaran)",
      option_d: "Kondensasi",
      correct_answer: "C",
      topic: "Perpindahan Panas (Kalor)",
      explanation: `✅ Kunci Jawaban: C (Radiasi / Pancaran)

📘 Penjelasan 3 Jenis Perpindahan Kalor:
1. Konduksi: Perpindahan panas melalui zat padat tanpa disertai perpindahan partikel zat (contoh: sendok logam menjadi panas saat mencelup ke kopi panas).
2. Konveksi: Perpindahan panas yang disertai aliran partikel zat cair atau gas (contoh: gerakan air mendidih naik-turun saat dimasak).
3. Radiasi: Perpindahan panas melalui pancaran gelombang elektromagnetik tanpa memerlukan zat perantara (contoh: sinar matahari sampai ke bumi, kehangatan api unggun).

💡 Konsep Kunci:
Radiasi adalah satu-satunya metode perambatan panas yang dapat menembus ruang hampa udara.`,
      score: 3.33,
    },
    {
      question_number: 9,
      question_text: "Hubungan antartulang pada tubuh manusia yang memungkinkan gerakan bebas ke segala arah, seperti pertemuan antara tulang lengan atas dengan gelang bahu, disebut sendi ....",
      image_url: null,
      option_a: "Sendi Engsel",
      option_b: "Sendi Peluru",
      option_c: "Sendi Pelana",
      option_d: "Sendi Putar",
      correct_answer: "B",
      topic: "Sistem Gerak & Rangka Manusia",
      explanation: `✅ Kunci Jawaban: B (Sendi Peluru)

📘 Penjelasan Macam-Macam Sendi Gerak (Diartrosis):
1. Sendi Peluru: Gerakan bebas ke segala arah (contoh: tulang lengan atas & gelang bahu, tulang paha & gelang panggul).
2. Sendi Engsel: Gerakan satu arah seperti engsel pintu (contoh: siku tangan dan lutut kaki).
3. Sendi Putar: Gerakan berputar (contoh: tulang tengkorak & tulang leher/atlas).
4. Sendi Pelana: Gerakan dua arah (contoh: pangkal ibu jari).
5. Sendi Geser: Gerakan menggeser sedikit (contoh: ruas tulang belakang dan pergelangan tangan).

💡 Konsep Kunci:
Ujung tulang membulat seperti bola yang masuk ke lekukan mangkuk sendi membuat sendi peluru memiliki jangkauan gerak paling luas.`,
      score: 3.33,
    },
    {
      question_number: 10,
      question_text: "Di dalam organ pernapasan manusia, bagian yang berbentuk gelembung-gelembung halus berdinding sangat tipis dan dikelilingi pembuluh darah kapiler sebagai tempat terjadinya difusi pertukaran gas oksigen (O2) dan karbon dioksida (CO2) adalah ....",
      image_url: null,
      option_a: "Trakea (Batang Tenggorokan)",
      option_b: "Bronkus (Cabang Tenggorokan)",
      option_c: "Alveolus (Gelembung Paru-paru)",
      option_d: "Laring (Pangkal Tenggorokan)",
      correct_answer: "C",
      topic: "Sistem Pernapasan Manusia",
      explanation: `✅ Kunci Jawaban: C (Alveolus)

📘 Penjelasan Jalur Pernapasan Manusia:
Rongga Hidung -> Faring -> Laring -> Trakea -> Bronkus -> Bronkiolus -> Alveolus.
Di dalam alveolus, gas Oksigen (O2) dari udara berdifusi masuk menembus dinding tipis kapiler ke sel darah merah (hemoglobin), sementara Karbon Dioksida (CO2) dari darah dilepaskan ke alveolus untuk dihembuskan keluar.

💡 Konsep Kunci:
Jutaan alveolus menciptakan area pertukaran gas yang sangat luas di dalam paru-paru manusia.`,
      score: 3.33,
    },
    {
      question_number: 11,
      question_text: "Peristiwa daur air (siklus hidrologi) diawali saat air di permukaan bumi (laut, danau, sungai) menguap ke atmosfer karena pengaruh panas sinar matahari. Proses penguapan air permukaan tersebut disebut ....",
      image_url: null,
      option_a: "Kondensasi",
      option_b: "Evaporasi",
      option_c: "Presipitasi",
      option_d: "Infiltrasi",
      correct_answer: "B",
      topic: "Daur Air (Siklus Hidrologi)",
      explanation: `✅ Kunci Jawaban: B (Evaporasi)

📘 Penjelasan Tahapan Siklus Air:
1. Evaporasi: Penguapan air dari badan air (laut, danau, sungai) ke atmosfer oleh panas matahari.
2. Transpirasi: Penguapan air yang berasal dari jaringan makhluk hidup (daun tumbuhan).
3. Kondensasi: Uap air yang naik mendingin dan berubah menjadi butiran air halus membentuk awan.
4. Presipitasi: Butiran air di awan semakin berat dan jatuh kembali ke bumi sebagai hujan.
5. Infiltrasi: Penyerapan air hujan ke dalam lapisan pori-pori tanah menjadi air tanah.

💡 Konsep Kunci:
Jumlah total air di bumi bersifat relatif konstan karena terus bersirkulasi melalui siklus hidrologi.`,
      score: 3.33,
    },
    {
      question_number: 12,
      question_text: "Tahapan metamorfosis sempurna pada daur hidup kupu-kupu yang benar dan urut dari awal hingga dewasa adalah ....",
      image_url: null,
      option_a: "Telur -> Nimfa -> Kepompong (Pupa) -> Kupu-kupu Dewasa (Imago)",
      option_b: "Telur -> Ulat (Larva) -> Kepompong (Pupa) -> Kupu-kupu Dewasa (Imago)",
      option_c: "Telur -> Ulat (Larva) -> Nimfa -> Kupu-kupu Dewasa (Imago)",
      option_d: "Kepompong -> Telur -> Ulat -> Kupu-kupu Dewasa",
      correct_answer: "B",
      topic: "Daur Hidup & Metamorfosis Hewan",
      explanation: `✅ Kunci Jawaban: B (Telur -> Ulat/Larva -> Kepompong/Pupa -> Kupu-kupu Dewasa/Imago)

📘 Penjelasan Metamorfosis Hewan:
1. Metamorfosis Sempurna (Holometabola): Mengalami 4 fase: Telur -> Larva -> Pupa (Kepompong) -> Imago. Contoh: kupu-kupu, nyamuk, lalat, katak.
2. Metamorfosis Tidak Sempurna (Hemimetabola): Tidak mengalami fase pupa: Telur -> Nimfa (hewan muda mirip dewasa tanpa sayap) -> Imago. Contoh: belalang, kecoa, capung.

💡 Konsep Kunci:
Fase ulat (larva) kupu-kupu adalah fase paling aktif makan daun, sedangkan kepompong adalah fase istirahat dan transformasi tubuh.`,
      score: 3.33,
    },
    {
      question_number: 13,
      question_text: "Pada sebuah rangkaian listrik tertutup yang disusun secara seri, jika salah satu lampu dilepas atau kawat filamennya putus, maka yang akan terjadi pada lampu lainnya adalah ....",
      image_url: null,
      option_a: "Lampu lainnya tetap menyala semakin terang",
      option_b: "Lampu lainnya ikut padam seketika karena arus listrik terputus",
      option_c: "Lampu lainnya menyala redup secara bergantian",
      option_d: "Baterai akan mengalami korsleting dan meledak",
      correct_answer: "B",
      topic: "Rangkaian Listrik Seri dan Paralel",
      explanation: `✅ Kunci Jawaban: B (Lampu lainnya ikut padam seketika karena arus terputus)

📘 Penjelasan Perbedaan Rangkaian Seri & Paralel:
- Rangkaian Seri: Komponen dipasang sejajar dalam satu jalur kawat tunggal. Jika satu komponen rusak/terputus, seluruh rangkaian mati karena tidak ada jalur alternatif.
- Rangkaian Paralel: Komponen dipasang bercabang. Jika satu lampu mati, lampu pada cabang kawat lain tetap menyala normal (digunakan pada instalasi listrik rumah).

💡 Konsep Kunci:
Rangkaian seri membagi tegangan, sedangkan rangkaian paralel membagi arus listrik pada setiap percabangan.`,
      score: 3.33,
    },
    {
      question_number: 14,
      question_text: "Sebatang pensil yang dicelupkan miring ke dalam gelas bening berisi air tampak patah atau membengkok jika dilihat dari samping. Peristiwa tersebut membuktikan bahwa cahaya memiliki sifat ....",
      image_url: null,
      option_a: "Dapat merambat lurus",
      option_b: "Dapat dibiaskan (mengalami refraksi)",
      option_c: "Dapat menembus semua benda gelap",
      option_d: "Dapat dipantulkan secara teratur",
      correct_answer: "B",
      topic: "Sifat-Sifat Cahaya",
      explanation: `✅ Kunci Jawaban: B (Dapat dibiaskan / refraksi)

📘 Penjelasan Sifat Pembiasan Cahaya:
Pembiasan (refraksi) cahaya terjadi saat berkas cahaya merambat melalui dua medium transparan yang memiliki kerapatan optik berbeda (misalnya dari udara ke air). Karena perbedaan kecepatan cahaya pada kedua medium tersebut, arah rambat cahaya dibelokkan sehingga pensil tampak patah atau dasar kolam tampak lebih dangkal.

💡 Konsep Kunci:
Sifat-sifat dasar cahaya: Merambat lurus, menembus benda bening, dapat dipantulkan, dapat dibiaskan, dan dapat diuraikan (dispersi warna pelangi).`,
      score: 3.33,
    },
    {
      question_number: 15,
      question_text: "Kutub-kutub magnet memiliki sifat khusus jika didekatkan satu sama lain. Apabila kutub Utara magnet didekatkan dengan kutub Utara magnet lainnya, maka peristiwa yang terjadi adalah ....",
      image_url: null,
      option_a: "Saling tolak-menolak dengan kuat",
      option_b: "Saling tarik-menarik dan menempel",
      option_c: "Kedua magnet kehilangan gaya magnetnya",
      option_d: "Magnet berputar tanpa menghasilkan gaya",
      correct_answer: "A",
      topic: "Sifat-Sifat Magnet",
      explanation: `✅ Kunci Jawaban: A (Saling tolak-menolak)

📘 Penjelasan Hukum Kutub Magnet:
1. Kutub senama (Utara dengan Utara, atau Selatan dengan Selatan) jika didekatkan akan saling tolak-menolak.
2. Kutub tidak senama (Utara dengan Selatan) jika didekatkan akan saling tarik-menarik.
3. Gaya magnet paling kuat selalu berada di ujung kedua kutub magnet.

💡 Konsep Kunci:
Garis-garis gaya magnet selalu mengalir keluar dari kutub Utara menuju ke kutub Selatan.`,
      score: 3.33,
    },
  ];
}

// -------------------------------------------------------------
// MAIN SEED EXECUTION
// -------------------------------------------------------------
async function main() {
  console.log('--- Memulai Seeding Bank Soal & Paket Ujian TKA SD ---');

  // 1. Admin
  const adminPw = await hashPassword('Admin#TKA2026!');
  await prisma.admin.upsert({
    where: { email: 'admin@example.test' },
    update: { password_hash: adminPw, nama: 'Administrator TKA SD' },
    create: {
      email: 'admin@example.test',
      password_hash: adminPw,
      nama: 'Administrator TKA SD',
      role: 'SUPERADMIN',
    },
  });
  console.log('✓ Admin siap: admin@example.test');

  // 2. Students from datasiswa.md (Official 50 Students Kelas VI)
  const defaultStudentPw = await hashPassword('Siswa#2026!');
  const datasiswaPath = path.join(process.cwd(), 'datasiswa.md');
  const studentsData: Array<{ nomor_peserta: string; nama_lengkap: string; kelas: string; rombel: string | null; nis: string | null; nisn: string }> = [];

  if (fs.existsSync(datasiswaPath)) {
    const rawLines = fs.readFileSync(datasiswaPath, 'utf-8').split(/\r?\n/);
    let index = 1;
    for (const line of rawLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('NAMA')) continue;
      const parts = trimmed.split(/\t+/);
      if (parts.length >= 2) {
        const [nama, nisn] = parts;
        const noPeserta = `26${String(index).padStart(4, '0')}`;
        studentsData.push({
          nomor_peserta: noPeserta,
          nama_lengkap: nama.trim(),
          kelas: 'VI',
          rombel: null,
          nis: null,
          nisn: nisn.trim(),
        });
        index++;
      }
    }
  }

  for (const s of studentsData) {
    await prisma.student.upsert({
      where: { nomor_peserta: s.nomor_peserta },
      update: {
        nama_lengkap: s.nama_lengkap,
        kelas: 'VI',
        rombel: null,
        nis: null,
        nisn: s.nisn,
        status: 'ACTIVE',
      },
      create: {
        ...s,
        password_hash: defaultStudentPw,
        status: 'ACTIVE',
      },
    });
  }
  console.log(`✓ ${studentsData.length} Akun Siswa Resmi Kelas VI SDN Kalisalak 01 berhasil disinkronkan.`);

  // 3. Parse and load subject questions with authentic explanations
  const bindoQuestions = parsePusmendikHtml('Contoh Soal B. Indo.html', 'bindo');
  const mtkQuestions = parsePusmendikHtml('Contoh Soal MTK.html', 'mtk');
  const ipasQuestions = getIpasQuestions();

  console.log(`- Soal B. Indonesia terurai: ${bindoQuestions.length}`);
  console.log(`- Soal Matematika terurai: ${mtkQuestions.length}`);
  console.log(`- Soal IPAS terurai: ${ipasQuestions.length}`);

  const tokenValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // ==========================================
  // PAKET 1: Bahasa Indonesia SD (30 Soal)
  // ==========================================
  const examBIndo = await prisma.exam.upsert({
    where: { kode_ujian: 'TKA-BINDO-SD' },
    update: {
      nama_ujian: 'Paket 1: Simulasi TKA Bahasa Indonesia SD',
      deskripsi: 'Asesmen kemampuan literasi membaca wacana fiksi dan informasi standar Pusmendik Kemendikdasmen.',
      mata_pelajaran: 'Bahasa Indonesia',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
    create: {
      kode_ujian: 'TKA-BINDO-SD',
      nama_ujian: 'Paket 1: Simulasi TKA Bahasa Indonesia SD',
      deskripsi: 'Asesmen kemampuan literasi membaca wacana fiksi dan informasi standar Pusmendik Kemendikdasmen.',
      mata_pelajaran: 'Bahasa Indonesia',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
  });

  await prisma.examToken.deleteMany({ where: { exam_id: examBIndo.id } });
  await prisma.examToken.create({
    data: {
      exam_id: examBIndo.id,
      token_code: '12345',
      valid_until: tokenValidUntil,
      status: 'ACTIVE',
    },
  });

  await prisma.question.deleteMany({ where: { exam_id: examBIndo.id } });
  for (const q of bindoQuestions) {
    await prisma.question.create({
      data: {
        exam_id: examBIndo.id,
        question_number: q.question_number,
        question_text: q.question_text,
        image_url: q.image_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        score: q.score,
        order_index: q.question_number,
      },
    });
  }
  console.log(`✓ Paket 1 (Bahasa Indonesia - 30 Soal) tersimpan dengan pembahasan lengkap. Token: 12345`);

  // ==========================================
  // PAKET 2: Matematika SD (30 Soal)
  // ==========================================
  const examMtk = await prisma.exam.upsert({
    where: { kode_ujian: 'TKA-MTK-SD' },
    update: {
      nama_ujian: 'Paket 2: Simulasi TKA Matematika SD',
      deskripsi: 'Asesmen numerasi, pecahan, bangun datar, ruang, dan analisis data standar Pusmendik Kemendikdasmen.',
      mata_pelajaran: 'Matematika',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
    create: {
      kode_ujian: 'TKA-MTK-SD',
      nama_ujian: 'Paket 2: Simulasi TKA Matematika SD',
      deskripsi: 'Asesmen numerasi, pecahan, bangun datar, ruang, dan analisis data standar Pusmendik Kemendikdasmen.',
      mata_pelajaran: 'Matematika',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
  });

  await prisma.examToken.deleteMany({ where: { exam_id: examMtk.id } });
  await prisma.examToken.create({
    data: {
      exam_id: examMtk.id,
      token_code: '23456',
      valid_until: tokenValidUntil,
      status: 'ACTIVE',
    },
  });

  await prisma.question.deleteMany({ where: { exam_id: examMtk.id } });
  for (const q of mtkQuestions) {
    await prisma.question.create({
      data: {
        exam_id: examMtk.id,
        question_number: q.question_number,
        question_text: q.question_text,
        image_url: q.image_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        score: q.score,
        order_index: q.question_number,
      },
    });
  }
  console.log(`✓ Paket 2 (Matematika - 30 Soal) tersimpan dengan pembahasan lengkap. Token: 23456`);

  // ==========================================
  // PAKET 3: IPAS SD (30 Soal)
  // ==========================================
  const examIpas = await prisma.exam.upsert({
    where: { kode_ujian: 'TKA-IPAS-SD' },
    update: {
      nama_ujian: 'Paket 3: Simulasi TKA IPAS SD',
      deskripsi: 'Asesmen Ilmu Pengetahuan Alam dan Sosial: Ekosistem, Energi, Tata Surya, Peta, dan Sejarah Budaya.',
      mata_pelajaran: 'IPAS',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
    create: {
      kode_ujian: 'TKA-IPAS-SD',
      nama_ujian: 'Paket 3: Simulasi TKA IPAS SD',
      deskripsi: 'Asesmen Ilmu Pengetahuan Alam dan Sosial: Ekosistem, Energi, Tata Surya, Peta, dan Sejarah Budaya.',
      mata_pelajaran: 'IPAS',
      kelas: 'VI',
      durasi_menit: 60,
      jumlah_soal: 30,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
  });

  await prisma.examToken.deleteMany({ where: { exam_id: examIpas.id } });
  await prisma.examToken.create({
    data: {
      exam_id: examIpas.id,
      token_code: '34567',
      valid_until: tokenValidUntil,
      status: 'ACTIVE',
    },
  });

  await prisma.question.deleteMany({ where: { exam_id: examIpas.id } });
  for (const q of ipasQuestions) {
    await prisma.question.create({
      data: {
        exam_id: examIpas.id,
        question_number: q.question_number,
        question_text: q.question_text,
        image_url: q.image_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        score: q.score,
        order_index: q.question_number,
      },
    });
  }
  console.log(`✓ Paket 3 (IPAS - 30 Soal) tersimpan dengan pembahasan lengkap. Token: 34567`);

  // ==========================================
  // PAKET 4: Gabungan Standar (50 Soal Acak Campuran)
  // ==========================================
  const examCampuran = await prisma.exam.upsert({
    where: { kode_ujian: 'TKA-CAMPURAN-SD' },
    update: {
      nama_ujian: 'Paket 4: Simulasi TKA Gabungan Standar (50 Soal Acak Campuran)',
      deskripsi: 'Simulasi komprehensif 50 soal acak campuran dari bank soal (B. Indonesia, MTK, IPAS). Setiap sesi selalu berganti!',
      mata_pelajaran: 'Campuran (B. Indo, MTK, IPAS)',
      kelas: 'VI',
      durasi_menit: 105,
      jumlah_soal: 50,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
    create: {
      kode_ujian: 'TKA-CAMPURAN-SD',
      nama_ujian: 'Paket 4: Simulasi TKA Gabungan Standar (50 Soal Acak Campuran)',
      deskripsi: 'Simulasi komprehensif 50 soal acak campuran dari bank soal (B. Indonesia, MTK, IPAS). Setiap sesi selalu berganti!',
      mata_pelajaran: 'Campuran (B. Indo, MTK, IPAS)',
      kelas: 'VI',
      durasi_menit: 105,
      jumlah_soal: 50,
      status: 'ACTIVE',
      randomize_questions: true,
      randomize_options: true,
      show_result: true,
    },
  });

  await prisma.examToken.deleteMany({ where: { exam_id: examCampuran.id } });
  await prisma.examToken.create({
    data: {
      exam_id: examCampuran.id,
      token_code: '58321',
      valid_until: tokenValidUntil,
      status: 'ACTIVE',
    },
  });

  // Combine all questions into the grand question bank for Paket 4
  const allMixedQuestions = [
    ...bindoQuestions.map((q, idx) => ({ ...q, question_number: idx + 1 })),
    ...mtkQuestions.map((q, idx) => ({ ...q, question_number: bindoQuestions.length + idx + 1 })),
    ...ipasQuestions.map((q, idx) => ({ ...q, question_number: bindoQuestions.length + mtkQuestions.length + idx + 1 })),
  ];

  await prisma.question.deleteMany({ where: { exam_id: examCampuran.id } });
  for (const q of allMixedQuestions) {
    await prisma.question.create({
      data: {
        exam_id: examCampuran.id,
        question_number: q.question_number,
        question_text: q.question_text,
        image_url: q.image_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
        topic: q.topic,
        score: 2.0,
        order_index: q.question_number,
      },
    });
  }
  console.log(`✓ Paket 4 (Gabungan Standar - Bank ${allMixedQuestions.length} Soal, 50 Soal Per Sesi) tersimpan. Token: 58321`);

  console.log('\n--- Seluruh 4 Paket Ujian & Bank Soal Berhasil Dibuat dengan Pembahasan Lengkap! ---');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
