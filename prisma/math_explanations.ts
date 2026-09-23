export interface MathExplanation {
  topic: string;
  explanation: string;
}

export const detailedMtkExplanations: Record<number, MathExplanation> = {
  1: {
    topic: 'Operasi Hitung Campuran Persen, Pecahan, dan Desimal',
    explanation: `✅ Kunci Jawaban: Opsi A (11/30)

📌 Diketahui:
• Persamaan: 120% - 3 + 2 × 0,75 + 2/3 = ....

❓ Ditanya:
• Hasil perhitungan operasi campuran tersebut dalam bentuk pecahan.

📐 Rumus & Aturan Urutan Hitung (KABATAKU):
1. Dahulukan operasi Perkalian (×) sebelum Penjumlahan (+) dan Pengurangan (-).
2. Ubah seluruh bilangan ke bentuk pecahan biasa dengan penyebut persekutuan (KPK).

🔢 Langkah Perhitungan Lengkap:
1. Ubah persen dan desimal ke pecahan biasa:
   • 120% = 120/100 = 6/5
   • 0,75 = 75/100 = 3/4
2. Selesaikan operasi perkalian terlebih dahulu:
   • 2 × 0,75 = 2 × 3/4 = 6/4 = 3/2
3. Tuliskan susunan operasi pecahan:
   • 6/5 - 3 + 3/2 + 2/3
4. Samakan penyebut dengan KPK dari 5, 1, 2, dan 3 (KPK = 30):
   • 6/5 = (6 × 6)/30 = 36/30
   • 3 = 3/1 = (3 × 30)/30 = 90/30
   • 3/2 = (3 × 15)/30 = 45/30
   • 2/3 = (2 × 10)/30 = 20/30
5. Lakukan operasi penjumlahan dan pengurangan pembilang:
   • (36 - 90 + 45 + 20) / 30
   • (-54 + 45 + 20) / 30 = (-9 + 20) / 30 = 11/30

🎯 Hasil Akhir:
• Hasil akhirnya adalah 11/30.`,
  },

  2: {
    topic: 'Aritmatika Sosial & Persentase Diskon',
    explanation: `✅ Kunci Jawaban: Opsi C (Rp27.000,00)

📌 Diketahui:
• Harga Buku Komik = Rp24.000,00
• Harga Buku Gambar = 1/2 kali harga Buku Komik
• Harga Buku Tulis = 0,75 kali harga Buku Komik
• Besaran Diskon Toko Buku Ceria = 10%

❓ Ditanya:
• Total harga Buku Gambar dan Buku Tulis setelah dikenakan diskon?

📐 Rumus:
• Harga Sebelum Diskon = Harga Buku Gambar + Harga Buku Tulis
• Potongan Diskon = 10% × Harga Sebelum Diskon
• Harga Bayar = Harga Sebelum Diskon - Potongan Diskon (atau 90% × Harga Sebelum Diskon)

🔢 Langkah Perhitungan Lengkap:
1. Hitung harga masing-masing buku:
   • Buku Gambar = 1/2 × Rp24.000,00 = Rp12.000,00
   • Buku Tulis = 0,75 × Rp24.000,00 = 3/4 × Rp24.000,00 = Rp18.000,00
2. Hitung total harga awal buku gambar + buku tulis:
   • Total Awal = Rp12.000,00 + Rp18.000,00 = Rp30.000,00
3. Hitung potongan diskon 10%:
   • Diskon = 10/100 × Rp30.000,00 = Rp3.000,00
4. Hitung harga setelah diskon:
   • Harga Bayar = Rp30.000,00 - Rp3.000,00 = Rp27.000,00

🎯 Hasil Akhir:
• Harga yang harus dibayar adalah Rp27.000,00.`,
  },

  3: {
    topic: 'Operasi Pembagian & Perkalian Pecahan Campuran',
    explanation: `✅ Kunci Jawaban: A. Benar | B. Benar | C. Salah

📌 Diketahui:
• Jumlah wadah = 7 wadah
• Isi setiap wadah = 6 1/4 liter = 25/4 liter
• Dituang ke = 50 botol besar dan 15 botol kecil
• Kapasitas 1 botol kecil = 1/2 dari botol besar (0,5x)

❓ Analisis Kebenaran Pernyataan:

🔢 Langkah Perhitungan Lengkap:
1. Menghitung Total Produksi Susu Kedelai:
   • Total Liter = 7 × 6 1/4 liter
   • Total Liter = 7 × 25/4 = 175/4 = 43 3/4 liter (43,75 liter).
   👉 Pernyataan A ("Pak Bondan memproduksi 43 3/4 liter"): BENAR.

2. Menghitung Kapasitas per Botol:
   • Misal volume botol besar = x liter, maka botol kecil = 0,5x liter.
   • Total kapasitas = (50 × x) + (15 × 0,5x) = 50x + 7,5x = 57,5x liter.
   • 57,5x = 43,75 liter
   • x = 43,75 ÷ 57,5 = 4375/5750 = 35/46 liter per botol besar.
   👉 Pernyataan B: BENAR.
   👉 Pernyataan C: SALAH.`,
  },

  4: {
    topic: 'Geometri Spasial & Sifat Sisi Dadu',
    explanation: `✅ Kunci Jawaban: Opsi B (3)

📌 Diketahui:
• Sisi atas dadu hasil lemparan Mae = 4 titik.
• Aturan dadu standar: Jumlah titik pada dua sisi yang saling berlawanan (berhadapan) selalu sama, yaitu berjumlah 7 titik (1 berhadapan dengan 6, 2 dengan 5, 3 dengan 4).

❓ Ditanya:
• Berapa banyak titik pada sisi bawah dadu?

📐 Rumus:
• Titik Sisi Bawah = 7 - Titik Sisi Atas

🔢 Langkah Perhitungan Lengkap:
1. Sisi atas menunjukkan angka 4.
2. Pasangan sisi berlawanan berjumlah 7:
   • Sisi Bawah = 7 - 4 = 3

🎯 Hasil Akhir:
• Banyak titik yang ada di sisi bawah adalah 3.`,
  },

  5: {
    topic: 'Hubungan Antar-Satuan Baku Berat (kg, hg, g)',
    explanation: `✅ Kunci Jawaban: Pernyataan 1 dan Pernyataan 3 (Opsi C)

📌 Diketahui:
• Beras = 3 kg
• Gula Pasir = 2 bungkus @ 5 hg
• Mi Instan = 5 bungkus @ 85 g

📐 Konversi Satuan Berat ke Gram:
• 1 kg = 1.000 gram
• 1 hg (ons) = 100 gram

🔢 Langkah Perhitungan Lengkap:
1. Hitung berat masing-masing bahan dalam gram:
   • Beras: 3 kg = 3 × 1.000 g = 3.000 g
   • Gula Pasir: 2 × 5 hg = 10 hg = 10 × 100 g = 1.000 g
   • Mi Instan: 5 × 85 g = 425 g
2. Total berat semua isi paket:
   • Total = 3.000 g + 1.000 g + 425 g = 4.425 gram.
   👉 Pernyataan 1 ("Total berat semua isi paket adalah 4.425 gram"): BENAR.
3. Evaluasi berat mi instan dalam kilogram:
   • 425 g = 0,425 kg (nilai ini kurang dari 0,5 kg).
   👉 Pernyataan 2 ("Berat mi instan lebih dari 0,5 kg"): SALAH.
4. Evaluasi satu kemasan gula vs seluruh mi instan:
   • 1 bungkus gula = 5 hg = 500 g.
   • Seluruh mi instan = 425 g.
   • Karena 500 g > 425 g, maka 1 bungkus gula lebih berat dari total mi instan.
   👉 Pernyataan 3: BENAR.

🎯 Kesimpulan:
• Pernyataan yang benar adalah Pernyataan 1 dan Pernyataan 3.`,
  },

  6: {
    topic: 'Pengolahan & Interpretasi Diagram Batang',
    explanation: `✅ Kunci Jawaban: A. Benar | B. Salah | C. Benar

📌 Diketahui (Data Pengunjung Perpustakaan):
• Hari Senin = 30 siswa
• Hari Selasa = 45 siswa
• Hari Rabu = 40 siswa
• Hari Kamis = 50 siswa
• Hari Jumat = 35 siswa

🔢 Analisis & Pembuktian Perhitungan:
1. Pernyataan A: "Pengunjung Senin hanya 3/4 dari pengunjung Rabu"
   • Pengunjung Senin / Pengunjung Rabu = 30 / 40 = 3/4.
   👉 Pernyataan A: BENAR.
2. Pernyataan B: "Selisih hari Selasa dan Kamis adalah 15 siswa"
   • Selisih = 50 - 45 = 5 siswa (bukan 15).
   👉 Pernyataan B: SALAH.
3. Pernyataan C: "Total pengunjung selama 5 hari adalah 200 siswa"
   • Total = 30 + 45 + 40 + 50 + 35 = 200 siswa.
   👉 Pernyataan C: BENAR.`,
  },

  7: {
    topic: 'Penyajian Data Piktogram (Diagram Gambar)',
    explanation: `✅ Kunci Jawaban: Benar, Benar, Salah

📌 Diketahui Skala Simbol Piktogram:
• 1 Simbol Buku Penuh = 10 buku
• 1 Simbol Buku Separuh = 5 buku

🔢 Langkah Perhitungan:
1. Rina membaca 1 simbol penuh = 1 × 10 = 10 buku.
   👉 Pernyataan A: BENAR.
2. Dika membaca 2 simbol penuh = 2 × 10 = 20 buku.
   👉 Pernyataan B: BENAR.
3. Siti membaca 1 simbol penuh + 1 separuh = 10 + 5 = 15 buku.
   👉 Pernyataan C: SALAH.`,
  },

  8: {
    topic: 'Penaksiran & Pengurangan Pecahan pada Luas Lahan',
    explanation: `✅ Kunci Jawaban: Opsi D (2,80 hektar)

📌 Diketahui:
• Luas Total Lahan Pak Bakri = 3,5 hektar
• Ditanami Cabai Merah = 1/5 bagian
• Sisanya ditanami Tomat dan Daun Bawang

❓ Ditanya:
• Berapa luas lahan yang ditanami Tomat dan Daun Bawang?

📐 Rumus:
• Luas Cabai = 1/5 × Luas Total
• Luas Tomat & Daun Bawang = Luas Total - Luas Cabai (atau (1 - 1/5) × Luas Total)

🔢 Langkah Perhitungan Lengkap:
1. Cara 1 (Menghitung Pengurangan Langsung):
   • Luas Cabai Merah = 1/5 × 3,5 ha = 0,70 ha
   • Luas Tomat & Daun Bawang = 3,50 ha - 0,70 ha = 2,80 hektar.
2. Cara 2 (Menggunakan Sisa Bagian Pecahan):
   • Bagian sisa = 1 - 1/5 = 4/5 bagian
   • Luas = 4/5 × 3,5 ha = (4 × 3,5) / 5 = 14 / 5 = 2,80 hektar.

🎯 Hasil Akhir:
• Luas lahan yang ditanami tomat dan daun bawang adalah 2,80 hektar.`,
  },

  9: {
    topic: 'Perbandingan Volume Bangun Ruang (Kubus ke Balok)',
    explanation: `✅ Kunci Jawaban: Opsi B (9 m³)

📌 Diketahui:
• Volume bak kubus mula-mula = 9 m³
• Rumus Volume Kubus: V1 = s × s × s = s³ = 9 m³
• Dimensi bak balok baru:
  - Panjang baru (p) = 2 × s
  - Lebar baru (l) = 1/2 × s
  - Tinggi baru (t) = s

❓ Ditanya:
• Volume bak balok yang baru?

📐 Rumus:
• V_balok = p × l × t

🔢 Langkah Perhitungan Lengkap:
1. Substitusikan variabel dimensi baru ke rumus volume balok:
   • V_balok = (2s) × (1/2 s) × (s)
2. Kalikan koefisien angkanya:
   • V_balok = (2 × 1/2) × (s × s × s)
   • V_balok = 1 × s³ = s³
3. Karena diketahui s³ = 9 m³, maka:
   • V_balok = 9 m³

🎯 Hasil Akhir:
• Volume bak balok baru tetap bernilai 9 m³.`,
  },

  10: {
    topic: 'Pengukuran Kecepatan, Jarak, dan Waktu Tempuh',
    explanation: `✅ Kunci Jawaban: Opsi B (08.00)

📌 Diketahui:
• Jarak (s) = 140 km
• Kecepatan rata-rata (v) = 80 km/jam
• Waktu berangkat = Pukul 06.00
• Waktu istirahat membeli oleh-oleh = 15 menit

❓ Ditanya:
• Pukul berapa Pak Bayu dan keluarga tiba di Semarang?

📐 Rumus:
• Waktu Tempuh Berkendara (t) = Jarak ÷ Kecepatan (t = s / v)
• Waktu Tiba = Waktu Berangkat + Waktu Berkendara + Waktu Istirahat

🔢 Langkah Perhitungan Lengkap:
1. Hitung waktu tempuh berkendara murni:
   • t = 140 km ÷ 80 km/jam
   • t = 140/80 jam = 7/4 jam = 1 3/4 jam
   • 1 3/4 jam = 1 jam + (3/4 × 60 menit) = 1 jam 45 menit.
2. Hitung total lama perjalanan (termasuk istirahat):
   • Total Waktu = 1 jam 45 menit + 15 menit = 2 jam 00 menit.
3. Hitung waktu tiba di tujuan:
   • Waktu Tiba = 06.00 + 02.00 = 08.00.

🎯 Hasil Akhir:
• Pak Bayu dan keluarga tiba di Semarang pukul 08.00.`,
  },

  11: {
    topic: 'Penghitungan Selisih Rentang Hari Kalender',
    explanation: `✅ Kunci Jawaban: Benar, Benar, Salah

📌 Diketahui:
• Tanggal saat ini = 30 April
• Tanggal ulang tahun Lala = 14 Juni

❓ Ditanya & Dianalisis:
• Banyak hari yang harus ditunggu Lala sampai hari ulang tahunnya.

🔢 Langkah Perhitungan Kalender:
1. Jumlah hari di bulan Mei = 31 hari penuh.
2. Hari di bulan Juni sampai tanggal 14 = 14 hari.
3. Sisa hari di bulan April setelah tgl 30 = 0 hari (karena April memiliki 30 hari).
4. Total hari menunggu:
   • Total = 31 hari (Mei) + 14 hari (Juni) = 45 hari lagi.
   👉 Pernyataan A ("Lala menunggu 45 hari lagi"): BENAR.
   👉 Pernyataan B: BENAR.
   👉 Pernyataan C: SALAH.`,
  },

  12: {
    topic: 'Operasi Pengurangan dan Pembagian Satuan Berat Baku',
    explanation: `✅ Kunci Jawaban: Opsi B (0,25 kg)

📌 Diketahui:
• Total berat buah belanjaan Ibu = 3 kg = 3,00 kg
• Berat 2 buah alpukat mentega = 1,25 kg
• Sisanya = 7 buah mangga kweni dengan berat yang sama

❓ Ditanya:
• Berapa berat satu buah mangga kweni?

📐 Rumus:
• Berat 7 Mangga = Total Berat Belanjaan - Berat Alpukat
• Berat 1 Mangga = Berat 7 Mangga ÷ 7

🔢 Langkah Perhitungan Lengkap:
1. Hitung berat seluruh 7 mangga kweni:
   • Berat 7 Mangga = 3,00 kg - 1,25 kg = 1,75 kg
2. Hitung berat rata-rata 1 buah mangga:
   • Berat 1 Mangga = 1,75 kg ÷ 7
   • 1,75 ÷ 7 = 0,25 kg (atau 250 gram).

🎯 Hasil Akhir:
• Berat satu buah mangga kweni adalah 0,25 kg.`,
  },

  13: {
    topic: 'Konversi Hubungan Satuan Baku Volume (hl ke Liter)',
    explanation: `✅ Kunci Jawaban: Benar, Salah, Benar

📌 Diketahui:
• Volume air dalam tangki = 0,8 hektoliter (hl)
• Kapasitas 1 bak penampungan = 20 liter

📐 Tangga Konversi Satuan Volume:
• 1 hektoliter (hl) = 10 dekaliter (dal) = 100 liter (l)

🔢 Langkah Perhitungan Lengkap:
1. Konversikan isi tangki ke satuan liter:
   • Volume Tangki = 0,8 × 100 liter = 80 liter.
   👉 Pernyataan A ("Air di dalam tangki adalah 80 liter"): BENAR.
2. Hitung banyak bak penampungan yang dibutuhkan:
   • Banyak Bak = 80 liter ÷ 20 liter/bak = 4 bak.
   👉 Pernyataan B: SALAH.
   👉 Pernyataan C: BENAR.`,
  },

  14: {
    topic: 'Volume Bangun Ruang Kubus Satuan',
    explanation: `✅ Kunci Jawaban: Pernyataan 1 dan Pernyataan 2 (Opsi C)

📌 Diketahui:
• Target kapasitas = 64 kubus satuan (Volume rusuk 1 cm = 1 cm³ × 64 = 64 cm³)

❓ Ditanya:
• Kotak mana sajakah yang memiliki volume tepat 64 cm³?

📐 Rumus Volume Balok / Kubus:
• Volume = Panjang × Lebar × Tinggi (V = p × l × t)

🔢 Langkah Perhitungan untuk Setiap Kotak:
1. Kotak 1 (8 cm × 2 cm × 4 cm):
   • V = 8 × 2 × 4 = 16 × 4 = 64 cm³ (MEMENUHI)
2. Kotak 2 (4 cm × 4 cm × 4 cm):
   • V = 4 × 4 × 4 = 16 × 4 = 64 cm³ (MEMENUHI)
3. Kotak 3 (4 cm × 3 cm × 5 cm):
   • V = 4 × 3 × 5 = 12 × 5 = 60 cm³ (TIDAK MEMENUHI, kurang 4 kubus)

🎯 Kesimpulan:
• Kotak yang harus dibawa Doni adalah Kotak 1 dan Kotak 2.`,
  },

  15: {
    topic: 'Hubungan Antar-Satuan Baku Panjang (m, dm, cm, mm)',
    explanation: `✅ Kunci Jawaban: Salah, Benar, Benar

📌 Konversi Tangga Satuan Panjang:
• 1 meter (m) = 10 desimeter (dm) = 100 sentimeter (cm) = 1.000 milimeter (mm)

🔢 Evaluasi Pernyataan:
1. Jarak Zebra 6 m = 6 × 1.000 mm = 6.000 mm.
   👉 Pernyataan A: SALAH / Sesuai Data Denah.
2. Pernyataan B: BENAR.
3. Pernyataan C: BENAR.`,
  },

  16: {
    topic: 'Operasi Pembagian Bilangan Cacah Bersisa',
    explanation: `✅ Kunci Jawaban: Opsi B (5 cm)

📌 Diketahui:
• Panjang total batang rotan Ayah = 320 cm
• Panjang 1 stik pewangi = 15 cm
• Ayah ingin membuat stik sebanyak mungkin

❓ Ditanya:
• Berapa panjang sisa batang rotan yang tidak terpakai?

📐 Rumus Pembagian Bersisa:
• Total Panjang = (Banyak Stik × Panjang per Stik) + Sisa

🔢 Langkah Perhitungan Lengkap:
1. Lakukan pembagian 320 dengan 15:
   • 320 ÷ 15 = 21 sisa 5
   • Bukti: 21 × 15 = 315 cm
2. Hitung panjang sisa batang rotan:
   • Sisa = 320 cm - 315 cm = 5 cm.

🎯 Hasil Akhir:
• Sisa batang rotan yang tidak terpakai adalah 5 cm.`,
  },

  17: {
    topic: 'KPK (Kelipatan Persekutuan Terkecil)',
    explanation: `✅ Kunci Jawaban: Opsi C (12 minggu)

📌 Diketahui Jadwal Olahraga:
• SD Cerdas = setiap 2 minggu sekali
• SD Pelita = setiap 3 minggu sekali
• SD Mentari = setiap 4 minggu sekali
• Hari ini olahraga bersamaan.

❓ Ditanya:
• Setiap berapa minggu ketiga sekolah akan bertemu olahraga bersama lagi?

📐 Rumus:
• Waktu bersama kembali dihitung menggunakan KPK (Kelipatan Persekutuan Terkecil) dari 2, 3, dan 4.

🔢 Langkah Perhitungan Lengkap:
1. Faktorisasi prima masing-masing bilangan:
   • 2 = 2¹
   • 3 = 3¹
   • 4 = 2²
2. Ambil faktor prima dengan pangkat terbesar:
   • KPK(2, 3, 4) = 2² × 3 = 4 × 3 = 12.

🎯 Hasil Akhir:
• Ketiga sekolah akan bertemu kembali setiap 12 minggu.`,
  },

  18: {
    topic: 'Operasi Aljabar & Pengurangan Pecahan Campuran',
    explanation: `✅ Kunci Jawaban: Opsi A (1)

📌 Diketahui:
• a = 5 - 7/2
• b = 3/4 - 1/2

❓ Ditanya:
• Nilai dari (a - 2b) = ....

🔢 Langkah Perhitungan Lengkap:
1. Hitung nilai a:
   • a = 5/1 - 7/2 = (10 - 7) / 2 = 3/2
2. Hitung nilai b:
   • b = 3/4 - 2/4 = 1/4
3. Hitung nilai 2b:
   • 2b = 2 × 1/4 = 2/4 = 1/2
4. Hitung nilai a - 2b:
   • a - 2b = 3/2 - 1/2 = (3 - 1) / 2 = 2/2 = 1.

🎯 Hasil Akhir:
• Nilai a - 2b adalah 1.`,
  },

  19: {
    topic: 'Representasi Pecahan Bagian dari Keseluruhan',
    explanation: `✅ Kunci Jawaban: Opsi B (1/4 Bagian)

📌 Diketahui:
• 1 loyang kue dipotong menjadi 8 bagian sama besar.
• Potongan kue warna cokelat = 2 bagian.

❓ Ditanya:
• Berapa bagian kue warna cokelat dari keseluruhan kue?

📐 Rumus:
• Bagian Pecahan = Banyak Bagian Cokelat ÷ Total Seluruh Potongan Kue

🔢 Langkah Perhitungan Lengkap:
1. Bentuk pecahan:
   • Pecahan = 2 / 8
2. Sederhanakan pembilang dan penyebut (dibagi 2):
   • 2/8 = (2 ÷ 2) / (8 ÷ 2) = 1/4 bagian.

🎯 Hasil Akhir:
• Bagian kue yang berwarna cokelat adalah 1/4 bagian.`,
  },

  20: {
    topic: 'Keliling Bangun Datar Gabungan / Poligon',
    explanation: `✅ Kunci Jawaban: Opsi B (68 m)

📌 Diketahui Ukuran Sisi-Sisi Tanah Pak Boni:
• Panjang sisi atas = 20 m
• Panjang sisi samping kanan = 14 m
• Panjang sisi bawah = 20 m
• Panjang sisi samping kiri = 14 m

❓ Ditanya:
• Berapakah keliling sebidang tanah Pak Boni?

📐 Rumus:
• Keliling = Jumlah seluruh panjang sisi batas terluar bangun (K = s1 + s2 + s3 + s4)

🔢 Langkah Perhitungan Lengkap:
1. Jumlahkan seluruh sisi terluar:
   • Keliling = 20 m + 14 m + 20 m + 14 m
   • Keliling = 34 m + 34 m = 68 meter.

🎯 Hasil Akhir:
• Keliling bidang tanah Pak Boni adalah 68 m.`,
  },

  21: {
    topic: 'Operasi Perkalian dan Pembagian Bilangan Cacah',
    explanation: `✅ Kunci Jawaban: Opsi C (12 dus)

📌 Diketahui:
• Siswa Kelas A = 28 siswa
• Siswa Kelas B = 36 siswa
• Siswa Kelas C = 32 siswa
• Setiap siswa menerima = 3 buku
• Isi 1 dus kemasan = 24 buku

❓ Ditanya:
• Berapa dus buku yang dibutuhkan untuk seluruh siswa kelas 6?

📐 Rumus:
• Total Siswa = Kelas A + Kelas B + Kelas C
• Total Buku Dibutuhkan = Total Siswa × 3 buku
• Banyak Dus = Total Buku Dibutuhkan ÷ 24 buku/dus

🔢 Langkah Perhitungan Lengkap:
1. Hitung total seluruh siswa:
   • Total Siswa = 28 + 36 + 32 = 96 siswa
2. Hitung total buku yang harus disiapkan:
   • Total Buku = 96 × 3 = 288 buku
3. Hitung jumlah dus yang harus dibeli:
   • Banyak Dus = 288 ÷ 24 = 12 dus.

🎯 Hasil Akhir:
• Buku yang dibutuhkan adalah sebanyak 12 dus.`,
  },

  22: {
    topic: 'Pecahan Senilai dan Persentase Jarak',
    explanation: `✅ Kunci Jawaban: Opsi B (Beni)

📌 Diketahui Jarak Tempuh Pelari (Target Total = 10 km):
• Andi = 0,4 bagian dari 10 km = 4 km (40%)
• Beni = 60% dari total jarak = 6 km
• Citra = 1/3 bagian dari 10 km = 3,33 km
• Dika = 5,5 km dari 10 km = 55%

❓ Ditanya:
• Siapakah yang telah menempuh jarak lari sebesar 3/5 dari total jarak?

📐 Rumus Konversi Pecahan ke Nilai Nyata:
• Jarak 3/5 bagian = 3/5 × 10 km = 30/5 = 6 km
• Dalam persentase: 3/5 × 100% = 60%

🔢 Analisis Data:
1. Beni menempuh tepat 60% dari total jarak.
2. 60% senilai dengan 60/100 = 3/5 bagian = 6 km.

🎯 Kesimpulan:
• Anak yang menempuh 3/5 dari total jarak adalah Beni.`,
  },

  23: {
    topic: 'Karakteristik & Sifat-Sifat Bangun Datar Segi Empat',
    explanation: `✅ Kunci Jawaban: Opsi C (Belah Ketupat)

📌 Karakteristik Bangun pada Soal:
1. Keempat sisinya sama panjang (s1 = s2 = s3 = s4).
2. Memiliki dua pasang sisi yang sejajar.
3. Kedua diagonalnya saling berpotongan tegak lurus (90°) dan membagi dua sama panjang.
4. Sudut-sudut yang berhadapan sama besar (bukan berupa 4 sudut siku-siku).

🔢 Analisis Pilihan Bangun Datar:
• Persegi: Memiliki 4 sudut siku-siku (90°).
• Persegi Panjang: Memiliki sisi yang tidak sama panjang.
• Layang-layang: Hanya 2 pasang sisi yang sama panjang (bukan keempatnya).
• Belah Ketupat: Keempat sisinya sama panjang, diagonal berpotongan tegak lurus, sudut hadap sama besar.

🎯 Kesimpulan:
• Bangun datar yang dimaksud adalah Belah Ketupat.`,
  },

  24: {
    topic: 'Operasi Penjumlahan Jam dan Menit (Waktu)',
    explanation: `✅ Kunci Jawaban: Opsi C (10.05)

📌 Diketahui:
• Waktu berangkat = Pukul 07.25
• Durasi perjalanan ke sanggar = 45 menit
• Durasi belajar menari = 1 jam 35 menit
• Durasi istirahat = 20 menit

❓ Ditanya:
• Pukul berapa Rani meninggalkan sanggar untuk pulang?

🔢 Langkah Perhitungan Lengkap:
1. Hitung total durasi waktu kegiatan Rani:
   • Total Menit = 45 menit (perjalanan) + 95 menit (1 jam 35 mnt) + 20 menit (istirahat)
   • Total Menit = 160 menit
2. Konversi 160 menit ke dalam jam dan menit:
   • 160 menit = (120 menit + 40 menit) = 2 jam 40 menit.
3. Jumlahkan waktu berangkat dengan total durasi:
   • Waktu Pulang = Pukul 07.25 + 02 jam 40 menit
   • Menit: 25 + 40 = 65 menit (1 jam 05 menit)
   • Jam: 07 + 02 + 01 = 10.05.

🎯 Hasil Akhir:
• Rani meninggalkan sanggar pada pukul 10.05.`,
  },

  25: {
    topic: 'Pengukuran Satuan Panjang Baku & Kapasitas Lahan Parkir',
    explanation: `✅ Kunci Jawaban: Opsi B (10 mobil)

📌 Diketahui Desain Lahan Parkir:
• Total kapasitas parkir mobil = 11 kendaraan
• Terdapat 1 mobil yang baru saja keluar dari parkiran.

❓ Ditanya:
• Berapa banyak mobil lagi yang dapat diparkir di area tersebut sekarang?

🔢 Langkah Perhitungan:
1. Kapasitas maksimum area parkir = 11 slot mobil.
2. Ketika 1 mobil keluar dari area parkir, kapasitas ruang yang kosong bertambah 1 slot, sehingga ruang yang masih tersedia untuk dapat menampung mobil adalah 10 mobil.

🎯 Hasil Akhir:
• Kapasitas mobil yang dapat diparkir sekarang adalah 10 mobil.`,
  },

  26: {
    topic: 'Luas Persegi Panjang & Kapasitas Parkir Motor',
    explanation: `✅ Kunci Jawaban: Benar, Salah, Salah

📌 Diketahui:
• Kebutuhan lahan per 1 motor = 2 m²
• Pukul 13.00: 12 motor masuk dan parkir rapi
• Lahan parkir masih dapat menampung 1 motor lagi.

🔢 Analisis & Pembuktian:
1. Total kapasitas daya tampung parkiran = 12 + 1 = 13 motor.
2. Total luas area parkir motor = 13 motor × 2 m²/motor = 26 m².
3. Evaluasi Pernyataan:
   • Pernyataan A: BENAR.
   • Pernyataan B: SALAH.
   • Pernyataan C: SALAH.`,
  },

  27: {
    topic: 'Konversi Pecahan Biasa ke Persentase (%)',
    explanation: `✅ Kunci Jawaban: Opsi D (75%)

📌 Diketahui:
• Bagian buku merah yang sudah dibaca Caca = 3/4 bagian dari total halaman buku.

❓ Ditanya:
• Berapa persen (%) buku yang sudah selesai dibaca oleh Caca?

📐 Rumus Konversi ke Persen:
• Persentase = Pecahan × 100%

🔢 Langkah Perhitungan Lengkap:
1. Masukkan nilai pecahan 3/4 ke rumus:
   • Persentase = 3/4 × 100%
2. Lakukan perkalian dan pembagian:
   • Persentase = (3 × 100) / 4 % = 300 / 4 % = 75%.

🎯 Hasil Akhir:
• Persentase buku yang sudah dibaca oleh Caca adalah 75%.`,
  },

  28: {
    topic: 'Perkalian Pecahan dengan Bilangan Bulat (Halaman Buku)',
    explanation: `✅ Kunci Jawaban: Benar, Benar, Salah

📌 Diketahui:
• Total halaman Buku Biru Danu = 292 halaman
• Danu membaca 3/4 bagian dari buku tersebut pada minggu pertama.

❓ Ditanya & Dianalisis:
• Banyak halaman yang telah dibaca Danu.

🔢 Langkah Perhitungan Lengkap:
1. Hitung halaman yang dibaca Danu:
   • Halaman Terbaca = 3/4 × 292 halaman
   • Halaman Terbaca = 3 × (292 ÷ 4) = 3 × 73 = 219 halaman.
   👉 Pernyataan A ("Danu sudah membaca 219 halaman"): BENAR.
   👉 Pernyataan B: BENAR.
   👉 Pernyataan C: SALAH.`,
  },

  29: {
    topic: 'Analisis Data Nutrisi & Perhitungan Nilai Gizi Harian',
    explanation: `✅ Kunci Jawaban: Pernyataan 1 dan Pernyataan 3 (Daging Sapi & Ikan)

📌 Diketahui Tabel Kandungan Protein per 100 gram:
• Kebutuhan protein harian anak 10-12 tahun = minimal 55 gram
• Berat porsi makanan yang disediakan = 250 gram (2,5 kali dari takaran 100 gram)

Kandungan protein per 100 g:
• Daging Sapi = 26 gram protein / 100 g
• Telur Ayam = 13 gram protein / 100 g
• Ikan = 24 gram protein / 100 g

🔢 Langkah Perhitungan Kandungan Protein dalam 250 gram Porsi:
1. Daging Sapi (250 g):
   • Protein = 2,5 × 26 g = 65 gram (≥ 55 g, MEMENUHI KEBUTUHAN)
2. Telur Ayam (250 g):
   • Protein = 2,5 × 13 g = 32,5 gram (< 55 g, TIDAK MEMENUHI)
3. Ikan (250 g):
   • Protein = 2,5 × 24 g = 60 gram (≥ 55 g, MEMENUHI KEBUTUHAN)

🎯 Kesimpulan:
• Makanan yang dapat memenuhi kebutuhan protein minimal 55 gram adalah Daging Sapi (Pernyataan 1) dan Ikan (Pernyataan 3).`,
  },

  30: {
    topic: 'Analisis Kecukupan Gizi Makronutrien Ibu Hamil',
    explanation: `✅ Kunci Jawaban: Salah, Benar, Benar

📌 Diketahui:
• Standar Kemenkes RI: Kebutuhan protein harian ibu hamil = 70 s.d. 100 gram
• Asupan saat ini tercatat: Protein = 48 gram (kurang 22 gram dari batas minimal 70 g)

🔢 Analisis & Pembuktian Tambahan Konsumsi Makanan:
1. Tambahan 50 gram ikan:
   • Protein ikan 50 g = 0,5 × 24 g = 12 gram
   • Total Protein baru = 48 g + 12 g = 60 gram (Masih kurang dari 70 g).
   👉 Pernyataan A: SALAH.
2. Pernyataan B: BENAR.
3. Pernyataan C: BENAR.`,
  },
};
