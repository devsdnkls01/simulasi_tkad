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
  // ==========================================
  // BAHASA INDONESIA
  // ==========================================
  {
    id: 'bindo-1',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 1,
    title: 'Menemukan Ide Pokok & Informasi Tersirat Teks',
    subtitle: 'Kunci memahami paragraf, ide utama, dan kesimpulan wacana bacaan.',
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
      'Ide pokok adalah gagasan inti yang menjadi dasar pengembangan sebuah paragraf.',
      'Paragraf Deduktif: Ide pokok terletak di awal paragraf (kalimat utama di awal).',
      'Paragraf Induktif: Ide pokok terletak di akhir paragraf (berupa simpulan/penegasan).',
      'Informasi Tersirat: Informasi yang tidak tertulis langsung tetapi dapat disimpulkan dari konteks situasi cerita.',
    ],
    contentSections: [
      {
        title: '1. Perbedaan Kalimat Utama dan Kalimat Penjelas',
        paragraphs: [
          'Dalam setiap paragraf, hanya terdapat SATU kalimat utama yang memuat ide pokok. Kalimat-kalimat lainnya disebut kalimat penjelas yang bertugas memperinci, memberi contoh, atau menjelaskan kalimat utama.',
          'Cara termudah mencari ide pokok: Baca kalimat pertama dan kalimat terakhir. Tanyakan pada dirimu: "Apa hal umum yang sedang dibahas di seluruh paragraf ini?"',
        ],
        tips: 'Ingat rumus D-I: Deduktif di Depan, Induktif di Belakang.',
      },
      {
        title: '2. Cara Menemukan Informasi Tersurat vs Tersirat',
        paragraphs: [
          'Informasi Tersurat: Jawabannya tertulis persis kata per kata di dalam teks bacaan.',
          'Informasi Tersirat: Pembaca harus menghubungkan beberapa petunjuk peristiwa dalam teks. Misalnya, jika tokoh "menggigil dan memakai selimut tebal", tersirat bahwa cuaca sedang sangat dingin.',
        ],
        example: {
          problem: 'Teks: "Budi bergegas mengayuh sepedanya. Langit di atasnya mulai menghitam dan suara gemuruh terdengar bersahut-sahutan." Apa yang tersirat dari bacaan tersebut?',
          stepByStep: [
            'Langkah 1: Identifikasi kata kunci: "langit menghitam", "suara gemuruh", "bergegas mengayuh sepeda".',
            'Langkah 2: Hubungkan tanda alam tersebut dengan peristiwa sehari-hari.',
            'Langkah 3: Langit hitam + guntur menandakan akan segera turun hujan deras, sehingga Budi ingin cepat sampai sebelum kehujanan.',
          ],
          conclusion: 'Kesimpulan tersirat: Hari akan segera turun hujan lebat dan Budi ingin lekas sampai di rumah.',
        },
      },
    ],
    miniQuiz: [
      {
        id: 'bq1',
        question: 'Paragraf yang kalimat utamanya berada di awal kalimat dinamakan paragraf ....',
        options: [
          { key: 'A', text: 'Induktif' },
          { key: 'B', text: 'Deduktif' },
          { key: 'C', text: 'Campuran' },
          { key: 'D', text: 'Naratif' },
        ],
        correctAnswer: 'B',
        explanation: 'Paragraf deduktif adalah paragraf yang menempatkan gagasan utama/kalimat utama di awal paragraf (Depan).',
      },
      {
        id: 'bq2',
        question: 'Jika dalam teks tertulis "Matahari tepat di atas kepala dan bayangan pohon sangat pendek", hal ini menunjukkan waktu ....',
        options: [
          { key: 'A', text: 'Pagi hari' },
          { key: 'B', text: 'Siang hari tepat pukul 12.00' },
          { key: 'C', text: 'Sore menjelang petang' },
          { key: 'D', text: 'Malam hari' },
        ],
        correctAnswer: 'B',
        explanation: 'Matahari tepat di atas kepala dengan bayangan tegak/terpendek adalah ciri khas waktu tengah hari (siang).',
      },
    ],
  },
  {
    id: 'bindo-2',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 2,
    title: 'Memahami Puisi, Tokoh Fiksi & Amanat Cerita',
    subtitle: 'Teknik menganalisis watak tokoh, latar suasana, dan pesan moral dalam dongeng/cerpen.',
    durationMinutes: 20,
    iconName: 'Sparkles',
    color: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-700',
      badge: 'bg-cyan-100 text-cyan-800',
      gradient: 'from-cyan-600 to-blue-600',
    },
    summaryPoints: [
      'Tokoh Protagonis: Tokoh yang berwatak baik dan mendukung kebenaran.',
      'Tokoh Antagonis: Tokoh penentang yang berwatak kurang baik / pembuat konflik.',
      'Latar: Meliputi latar tempat (di mana), latar waktu (kapan), dan latar suasana (bagaimana perasaannya).',
      'Amanat: Pesan moral atau nasihat bijak yang ingin disampaikan pengarang kepada pembaca.',
    ],
    contentSections: [
      {
        title: '1. Unsur Intrinsik Cerita Fiksi',
        paragraphs: [
          'Saat membaca cerita TKA, perhatikan perilaku, ucapan, dan reaksi tokoh terhadap masalah. Watak tokoh sering digambarkan melalui tindakannya saat menghadapi kesulitan.',
          'Amanat cerita biasanya berupa ajakan berbuat kebajikan, seperti kejujuran, kerja keras, tolong-menolong, dan tidak mudah menyerah.',
        ],
        tips: 'Amanat selalu bernilai positif dan dapat diterapkan dalam kehidupan sehari-hari siswa.',
      },
      {
        title: '2. Membaca Puisi dan Menemukan Makna Kias (Majas)',
        paragraphs: [
          'Puisi menggunakan kata-kata indah yang memiliki makna kiasan (konotatif). Contoh: "Raja siang" bermakna Matahari, "Bunga bangsa" bermakna Pahlawan / Generasi Muda.',
        ],
        example: {
          problem: 'Bait Puisi: "Kau mengalir jernih membelah desa / Memberi dahaga bagi sawah warga / Tanpamu tanah merekah tandus." Objek yang dibicarakan adalah ....',
          stepByStep: [
            'Perhatikan kata kunci: "mengalir jernih", "dahaga sawah", "tanpa mu tandus".',
            'Benda cair alami yang mengalir dan mengairi sawah adalah Sungai atau Air.',
          ],
          conclusion: 'Objek puisi tersebut adalah Sungai / Sumber Air.',
        },
      },
    ],
    miniQuiz: [
      {
        id: 'bq3',
        question: 'Pesan kebaikan yang ingin disampaikan pengarang melalui cerita disebut ....',
        options: [
          { key: 'A', text: 'Tema' },
          { key: 'B', text: 'Alur' },
          { key: 'C', text: 'Amanat' },
          { key: 'D', text: 'Latar' },
        ],
        correctAnswer: 'C',
        explanation: 'Amanat adalah pesan moral atau nasihat yang terkandung di dalam sebuah karya cerita.',
      },
    ],
  },
  {
    id: 'bindo-3',
    subject: 'Bahasa Indonesia',
    subjectCode: 'bindo',
    chapterNumber: 3,
    title: 'Membaca Infografis, Tabel, Brosur & Petunjuk Kerja',
    subtitle: 'Strategi membaca data visual, diagram literasi, dan teks petunjuk penggunaan.',
    durationMinutes: 15,
    iconName: 'BarChart3',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-800',
      gradient: 'from-emerald-600 to-teal-600',
    },
    summaryPoints: [
      'Infografis menggabungkan teks ringkas dengan gambar, diagram, atau simbol untuk menyampaikan fakta cepat.',
      'Saat membaca tabel/grafik: Cermati judul tabel, nama kolom/baris, dan satuan data (misal: kg, persen, juta).',
      'Teks Petunjuk Penggunaan harus berurutan secara logis dan kronologis (langkah 1 -> langkah 2 -> langkah 3).',
    ],
    contentSections: [
      {
        title: '1. Tips Menyusun Teks Petunjuk Acak',
        paragraphs: [
          'Soal TKA sering meminta siswa mengurutkan petunjuk acak (misal cara mencuci tangan, membuat teh, atau menyalakan proyektor).',
          'Langkah awal: Cari kalimat persiapan/bahan (kata kerja pertama). Langkah akhir: Cari hasil akhir (kata: "siap disajikan", "selesai", "dapat digunakan").',
        ],
      },
    ],
    miniQuiz: [
      {
        id: 'bq4',
        question: 'Dalam membaca diagram atau infografis, langkah paling pertama yang harus dilakukan adalah ....',
        options: [
          { key: 'A', text: 'Langsung memilih jawaban terpanjang' },
          { key: 'B', text: 'Membaca judul dan keterangan label diagram' },
          { key: 'C', text: 'Menghitung total angka' },
          { key: 'D', text: 'Mengabaikan simbol gambar' },
        ],
        correctAnswer: 'B',
        explanation: 'Judul dan keterangan label adalah kunci utama untuk memahami topik dan konteks data yang disajikan.',
      },
    ],
  },

  // ==========================================
  // MATEMATIKA
  // ==========================================
  {
    id: 'mtk-1',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 1,
    title: 'Operasi Pecahan & Persen Tanpa Ribet',
    subtitle: 'Trik cepat penjumlahan, pengurangan, perkalian, dan pembagian pecahan campuran.',
    durationMinutes: 20,
    iconName: 'Calculator',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      gradient: 'from-amber-600 to-orange-600',
    },
    summaryPoints: [
      'Penjumlahan & Pengurangan: WAJIB menyamakan penyebut terlebih dahulu menggunakan KPK.',
      'Perkalian Pecahan: Langsung kalikan pembilang dengan pembilang, penyebut dengan penyebut (a/b × c/d = (a×c)/(b×d)).',
      'Pembagian Pecahan: Balikkan pecahan kedua menjadi perkalian (a/b ÷ c/d = a/b × d/c).',
      'Persen ke Pecahan Biasa: a% = a/100.',
    ],
    contentSections: [
      {
        title: '1. Cara Cepat Mengubah Pecahan Campuran ke Pecahan Biasa',
        paragraphs: [
          'Rumus: a b/c = (a × c + b) / c.',
          'Contoh: 3 1/4 = (3 × 4 + 1) / 4 = 13/4.',
        ],
        formula: 'Trik Pembagian Pecahan: a/b ÷ c/d = a/b × d/c (Keep, Change, Flip)',
      },
      {
        title: '2. Contoh Soal Cerita Pecahan',
        paragraphs: ['Ibu memiliki gula pasir seberat 2 1/2 kg. Ibu membeli lagi 1 3/4 kg. Jika 2 1/4 kg digunakan untuk membuat kue, berapa sisa gula pasir Ibu?'],
        example: {
          problem: 'Hitung: 2 1/2 + 1 3/4 - 2 1/4',
          stepByStep: [
            'Langkah 1: Pisahkan bilangan bulat dan pecahannya: (2 + 1 - 2) + (1/2 + 3/4 - 1/4).',
            'Langkah 2: Bilangan bulat: 2 + 1 - 2 = 1.',
            'Langkah 3: Samakan penyebut pecahan ke KPK (4): (2/4 + 3/4 - 1/4) = 4/4 = 1.',
            'Langkah 4: Jumlahkan: 1 + 1 = 2 kg.',
          ],
          conclusion: 'Sisa gula pasir Ibu adalah tepat 2 kg.',
        },
      },
    ],
    miniQuiz: [
      {
        id: 'mq1',
        question: 'Hasil dari 3/4 + 2/5 adalah ....',
        options: [
          { key: 'A', text: '5/9' },
          { key: 'B', text: '23/20 atau 1 3/20' },
          { key: 'C', text: '6/20' },
          { key: 'D', text: '1 1/4' },
        ],
        correctAnswer: 'B',
        explanation: 'KPK 4 dan 5 adalah 20. 3/4 = 15/20 dan 2/5 = 8/20. 15/20 + 8/20 = 23/20 = 1 3/20.',
      },
    ],
  },
  {
    id: 'mtk-2',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 2,
    title: 'Aritmatika Sosial, Diskon, Untung-Rugi & Rasio',
    subtitle: 'Menghitung harga beli, harga jual, persentase diskon belanja, dan perbandingan skala peta.',
    durationMinutes: 20,
    iconName: 'Percent',
    color: {
      bg: 'bg-violet-50',
      border: 'border-violet-200',
      text: 'text-violet-800',
      badge: 'bg-violet-100 text-violet-900',
      gradient: 'from-violet-600 to-purple-600',
    },
    summaryPoints: [
      'Untung = Harga Jual - Harga Beli (Harga Jual > Harga Beli).',
      'Rugi = Harga Beli - Harga Jual (Harga Beli > Harga Jual).',
      'Besar Diskon = Persen Diskon × Harga Awal.',
      'Harga Setelah Diskon = Harga Awal - Besar Diskon.',
      'Skala Peta = Jarak pada Peta (cm) ÷ Jarak Sebenarnya (cm).',
    ],
    contentSections: [
      {
        title: '1. Rumus Praktis Menghitung Diskon Belanja',
        paragraphs: [
          'Jika sebuah baju berharga Rp100.000 mendapat diskon 20%, maka pembeli cukup membayar 80% dari harga awal (100% - 20% = 80%).',
          'Harga Bayar = 80/100 × Rp100.000 = Rp80.000.',
        ],
      },
      {
        title: '2. Perbandingan / Rasio Nilai',
        paragraphs: [
          'Rumus Mencari Jumlah: (Jumlah Rasio Dicari / Jumlah Rasio Diketahui) × Nilai Diketahui.',
        ],
        example: {
          problem: 'Perbandingan kelereng Edo dan Doni adalah 3 : 5. Jika jumlah kelereng mereka berdua adalah 40 butir, berapa banyak kelereng Doni?',
          stepByStep: [
            'Rasio Doni = 5. Total rasio = 3 + 5 = 8.',
            'Kelereng Doni = (5 / 8) × 40 butir.',
            '40 ÷ 8 = 5 -> 5 × 5 = 25 butir.',
          ],
          conclusion: 'Banyak kelereng Doni adalah 25 butir.',
        },
      },
    ],
    miniQuiz: [
      {
        id: 'mq2',
        question: 'Sebuah tas seharga Rp200.000 diberi potongan harga (diskon) 15%. Berapakah uang yang harus dibayar?',
        options: [
          { key: 'A', text: 'Rp170.000' },
          { key: 'B', text: 'Rp185.000' },
          { key: 'C', text: 'Rp150.000' },
          { key: 'D', text: 'Rp30.000' },
        ],
        correctAnswer: 'A',
        explanation: 'Diskon = 15% × 200.000 = Rp30.000. Harga bayar = Rp200.000 - Rp30.000 = Rp170.000.',
      },
    ],
  },
  {
    id: 'mtk-3',
    subject: 'Matematika',
    subjectCode: 'mtk',
    chapterNumber: 3,
    title: 'Geometri: Keliling, Luas Datar & Volume Ruang',
    subtitle: 'Rangkuman lengkap rumus persegi, segitiga, lingkaran, kubus, balok, dan tabung.',
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
      'Persegi Panjang: Keliling = 2 × (p + l), Luas = p × l.',
      'Segitiga: Luas = 1/2 × alas × tinggi.',
      'Lingkaran: Keliling = 2 × π × r atau π × d. Luas = π × r² (π = 22/7 atau 3,14).',
      'Kubus: Volume = r × r × r = r³, Luas Permukaan = 6 × r².',
      'Balok: Volume = p × l × t, Luas Permukaan = 2 × (p×l + p×t + l×t).',
      'Tabung: Volume = π × r² × t.',
    ],
    contentSections: [
      {
        title: '1. Tips Memilih Nilai π (Pi) Pada Lingkaran',
        paragraphs: [
          'Gunakan π = 22/7 jika jari-jari (r) atau diameter (d) merupakan kelipatan 7 (misal 7, 14, 21, 28, 35, 42).',
          'Gunakan π = 3,14 jika jari-jari bukan kelipatan 7 (misal 10, 20, 5, 8).',
        ],
      },
    ],
    miniQuiz: [
      {
        id: 'mq3',
        question: 'Sebuah lingkaran memiliki jari-jari 14 cm. Luas lingkaran tersebut adalah .... (π = 22/7)',
        options: [
          { key: 'A', text: '88 cm²' },
          { key: 'B', text: '616 cm²' },
          { key: 'C', text: '154 cm²' },
          { key: 'D', text: '308 cm²' },
        ],
        correctAnswer: 'B',
        explanation: 'Luas = π × r² = 22/7 × 14 × 14 = 22 × 2 × 14 = 616 cm².',
      },
    ],
  },

  // ==========================================
  // IPAS
  // ==========================================
  {
    id: 'ipas-1',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 1,
    title: 'Ekosistem, Rantai Makanan & Keseimbangan Lingkungan',
    subtitle: 'Hubungan produsen, konsumen, pengurai, dan dampak perubahan rantai makanan.',
    durationMinutes: 15,
    iconName: 'Leaf',
    color: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-900',
      gradient: 'from-emerald-600 to-green-600',
    },
    summaryPoints: [
      'Produsen: Makhluk hidup yang membuat makanan sendiri melalui fotosintesis (Tumbuhan Hijau, Fitoplankton).',
      'Konsumen I (Herbivora): Pemakan tumbuhan langsung (Belalang, Sapi, Ulat).',
      'Konsumen II & III (Karnivora/Omnivora): Pemakan hewan lain (Katak, Ular, Burung Elang).',
      'Dekomposer / Pengurai: Mengurai jasad makhluk mati menjadi humus tanah (Bakteri, Jamur).',
      'Keseimbangan Ekosistem: Jika salah satu mata rantai punah, populasi hewan yang dimakannya akan melonjak, sedangkan pemangsanya akan kelaparan.',
    ],
    contentSections: [
      {
        title: '1. Simulasi Dampak Perubahan Ekosistem Sawah',
        paragraphs: [
          'Rantai: Padi -> Belalang -> Katak -> Ular -> Elang.',
          'Jika katak banyak diburu manusia: Populasi belalang meningkat pesat sehingga tanaman padi habis dirusak hama belalang. Sementara populasi ular akan berkurang karena kekurangan makanan.',
        ],
      },
    ],
    miniQuiz: [
      {
        id: 'iq1',
        question: 'Pada ekosistem kolam: Fitoplankton -> Ikan Kecil -> Ikan Gabus -> Burung Bangau. Yang berperan sebagai produsen adalah ....',
        options: [
          { key: 'A', text: 'Ikan Kecil' },
          { key: 'B', text: 'Fitoplankton' },
          { key: 'C', text: 'Ikan Gabus' },
          { key: 'D', text: 'Burung Bangau' },
        ],
        correctAnswer: 'B',
        explanation: 'Fitoplankton adalah tumbuhan mikroskopis air yang mampu berfotosintesis dan bertindak sebagai produsen utama di perairan.',
      },
    ],
  },
  {
    id: 'ipas-2',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 2,
    title: 'Organ Tubuh Manusia: Pernapasan, Pencernaan & Peredaran Darah',
    subtitle: 'Fungsi organ alveolus, lambung, usus halus, jantung, dan pembuluh darah.',
    durationMinutes: 20,
    iconName: 'HeartPulse',
    color: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-900',
      gradient: 'from-red-600 to-rose-600',
    },
    summaryPoints: [
      'Pernapasan: Udara masuk via Hidung -> Faring -> Trakea -> Bronkus -> Bronkiolus -> Alveolus (tempat pertukaran O2 dan CO2).',
      'Pencernaan: Mulut (enzim ptialin) -> Kerongkongan (gerak peristaltik) -> Lambung (enzim pepsin, renin, asam HCl) -> Usus Halus (penyerapan sari makanan) -> Usus Besar (penyerapan air & pembusukan) -> Anus.',
      'Jantung: 4 ruang (Serambi Kanan, Serambi Kiri, Bilik Kanan, Bilik Kiri). Bilik kiri memompa darah bersih beroksigen ke seluruh tubuh.',
    ],
    contentSections: [
      {
        title: '1. Peredaran Darah Besar vs Peredaran Darah Kecil',
        paragraphs: [
          'Peredaran Darah Besar: Jantung (Bilik Kiri) -> Seluruh Tubuh -> Jantung (Serambi Kanan).',
          'Peredaran Darah Kecil: Jantung (Bilik Kanan) -> Paru-Paru -> Jantung (Serambi Kiri).',
        ],
      },
    ],
    miniQuiz: [
      {
        id: 'iq2',
        question: 'Tempat terjadinya pertukaran gas Oksigen (O2) dan Karbondioksida (CO2) di dalam paru-paru adalah ....',
        options: [
          { key: 'A', text: 'Bronkus' },
          { key: 'B', text: 'Trakea' },
          { key: 'C', text: 'Alveolus' },
          { key: 'D', text: 'Faring' },
        ],
        correctAnswer: 'C',
        explanation: 'Alveolus berupa gelembung-gelembung halus pembuluh kapiler tempat pertukaran gas O2 dan CO2.',
      },
    ],
  },
  {
    id: 'ipas-3',
    subject: 'IPAS',
    subjectCode: 'ipas',
    chapterNumber: 3,
    title: 'Gaya, Energi, Perubahan Wujud & Kelistrikan',
    subtitle: 'Gaya magnet, gravitasi, sifat cahaya, konduktor-isolator, dan rangkaian listrik.',
    durationMinutes: 20,
    iconName: 'Zap',
    color: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      badge: 'bg-amber-100 text-amber-900',
      gradient: 'from-amber-600 to-yellow-600',
    },
    summaryPoints: [
      'Sifat Cahaya: Merambat lurus, menembus benda bening, dapat dipantulkan, dapat dibiaskan (pensil terlihat patah di air), dan dapat diuraikan (pelangi).',
      'Sifat Magnet: Kutub senama tolak-menolak, kutub tidak senama tarik-menarik. Gaya magnet terbesar ada di kedua ujung kutubnya.',
      'Rangkaian Seri vs Paralel: Rangkaian seri jika 1 lampu mati semua mati. Rangkaian paralel jika 1 lampu mati lampu lain tetap menyala.',
      'Perubahan Wujud: Mencair (padat->cair), Membeku (cair->padat), Menguap (cair->gas), Mengembun (gas->cair), Menyublim (padat->gas), Mengkristal (gas->padat).',
    ],
    contentSections: [
      {
        title: '1. Perubahan Energi Dalam Kehidupan Sehari-hari',
        paragraphs: [
          'Setrika / Oven Listrik: Energi Listrik -> Energi Panas (Kalor).',
          'Kipas Angin / Blender: Energi Listrik -> Energi Gerak (Kinetik).',
          'Panel Surya (Solar Cell): Energi Cahaya Matahari -> Energi Listrik.',
        ],
      },
    ],
    miniQuiz: [
      {
        id: 'iq3',
        question: 'Pensil yang dimasukkan ke dalam gelas berisi air bening tampak patah atau bengkok. Peristiwa ini membuktikan bahwa cahaya memiliki sifat ....',
        options: [
          { key: 'A', text: 'Dapat dipantulkan' },
          { key: 'B', text: 'Dapat dibiaskan (dibelokkan)' },
          { key: 'C', text: 'Merambat lurus' },
          { key: 'D', text: 'Menembus benda gelap' },
        ],
        correctAnswer: 'B',
        explanation: 'Pembiasan cahaya terjadi karena cahaya merambat melalui dua medium yang berbeda kerapatan optiknya (udara ke air).',
      },
    ],
  },
];
