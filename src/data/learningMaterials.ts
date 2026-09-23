export interface MiniQuizQuestion {
  id: string;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface LearningChapter {
  id: string;
  subject: 'Bahasa Indonesia' | 'Matematika' | 'IPAS';
  subjectCode: 'bindo' | 'mtk' | 'ipas';
  chapterNumber: number;
  title: string;
  subtitle: string;
  durationMinutes: number;
  iconName: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    gradient: string;
  };
  summaryPoints: string[];
  contentSections: {
    title: string;
    paragraphs: string[];
    tips?: string;
    formula?: string;
    example?: {
      problem: string;
      stepByStep: string[];
      conclusion: string;
    };
  }[];
  quickFormula?: {
    title: string;
    formulaText: string;
    description: string;
  };
  miniQuiz: MiniQuizQuestion[];
}

export const LEARNING_MATERIALS: LearningChapter[] = [
  // =========================================================================
  // BAHASA INDONESIA
  // =========================================================================
  {
    id: 'bindo-1',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 1,
    title: 'Literasi Membaca: Ide Pokok, Kalimat Utama & Simpulan Teks',
    subtitle: 'Kuasai teknik menemukan ide pokok di awal/akhir paragraf, informasi tersurat, tersirat, dan membedakan fakta vs opini.',
    durationMinutes: 15,
    iconName: 'BookOpen',
    color: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-600 to-indigo-600',
    },
    summaryPoints: [
      'Ide Pokok (Gagasan Utama): Inti masalah yang mendasari seluruh isi paragraf. Bersifat umum.',
      'Paragraf Deduktif: Kalimat utama di AWAL (Depan). Pola: Umum -> Khusus.',
      'Paragraf Induktif: Kalimat utama di AKHIR (Belakang). Pola: Khusus -> Simpulan Umum (Ciri: kata "Oleh karena itu", "Dengan demikian", "Jadi").',
      'Informasi Tersurat: Jawaban tertulis jelas di dalam teks bacaan.',
      'Informasi Tersirat: Informasi tersembunyi yang harus disimpulkan dari petunjuk situasi / konteks.',
      'Fakta vs Opini: Fakta sudah pasti terjadi dan dapat dibuktikan data/angka; Opini berupa pendapat, dugaan, atau kata sifat subjektif ("sangat indah", "sebaiknya").',
    ],
    contentSections: [
      {
        title: '1. Metode 3 Langkah Menemukan Ide Pokok Kilat',
        paragraphs: [
          'Langkah 1: Baca kalimat pertama dan kalimat terakhir paragraf.',
          'Langkah 2: Cermati kata kunci yang sering diulang (*repetisi*).',
          'Langkah 3: Tentukan kalimat mana yang paling umum. Jika kalimat pertama menjelaskan keseluruhan topik, maka paragraf tersebut adalah Deduktif.',
        ],
        tips: 'Ingat rumus D-I: Deduktif di Depan, Induktif di Belakang (ada kata penghubung simpulan di akhir).',
      },
      {
        title: '2. Trik Menggali Informasi dengan Rumus 5W + 1H (ADiKSiMBa)',
        paragraphs: [
          'Apa (What): Menanyakan benda, peristiwa, atau topik pokok.',
          'Di mana (Where): Menanyakan tempat atau lokasi kejadian.',
          'Kapan (When): Menanyakan waktu kejadian.',
          'Siapa (Who): Menanyakan orang atau tokoh yang terlibat.',
          'Mengapa (Why): Menanyakan sebab atau alasan peristiwa terjadi.',
          'Bagaimana (How): Menanyakan proses, keadaan, atau cara melakukan sesuatu.',
        ],
        example: {
          problem: 'Teks: "Akibat curah hujan tinggi sejak semalam, Sungai Gung meluap dan merendam ratusan rumah di Desa Kalisalak pada Rabu dini hari. Warga segera dievakuasi oleh tim BPBD menuju posko pengungsian menggunakan perahu karet." Mengapa warga dievakuasi?',
          stepByStep: [
            'Langkah 1: Identifikasi kata tanya "Mengapa" (mencari sebab/alasan).',
            'Langkah 2: Cari kata kunci peristiwa dalam teks: "merendam ratusan rumah", "Sungai Gung meluap", "curah hujan tinggi".',
            'Langkah 3: Rumuskan sebabnya dengan tepat sesuai fakta teks.',
          ],
          conclusion: 'Warga dievakuasi karena rumah mereka terendam banjir akibat luapan Sungai Gung yang disebabkan curah hujan tinggi.',
        },
      },
    ],
    quickFormula: {
      title: 'RUMUS CEPAT IDENTIFIKASI PARAGRAF',
      formulaText: 'Deduktif = Depan (Umum ➔ Khusus) | Induktif = Belakang (Ada kata: Jadi, Oleh sebab itu)',
      description: 'Gunakan rumus ini untuk menjawab soal ide pokok kurang dari 30 detik.',
    },
    miniQuiz: [
      {
        id: 'bq1',
        question: 'Kalimat utama paragraf deduktif terletak pada ....',
        options: [
          { key: 'A', text: 'Akhir paragraf' },
          { key: 'B', text: 'Awal paragraf' },
          { key: 'C', text: 'Tengah paragraf' },
          { key: 'D', text: 'Terserak di seluruh kalimat' },
        ],
        correctAnswer: 'B',
        explanation: 'Paragraf deduktif memiliki kalimat utama di bagian awal (Depan) yang kemudian diikuti oleh kalimat-kalimat penjelas.',
      },
      {
        id: 'bq2',
        question: 'Manakah di bawah ini yang merupakan kalimat FAKTA?',
        options: [
          { key: 'A', text: 'Pemandangan di Pantai Purwahamba Indah sangat mempesona.' },
          { key: 'B', text: 'Upacara bendera hari Senin diikuti oleh seluruh siswa SDN Kalisalak 01.' },
          { key: 'C', text: 'Belajar matematika terasa lebih mudah dan menyenangkan.' },
          { key: 'D', text: 'Baju merah itu sepertinya cocok untuk dipakai Andi.' },
        ],
        correctAnswer: 'B',
        explanation: 'Pilihan B adalah fakta nyata yang dapat dibuktikan kebenarannya tanpa memuat unsur penilaian subjektif.',
      },
    ],
  },
  {
    id: 'bindo-2',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 2,
    title: 'Analisis Sastra: Watak Tokoh, Latar, Majas & Amanat Cerita',
    subtitle: 'Bedah unsur intrinsik dongeng, fabel, puisi, ungkapan/peribahasa, dan pesan moral dalam soal cerita TKA.',
    durationMinutes: 18,
    iconName: 'Sparkles',
    color: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      badge: 'bg-cyan-100 text-cyan-800',
      gradient: 'from-cyan-600 to-blue-600',
    },
    summaryPoints: [
      'Watak Tokoh: Protagonis (baik/positif), Antagonis (penentang/jahat), Tritagonis (penengah/pendukung).',
      'Cara Mengetahui Watak Tokoh: Melalui dialog ucapan, tindakan fisik saat ada masalah, dan tanggapan tokoh lain.',
      'Latar (Setting): Tempat (di mana), Waktu (pagi/siang/malam/masa lalu), Suasana (sedih/gembira/tegang).',
      'Amanat: Pesan moral positif yang dapat diteladani oleh siswa dalam kehidupan sehari-hari.',
      'Ungkapan & Peribahasa Populer: Ringan tangan (suka menolong), Lapang dada (ikhlas/sabar), Kepala dingin (tenang), Berat hati (enggan/ragu).',
    ],
    contentSections: [
      {
        title: '1. Trik Menentukan Amanat Cerita Tanpa Terjebak Pilihan Salah',
        paragraphs: [
          'Amanat selalu berupa nasihat kebajikan (misal: pentingnya jujur, tidak sombong, berbakti, tolong-menolong).',
          'Pilihan jawaban yang memuat kata negatif (seperti "balas dendamlah", "hiraukan teman") pasti SALAH.',
          'Pilihlah kalimat simpulan yang mencakup keseluruhan cerita, bukan hanya sepenggal adegan.',
        ],
        tips: 'Amanat yang benar selalu berbentuk kalimat anjuran: "Hendaknya kita...", "Kita harus...", "Sebaiknya kita...".',
      },
      {
        title: '2. Makna Kiasan Puisi dan Majas',
        paragraphs: [
          'Personifikasi: Menganggap benda mati berperilaku seperti manusia ("Angin berbisik merdu", "Nyiur melambai-lambai").',
          'Metafora: Perbandingan langsung tanpa kata pembanding ("Raja siang" = Matahari, "Kutu buku" = Gemar membaca).',
          'Hiperbola: Ungkapan berlebihan ("Keringatnya membanjiri lapangan").',
        ],
        example: {
          problem: 'Penggalan Puisi: "Kau terangi gelapnya malam / Menuntun langkah sang pengembara / Cahayamu lembut menyapa bumi." Benda langit yang dimaksud adalah ....',
          stepByStep: [
            'Kata kunci: "menerangi gelapnya malam", "cahaya lembut", "benda langit malam".',
            'Benda langit bercahaya lembut di malam hari adalah Bulan.',
          ],
          conclusion: 'Objek puisi tersebut adalah Bulan.',
        },
      },
    ],
    quickFormula: {
      title: 'RUMUS MENENTUKAN AMANAT',
      formulaText: 'Amanat = Pelajaran Moral Positif + Berhubungan dengan Konflik Utama Cerita',
      description: 'Hindari opsi yang hanya menceritakan latar atau tokoh pembantu.',
    },
    miniQuiz: [
      {
        id: 'bq3',
        question: 'Ungkapan "lapang dada" memiliki makna ....',
        options: [
          { key: 'A', text: 'Mudah marah' },
          { key: 'B', text: 'Ikhlas dan sabar menerima keadaan' },
          { key: 'C', text: 'Suka berolahraga dada' },
          { key: 'D', text: 'Merasa bangga berlebihan' },
        ],
        correctAnswer: 'B',
        explanation: 'Lapang dada adalah ungkapan yang bermakna ikhlas, sabar, dan berjiwa besar dalam menerima kenyataan.',
      },
      {
        id: 'bq4',
        question: '"Pena itu menari-nari di atas lembaran kertas putih." Majas yang digunakan pada kalimat tersebut adalah ....',
        options: [
          { key: 'A', text: 'Hiperbola' },
          { key: 'B', text: 'Personifikasi' },
          { key: 'C', text: 'Metafora' },
          { key: 'D', text: 'Asosiasi' },
        ],
        correctAnswer: 'B',
        explanation: 'Majas personifikasi mengumpamakan benda mati (pena) seolah-olah dapat menari layaknya makhluk hidup manusia.',
      },
    ],
  },
  {
    id: 'bindo-3',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 3,
    title: 'Kaidah EBI, Kalimat Efektif & Teks Prosedur Acak',
    subtitle: 'Kuasai aturan huruf kapital, tanda baca titik/koma, kata baku vs tidak baku, serta menyusun petunjuk acak.',
    durationMinutes: 18,
    iconName: 'BarChart3',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      gradient: 'from-emerald-600 to-teal-600',
    },
    summaryPoints: [
      'Huruf Kapital: Awal kalimat, nama orang, nama geografi/kota (Kota Tegal, Sungai Comal), hari/bulan/agama, gelar kehormatan yang diikuti nama.',
      'Tanda Koma (,): Memisahkan rincian lebih dari dua hal ("Ibu membeli apel, jeruk, dan mangga."), sebelum kata hubung pertentangan ("tetapi", "melainkan").',
      'Kata Baku Sering Muncul: Izin (bukan Ijin), Praktik (bukan Praktek), Zaman (bukan Jaman), Antre (bukan Antri), Nasihat (bukan Nasehat), Kaus (bukan Kaos).',
      'Teks Prosedur Acak: Cari kata awal persiapan/bahan (1) ➔ Langkah proses inti (2-3) ➔ Hasil siap digunakan/selesai (4).',
    ],
    contentSections: [
      {
        title: '1. Tips Menyusun Petunjuk Acak dalam 15 Detik',
        paragraphs: [
          'Langkah 1: Cari kalimat pembuka (kata: "siapkan", "ambil", "nyalakan", "masukkan").',
          'Langkah 2: Cari kalimat penutup (kata: "selesai", "siap disajikan", "dapat digunakan").',
          'Langkah 3: Cocokkan nomor awal dan nomor akhir pada opsi A, B, C, D untuk langsung mengeliminasi opsi yang salah.',
        ],
      },
    ],
    quickFormula: {
      title: 'TRIK ELIMINASI PETUNJUK ACAK',
      formulaText: 'Urutan Prosedur = [Kalimat Persiapan/Bahan] ➔ [Proses] ➔ [Hasil Akhir/Selesai]',
      description: 'Cukup cek angka pertama dan angka terakhir pada pilihan jawaban untuk eliminasi cepat.',
    },
    miniQuiz: [
      {
        id: 'bq5',
        question: 'Penulisan huruf kapital dan tanda baca yang BENAR adalah ....',
        options: [
          { key: 'A', text: 'Dr. Wahyu berkunjung ke kota tegal pada hari senin.' },
          { key: 'B', text: 'Dr. Wahyu berkunjung ke Kota Tegal pada hari Senin.' },
          { key: 'C', text: 'dr. wahyu berkunjung ke Kota tegal pada hari senin.' },
          { key: 'D', text: 'Dr. Wahyu berkunjung ke kota Tegal pada Hari Senin.' },
        ],
        correctAnswer: 'B',
        explanation: 'Nama gelar + orang (Dr. Wahyu), nama geografi (Kota Tegal), dan nama hari (Senin) wajib berhuruf kapital.',
      },
    ],
  },

  // =========================================================================
  // MATEMATIKA
  // =========================================================================
  {
    id: 'mtk-1',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 1,
    title: 'Operasi Bilangan Bulat, Pecahan & KPK-FPB Kilat',
    subtitle: 'Metode cepat aturan KuKaBaTaKu, trik kupu-kupu pecahan campuran, dan tabel sisir KPK-FPB.',
    durationMinutes: 22,
    iconName: 'Calculator',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      gradient: 'from-amber-600 to-orange-600',
    },
    summaryPoints: [
      'Hierarki Operasi (KuKaBaTaKu): 1. Kurung (), 2. Kali (×) dan Bagi (÷) sama kuat (kerjakan kiri ke kanan), 3. Tambah (+) dan Kurang (-) sama kuat.',
      'Bilangan Negatif: (-) × (-) = (+), (-) × (+) = (-). Pengurangan dengan negatif: a - (-b) = a + b.',
      'Penjumlahan/Pengurangan Pecahan: Samakan penyebut KPK atau gunakan trik kali silang kupu-kupu.',
      'Perkalian Pecahan: (a/b) × (c/d) = (a×c) / (b×d).',
      'Pembagian Pecahan (Keep-Change-Flip): (a/b) ÷ (c/d) = (a/b) × (d/c).',
      'KPK: Ambil semua faktor prima pangkat TERBESAR. FPB: Ambil faktor prima yang sama pangkat TERKECIL.',
    ],
    contentSections: [
      {
        title: '1. Trik Kupu-Kupu Penjumlahan & Pengurangan Pecahan',
        paragraphs: [
          'Rumus Kali Silang Cepat: a/b + c/d = (a×d + b×c) / (b×d).',
          'Contoh: 2/3 + 3/5 = (2×5 + 3×3) / (3×5) = (10 + 9) / 15 = 19/15 = 1 4/15.',
        ],
        formula: 'Trik Kali Silang Pecahan: a/b ± c/d = (a×d ± b×c) / (b×d)',
      },
      {
        title: '2. Metode Sisir / Tabel FPB dan KPK Serentak',
        paragraphs: [
          'Bagi bilangan dengan bilangan prima (2, 3, 5, 7, ...). Jika sebuah angka prima bisa membagi SEMUA bilangan, lingkari angka tersebut.',
          'FPB = Hasil perkalian semua bilangan prima yang DILINGKARI.',
          'KPK = Hasil perkalian SEMUA bilangan prima pembagi di sisi kiri hingga hasilnya bernilai 1.',
        ],
        example: {
          problem: 'Tentukan FPB dan KPK dari 24 dan 36!',
          stepByStep: [
            'Bagi 2: 24÷2 = 12, 36÷2 = 18 (Bisa keduanya -> Lingkari angka 2).',
            'Bagi 2: 12÷2 = 6, 18÷2 = 9 (Bisa keduanya -> Lingkari angka 2 kedua).',
            'Bagi 3: 6÷3 = 2, 9÷3 = 3 (Bisa keduanya -> Lingkari angka 3).',
            'Bagi 2: 2÷2 = 1, 3 tetap 3.',
            'Bagi 3: 1 tetap 1, 3÷3 = 1.',
            'FPB = 2 × 2 × 3 = 12.',
            'KPK = 2 × 2 × 3 × 2 × 3 = 72.',
          ],
          conclusion: 'FPB = 12 dan KPK = 72.',
        },
      },
    ],
    quickFormula: {
      title: 'RUMUS CEPAT OPERASI CAMPURAN',
      formulaText: 'KuKaBaTaKu ➔ Kurung > (Kali / Bagi) > (Tambah / Kurang)',
      description: 'Selalu kerjakan dari operasi terkuat paling kiri.',
    },
    miniQuiz: [
      {
        id: 'mq1',
        question: 'Hasil dari -15 + (-8) × 4 - (-20) adalah ....',
        options: [
          { key: 'A', text: '-27' },
          { key: 'B', text: '-72' },
          { key: 'C', text: '-25' },
          { key: 'D', text: '37' },
        ],
        correctAnswer: 'A',
        explanation: 'Kerjakan perkalian dulu: (-8) × 4 = -32. Lalu -15 + (-32) - (-20) = -47 + 20 = -27.',
      },
      {
        id: 'mq2',
        question: 'Lampu A menyala setiap 6 detik dan Lampu B menyala setiap 8 detik. Kedua lampu akan menyala bersamaan setiap .... detik.',
        options: [
          { key: 'A', text: '14' },
          { key: 'B', text: '24' },
          { key: 'C', text: '48' },
          { key: 'D', text: '2' },
        ],
        correctAnswer: 'B',
        explanation: 'Soal menyala bersamaan diselesaikan dengan KPK. KPK dari 6 dan 8 adalah 24 detik.',
      },
    ],
  },
  {
    id: 'mtk-2',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 2,
    title: 'Perbandingan, Skala, Kecepatan (J-K-W) & Debit (V-D-W)',
    subtitle: 'Rumus segitiga praktis untuk menghitung jarak sebenarnya, waktu berpapasan, debit aliran, dan diskon belanja.',
    durationMinutes: 25,
    iconName: 'Percent',
    color: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-800',
      badge: 'bg-violet-100 text-violet-900',
      gradient: 'from-violet-600 to-purple-600',
    },
    summaryPoints: [
      'Segitiga JOKOWI (Jarak - Kecepatan - Waktu): J = K × W | K = J ÷ W | W = J ÷ K.',
      'Segitiga DEBIT (Volume - Debit - Waktu): V = D × W | D = V ÷ W | W = V ÷ D.',
      'Konversi Satuan Waktu: 1 jam = 60 menit = 3.600 detik. 1 liter = 1 dm³ = 1.000 ml = 1.000 cm³.',
      'Skala Peta: Skala = JP / JS. Jarak Sebenarnya (JS) = JP / Skala. (Ingat ubah km ke cm: × 100.000).',
      'Perbandingan: Nilai Dicari = (Angka Rasio Dicari / Angka Rasio Diketahui) × Nilai Diketahui.',
    ],
    contentSections: [
      {
        title: '1. Rumus Segitiga J-K-W (Jokowi) & Waktu Berpapasan',
        paragraphs: [
          'J = Jarak (km atau m), K = Kecepatan (km/jam atau m/s), W = Waktu (jam atau detik).',
          'Rumus Berpapasan (Berangkat Bersama): Waktu Papasan = Jarak Total / (Kecepatan A + Kecepatan B).',
        ],
        example: {
          problem: 'Jarak kota A ke B adalah 180 km. Bus melaju dengan kecepatan rata-rata 60 km/jam. Jika bus berangkat pukul 07.30, pukul berapa bus tiba di kota B?',
          stepByStep: [
            'Langkah 1: Hitung waktu tempuh (W = J ÷ K).',
            'W = 180 km ÷ 60 km/jam = 3 jam.',
            'Langkah 2: Tambahkan waktu tempuh ke jam keberangkatan.',
            'Waktu Tiba = 07.30 + 3 jam = 10.30 WIB.',
          ],
          conclusion: 'Bus tiba di kota B tepat pukul 10.30 WIB.',
        },
      },
      {
        title: '2. Trik Cepat Skala Peta (Segitiga JP - S - JS)',
        paragraphs: [
          'JP = Jarak pada Peta (cm), S = Skala, JS = Jarak Sebenarnya (km -> ubah ke cm).',
          'Contoh: JP = 5 cm, Skala = 1 : 400.000. JS = 5 × 400.000 cm = 2.000.000 cm = 20 km.',
        ],
      },
    ],
    quickFormula: {
      title: 'SEGITIGA RUMUS CEPAT J-K-W & V-D-W',
      formulaText: 'J = K × W (Jarak = Kecepatan × Waktu) | V = D × W (Volume = Debit × Waktu)',
      description: 'Tutup huruf yang ingin dicari dengan jari untuk mengetahui rumusnya.',
    },
    miniQuiz: [
      {
        id: 'mq3',
        question: 'Sebuah kran mengalirkan air dengan debit 12 liter/menit. Untuk mengisi bak bervolume 360 liter hingga penuh, diperlukan waktu ....',
        options: [
          { key: 'A', text: '20 menit' },
          { key: 'B', text: '30 menit' },
          { key: 'C', text: '45 menit' },
          { key: 'D', text: '3 jam' },
        ],
        correctAnswer: 'B',
        explanation: 'Waktu = Volume ÷ Debit = 360 liter ÷ 12 liter/menit = 30 menit.',
      },
      {
        id: 'mq4',
        question: 'Jarak pada peta antara dua kota adalah 6 cm dengan skala 1 : 500.000. Jarak sebenarnya kedua kota tersebut adalah ....',
        options: [
          { key: 'A', text: '30 km' },
          { key: 'B', text: '300 km' },
          { key: 'C', text: '3 km' },
          { key: 'D', text: '3.000 km' },
        ],
        correctAnswer: 'A',
        explanation: 'JS = 6 cm × 500.000 = 3.000.000 cm = 30 km (karena 1 km = 100.000 cm).',
      },
    ],
  },
  {
    id: 'mtk-3',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 3,
    title: 'Geometri Bangun Datar, Bangun Ruang & Statistik (Mean-Median-Modus)',
    subtitle: 'Kumpulan lengkap rumus luas, keliling, volume kubus/balok/tabung/prisma, dan teknik hitung rata-rata.',
    durationMinutes: 25,
    iconName: 'Shapes',
    color: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      badge: 'bg-rose-100 text-rose-900',
      gradient: 'from-rose-600 to-pink-600',
    },
    summaryPoints: [
      'Keliling Lingkaran: K = 2 × π × r atau π × d. Luas Lingkaran: L = π × r² (Gunakan π = 22/7 jika r kelipatan 7).',
      'Luas Trapesium: L = 1/2 × (jumlah sisi sejajar a + b) × tinggi.',
      'Volume Kubus: V = s³ | Volume Balok: V = p × l × t | Volume Tabung: V = π × r² × t.',
      'Volume Prisma Segitiga: V = (1/2 × a × t_alas) × t_prisma.',
      'Volume Kerucut: V = 1/3 × π × r² × t.',
      'Mean (Rata-rata): Jumlah seluruh data ÷ Banyak data.',
      'Median: Nilai tengah setelah data diurutkan dari terkecil ke terbesar.',
      'Modus: Nilai atau data yang PALING SERING muncul (frekuensi tertinggi).',
    ],
    contentSections: [
      {
        title: '1. Tips Cepat Menghitung Mean, Median, dan Modus',
        paragraphs: [
          'Modus: Cari angka yang paling banyak frekuensinya.',
          'Median: Urutkan data! Jika jumlah data ganjil, ambil nilai tepat di tengah. Jika genap, jumlahkan dua angka di tengah lalu bagi 2.',
          'Mean: Jumlahkan semua (data × frekuensi) lalu bagi total jumlah siswa/frekuensi.',
        ],
        example: {
          problem: 'Nilai ulangan matematika 7 siswa adalah: 7, 8, 6, 8, 9, 7, 8. Tentukan Mean, Median, dan Modusnya!',
          stepByStep: [
            'Langkah 1 (Urutkan): 6, 7, 7, [8], 8, 8, 9.',
            'Langkah 2 (Modus): Angka 8 muncul paling sering (3 kali). Modus = 8.',
            'Langkah 3 (Median): Nilai ke-4 di tengah adalah 8. Median = 8.',
            'Langkah 4 (Mean): (6 + 7 + 7 + 8 + 8 + 8 + 9) ÷ 7 = 53 ÷ 7 = 7,57.',
          ],
          conclusion: 'Mean = 7,57; Median = 8; Modus = 8.',
        },
      },
    ],
    quickFormula: {
      title: 'FORMULA GEOMETRI & STATISTIK KUNCI',
      formulaText: 'Luas Lingkaran = π × r² | Tabung = π × r² × t | Mean = Total Nilai ÷ Total Frekuensi',
      description: 'Hafalkan rumus ini untuk menjawab soal geometri dan diagram data.',
    },
    miniQuiz: [
      {
        id: 'mq5',
        question: 'Sebuah tabung memiliki jari-jari alas 7 cm dan tinggi 20 cm. Volume tabung tersebut adalah .... (π = 22/7)',
        options: [
          { key: 'A', text: '1.540 cm³' },
          { key: 'B', text: '3.080 cm³' },
          { key: 'C', text: '440 cm³' },
          { key: 'D', text: '616 cm³' },
        ],
        correctAnswer: 'B',
        explanation: 'Volume = π × r² × t = 22/7 × 7 × 7 × 20 = 22 × 7 × 20 = 154 × 20 = 3.080 cm³.',
      },
    ],
  },

  // =========================================================================
  // IPAS (SAINS & SOSIAL TERPADU)
  // =========================================================================
  {
    id: 'ipas-1',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 1,
    title: 'Ekosistem, Simbiosis, Adaptasi & Rantai Makanan',
    subtitle: 'Pahami produsen-konsumen, rantai makanan sawah/laut/hutan, adaptasi morfologi/fisiologi, dan simbiosis.',
    durationMinutes: 20,
    iconName: 'Leaf',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-900',
      gradient: 'from-emerald-600 to-green-600',
    },
    summaryPoints: [
      'Tingkatan Trofik: Produsen (Tumbuhan Berfotosintesis) ➔ Konsumen I (Herbivora) ➔ Konsumen II (Karnivora Kecil) ➔ Konsumen III (Predator Puncak) ➔ Pengurai (Bakteri/Jamur).',
      'Simbiosis Mutualisme (Saling Untung): Kerbau & Burung Jalak, Lebah & Bunga, Ikan Badut & Anemon.',
      'Simbiosis Komensalisme (Satu Untung, Satu Netral): Ikan Remora & Ikan Hiu, Anggrek & Pohon Inang.',
      'Simbiosis Parasitisme (Satu Untung, Satu Rugi): Benalu & Pohon Inang, Nyamuk & Manusia, Cacing Pita di Usus.',
      'Adaptasi: Morfologi (Bentuk fisik: Paruh burung, daun teratai lebar, kaktus berduri), Fisiologi (Fungsi organ: Enzim selulase rayap, pupil mata kucing), Tingkah Laku (Perilaku: Cicak autotomi, bunglon mimikri, paus muncul ke permukaan).',
    ],
    contentSections: [
      {
        title: '1. Analisis Dampak Ketidakseimbangan Ekosistem',
        paragraphs: [
          'Rantai Makanan Sawah: Padi ➔ Belalang ➔ Katak ➔ Ular ➔ Elang.',
          'Jika pemburu membunuh semua Ular: Populasi katak akan bertambah pesat (karena tidak ada pemangsa), belalang akan berkurang drastis, sementara populasi elang akan menurun karena kekurangan makanan.',
        ],
        tips: 'Ingat aturan rantai: Jika hewan X musnah, hewan sebelum X populasinya naik pesat, sedangkan hewan setelah X populasinya turun.',
      },
    ],
    quickFormula: {
      title: 'HUKUM RANTAI MAKANAN',
      formulaText: 'Hewan X Hilang ➔ Mangsa X Melonjak | Pemangsa X Berkurang/Kelaparan',
      description: 'Gunakan prinsip ini untuk menjawab soal dinamika populasi ekosistem.',
    },
    miniQuiz: [
      {
        id: 'iq1',
        question: 'Hubungan antara tanaman anggrek yang menempel pada pohon mangga merupakan contoh simbiosis ....',
        options: [
          { key: 'A', text: 'Mutualisme' },
          { key: 'B', text: 'Parasitisme' },
          { key: 'C', text: 'Komensalisme' },
          { key: 'D', text: 'Amensalisme' },
        ],
        correctAnswer: 'C',
        explanation: 'Anggrek untung mendapatkan tempat hidup di tempat tinggi untuk sinar matahari, sedangkan pohon mangga tidak dirugikan dan tidak diuntungkan (Komensalisme).',
      },
    ],
  },
  {
    id: 'ipas-2',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 2,
    title: 'Sistem Organ Manusia: Pencernaan, Pernapasan & Peredaran Darah',
    subtitle: 'Enzim pencernaan makanan, alveolus paru-paru, peredaran darah besar/kecil, dan fungsi 4 ruang jantung.',
    durationMinutes: 25,
    iconName: 'HeartPulse',
    color: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-900',
      gradient: 'from-red-600 to-rose-600',
    },
    summaryPoints: [
      'Pencernaan Makanan: Mulut (Enzim Ptialin/Amilase: Karbohidrat ➔ Gula) ➔ Kerongkongan (Gerak Peristaltik) ➔ Lambung (Enzim Pepsin: Protein ➔ Pepton, Renin: Mengendapkan kasein susu, Asam HCl: Membunuh kuman) ➔ Usus Halus (Penyerapan sari makanan + enzim Tripsin, Amilase, Lipase) ➔ Usus Besar (Penyerapan air & pembusukan bakteri E. Coli) ➔ Anus.',
      'Sistem Pernapasan: Hidung (Penyaringan bulu & penyesuaian suhu) ➔ Tenggorokan (Trakea) ➔ Bronkus ➔ Bronkiolus ➔ Alveolus (Pertukaran gas O₂ dan CO₂).',
      'Jantung & Darah: Serambi Kanan (Menerima darah kotor dari tubuh) ➔ Bilik Kanan (Memompa darah kotor ke paru-paru) ➔ Serambi Kiri (Menerima darah bersih dari paru-paru) ➔ Bilik Kiri (Memompa darah bersih kaya O₂ ke SELURUH TUBUH).',
      'Peredaran Darah Besar: Bilik Kiri ➔ Seluruh Tubuh ➔ Serambi Kanan.',
      'Peredaran Darah Kecil: Bilik Kanan ➔ Paru-Paru ➔ Serambi Kiri.',
    ],
    contentSections: [
      {
        title: '1. Jembatan Keledai Enzim Lambung & Pankreas',
        paragraphs: [
          'Enzim di Lambung: "Pe-Re-A" (Pepsin, Renin, Asam klorida/HCl).',
          'Enzim di Usus Halus / Pankreas: "A-T-L" (Amilase, Tripsin, Lipase).',
          'Lipase mencerna lemak menjadi asam lemak & gliserol.',
        ],
        tips: 'Ingat: Bilik kiri jantung adalah ruang paling tebal dan berotot kuat karena bertugas memompa darah ke seluruh tubuh.',
      },
    ],
    quickFormula: {
      title: 'RUMUS RUTE PEREDARAN DARAH',
      formulaText: 'Darah Besar = Bilik Kiri ➔ Seluruh Tubuh ➔ Serambi Kanan | Darah Kecil = Bilik Kanan ➔ Paru-paru ➔ Serambi Kiri',
      description: 'Selalu diawali dari Bilik (memompa) dan berakhir di Serambi (menerima).',
    },
    miniQuiz: [
      {
        id: 'iq2',
        question: 'Enzim yang berfungsi mencerna protein menjadi pepton di dalam lambung adalah ....',
        options: [
          { key: 'A', text: 'Ptialin' },
          { key: 'B', text: 'Pepsin' },
          { key: 'C', text: 'Lipase' },
          { key: 'D', text: 'Amilase' },
        ],
        correctAnswer: 'B',
        explanation: 'Enzim pepsin diproduksi oleh lambung untuk mengubah protein menjadi pepton.',
      },
      {
        id: 'iq3',
        question: 'Ruang jantung yang bertugas memompa darah bersih kaya Oksigen (O₂) ke seluruh tubuh adalah ....',
        options: [
          { key: 'A', text: 'Serambi Kanan' },
          { key: 'B', text: 'Bilik Kanan' },
          { key: 'C', text: 'Serambi Kiri' },
          { key: 'D', text: 'Bilik Kiri' },
        ],
        correctAnswer: 'D',
        explanation: 'Bilik kiri memiliki dinding otot paling tebal untuk memompa darah bersih bertekanan tinggi ke seluruh organ tubuh.',
      },
    ],
  },
  {
    id: 'ipas-3',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 3,
    title: 'Fisika Dasar & Tata Surya: Gaya, Cahaya, Bunyi, Listrik & Gerakan Bumi',
    subtitle: 'Sifat cahaya, pembiasan, sifat magnet, rangkaian seri/paralel, gerhana, dan dampak rotasi/revolusi bumi.',
    durationMinutes: 22,
    iconName: 'Zap',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      gradient: 'from-amber-600 to-yellow-600',
    },
    summaryPoints: [
      'Sifat Cahaya: 1. Merambat lurus (lampu senter, bayangan), 2. Menembus benda bening (kaca akuarium), 3. Dapat dipantulkan (cermin), 4. Dapat dibiaskan/dibelokkan (pensil patah di air, kolam terlihat dangkal), 5. Dapat diuraikan/dispersi (pelangi).',
      'Sifat Bunyi: Merambat melalui zat padat, cair, dan gas (TIDAK bisa merambat di ruang hampa udara). Bunyi dapat diserap oleh karpet, busa, gabus untuk mencegah gaung.',
      'Rangkaian Listrik: Seri (Hemat kabel, jika 1 padam semua padam, nyala lampu redup) vs Paralel (Butuh banyak kabel, jika 1 padam yang lain tetap menyala, nyala lampu sama terang - dipakai di instalasi rumah).',
      'Rotasi Bumi (Berputar pada porosnya, 24 jam): Terjadinya siang dan malam, gerak semu harian matahari, perbedaan waktu (WIB, WITA, WIT).',
      'Revolusi Bumi (Mengelilingi matahari, 365¼ hari): Terjadinya pergantian musim, gerak semu tahunan matahari, perbedaan lamanya siang dan malam.',
      'Gerhana: Gerhana Bulan (Matahari - Bumi - Bulan sejajar), Gerhana Matahari (Matahari - Bulan - Bumi sejajar).',
    ],
    contentSections: [
      {
        title: '1. Trik Membedakan Gerhana Bulan vs Gerhana Matahari',
        paragraphs: [
          'Gerhana Bulan: Bumi berada di TENGAH (Matahari - Bumi - Bulan). Terjadi saat malam bulan purnama.',
          'Gerhana Matahari: Bulan berada di TENGAH (Matahari - Bulan - Bumi). Terjadi saat siang hari fase bulan baru.',
        ],
        formula: 'Gerhana Bulan = Bumi di Tengah (M-B-B) | Gerhana Matahari = Bulan di Tengah (M-B-B)',
      },
    ],
    quickFormula: {
      title: 'RUMUS RANGKAIAN LISTRIK & GERHANA',
      formulaText: 'Paralel = 1 Lampu Mati, Lainnya Tetap Menyala | Gerhana Bulan = Bumi di Tengah',
      description: 'Gunakan kata kunci posisi tengah untuk menentukan jenis gerhana.',
    },
    miniQuiz: [
      {
        id: 'iq4',
        question: 'Terjadinya pergantian siang dan malam serta perbedaan zona waktu merupakan akibat dari ....',
        options: [
          { key: 'A', text: 'Revolusi Bumi' },
          { key: 'B', text: 'Rotasi Bumi' },
          { key: 'C', text: 'Revolusi Bulan' },
          { key: 'D', text: 'Rotasi Bulan' },
        ],
        correctAnswer: 'B',
        explanation: 'Rotasi bumi adalah perputaran bumi pada porosnya selama 24 jam yang menyebabkan pergantian siang-malam dan perbedaan zona waktu.',
      },
      {
        id: 'iq5',
        question: 'Pada peristiwa Gerhana Matahari, posisi benda langit yang berada tepat di tengah adalah ....',
        options: [
          { key: 'A', text: 'Bumi' },
          { key: 'B', text: 'Bulan' },
          { key: 'C', text: 'Matahari' },
          { key: 'D', text: 'Bintang' },
        ],
        correctAnswer: 'B',
        explanation: 'Gerhana matahari terjadi saat Bulan berada di antara Matahari dan Bumi dalam satu garis lurus sehingga menutupi sinar matahari ke bumi.',
      },
    ],
  },
];
