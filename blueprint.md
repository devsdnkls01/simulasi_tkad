# MASTER PROMPT

## PLATFORM SIMULASI TKA/TKAD SEKOLAH DASAR

Saya ingin Anda membangun sebuah **platform simulasi TKA/TKAD khusus untuk satu sekolah**, yang digunakan oleh siswa dan guru/admin sekolah.

Aplikasi harus merupakan **web application yang benar-benar berfungsi end-to-end**, bukan sekadar desain frontend, landing page, mockup, atau prototype.

Prioritas utama aplikasi:

1. Keamanan data siswa.
2. Keamanan autentikasi.
3. Validasi server-side.
4. Ketepatan waktu ujian.
5. Autosave jawaban.
6. Ketahanan terhadap refresh/reconnect.
7. Pencegahan akses tidak sah.
8. Kemudahan penggunaan oleh siswa SD.
9. Kemudahan administrasi oleh guru.
10. Performa yang baik meskipun banyak siswa mengakses secara bersamaan.

---

# A. KONSEP SISTEM

Sistem memiliki dua jenis pengguna utama:

### 1. SISWA

Siswa hanya dapat:

* login;
* melihat data dirinya sendiri;
* memasukkan token;
* mengikuti ujian yang diizinkan;
* menjawab soal;
* melihat status pengerjaan;
* mengakhiri ujian;
* melihat hasil jika diizinkan admin.

Siswa TIDAK BOLEH:

* melihat siswa lain;
* melihat password;
* melihat jawaban benar;
* melihat data database;
* mengubah nilai;
* mengubah durasi;
* membuat token;
* mengakses dashboard admin;
* mengakses soal dari ujian yang tidak diikutinya.

### 2. ADMIN/GURU

Admin dapat:

* mengelola siswa;
* mengelola kelas;
* mengelola ujian;
* mengelola soal;
* mengelola token;
* mengaktifkan/nonaktifkan ujian;
* memantau peserta;
* melihat jawaban;
* melihat hasil;
* mengatur publikasi hasil;
* export data;
* melakukan reset sesi bila diperlukan.

---

# B. TEKNOLOGI

Jika project saat ini sudah memiliki stack, **jangan mengganti stack tanpa alasan**.

Pertama periksa project yang sudah ada.

Jika belum ditentukan, gunakan arsitektur yang sesuai untuk aplikasi modern, misalnya:

Frontend:

* Next.js / React
* TypeScript
* Responsive UI

Backend:

* Next.js Server/API atau backend yang sesuai

Database:

* PostgreSQL / Supabase

Authentication:

* sistem authentication yang aman;
* password di-hash;
* session/token menggunakan mekanisme aman.

Storage:

* penyimpanan foto siswa;
* gambar soal jika diperlukan.

Realtime:

* Supabase Realtime/WebSocket atau mekanisme realtime lain jika tersedia.

Deployment:

* platform hosting modern seperti Vercel atau server yang kompatibel.

Jangan expose secret key di browser.

---

# C. STRUKTUR ROLE

Gunakan role:

STUDENT

ADMIN

Jika diperlukan ke depan dapat ditambahkan:

SUPER_ADMIN

GURU

OPERATOR

Tetapi untuk versi awal cukup:

STUDENT
ADMIN

---

# D. FLOW SISWA

Flow lengkap:

```text
HALAMAN LOGIN
       ↓
Nomor Peserta
       +
Password
       ↓
VALIDASI SERVER
       ↓
DATA SISWA
       ↓
CEK STATUS UJIAN
       ↓
INPUT TOKEN 5 DIGIT
       ↓
VALIDASI TOKEN
       ↓
VALIDASI HAK AKSES
       ↓
HALAMAN INSTRUKSI
       ↓
KONFIRMASI
       ↓
MULAI UJIAN
       ↓
SESSION UJIAN DIBUAT
       ↓
TIMER 105 MENIT
       ↓
KERJAKAN SOAL
       ↓
AUTOSAVE
       ↓
SUBMIT / WAKTU HABIS
       ↓
FINALISASI SESSION
       ↓
HITUNG NILAI
       ↓
SIMPAN HASIL
       ↓
HALAMAN HASIL
```

---

# E. LOGIN SISWA

Buat halaman login:

```text
SIMULASI TKA/TKAD
[NAMA SEKOLAH]

Nomor Peserta
[________________]

Password
[________________]

[ LOGIN ]
```

Tambahkan opsi:

[ Lihat Password ]

untuk membantu siswa jika diperlukan.

Namun jangan pernah mengirim password dalam plaintext melalui URL.

---

# F. VALIDASI LOGIN

Ketika siswa login:

1. Cari peserta berdasarkan nomor peserta.
2. Pastikan peserta aktif.
3. Verifikasi password.
4. Buat session authentication.
5. Ambil data siswa.
6. Jangan mengirim field sensitif ke browser.

Jika gagal:

"Nomor peserta atau password tidak valid."

Jangan memberikan informasi apakah nomor peserta atau password yang salah.

Tambahkan rate limiting terhadap percobaan login jika memungkinkan.

---

# G. DATA PROFIL SISWA

Data siswa minimal:

```text
id
nomor_peserta
nama_lengkap
nis
nisn
kelas
rombel
foto_url
status
password_hash
created_at
updated_at
```

Status:

ACTIVE
INACTIVE

Jika INACTIVE:

"Peserta tidak dapat mengikuti ujian. Silakan hubungi administrator."

---

# H. DASHBOARD SISWA

Setelah login:

```text
Selamat Datang

MUHAMMAD FULAN
Nomor Peserta: 260001
Kelas: VI

Ujian Tersedia

SIMULASI TKA/TKAD
Status: BELUM DIMULAI

[ MULAI / MASUK UJIAN ]
```

Jika tidak ada ujian aktif:

"Tidak ada ujian yang tersedia saat ini."

---

# I. SISTEM UJIAN

Setiap ujian memiliki:

```text
id
kode_ujian
nama_ujian
deskripsi
mata_pelajaran
kelas
tanggal_mulai
tanggal_selesai
durasi_menit
jumlah_soal
status
randomize_questions
randomize_options
show_result
created_at
updated_at
```

Status:

DRAFT
SCHEDULED
ACTIVE
PAUSED
FINISHED
ARCHIVED

---

# J. TOKEN 5 DIGIT

Setiap ujian dapat memiliki token.

Token:

```text
58321
```

Persyaratan:

* tepat 5 digit;
* hanya angka;
* terkait dengan exam_id;
* mempunyai masa berlaku;
* status aktif/nonaktif;
* divalidasi server-side.

Struktur:

```text
exam_tokens
id
exam_id
token_hash
status
valid_from
valid_until
created_at
created_by
```

Sebaiknya token tidak disimpan secara plaintext jika desain keamanan memungkinkan.

Admin dapat:

GENERATE TOKEN

Sistem menghasilkan angka acak 5 digit.

Jangan menghasilkan token secara mudah ditebak berdasarkan urutan.

---

# K. VALIDASI TOKEN

Ketika siswa memasukkan token:

Server memeriksa:

1. Apakah siswa authenticated?
2. Apakah siswa aktif?
3. Apakah exam aktif?
4. Apakah token benar?
5. Apakah token masih berlaku?
6. Apakah siswa berhak mengikuti exam?
7. Apakah siswa sudah menyelesaikan exam?
8. Apakah siswa memiliki session aktif?

Jika semuanya valid:

TOKEN VALID

Lanjutkan ke instruksi ujian.

---

# L. INSTRUKSI UJIAN

Sebelum timer dimulai, tampilkan:

```text
PETUNJUK PELAKSANAAN

1. Bacalah setiap soal dengan teliti.
2. Pilih satu jawaban yang dianggap benar.
3. Jawaban akan tersimpan secara otomatis.
4. Jangan menutup halaman selama ujian berlangsung.
5. Waktu ujian adalah 105 menit.
6. Setelah waktu habis, ujian akan otomatis berakhir.
7. Pastikan koneksi internet stabil.

Nama:
MUHAMMAD FULAN

Nomor Peserta:
260001

Durasi:
105 MENIT

Jumlah Soal:
40

[ SAYA SIAP — MULAI UJIAN ]
```

Timer BARU DIMULAI setelah tombol tersebut dikonfirmasi.

---

# M. SESSION UJIAN

Buat tabel:

```text
exam_sessions
```

Kolom minimal:

```text
id
exam_id
student_id
token_id
started_at
expected_end_at
actual_end_at
last_activity_at
current_question
status
created_at
updated_at
```

Status:

NOT_STARTED
IN_PROGRESS
SUBMITTED
TIME_EXPIRED
CANCELLED

---

# N. TIMER SERVER-SIDE

Ini adalah salah satu bagian terpenting.

Jangan menjadikan JavaScript browser sebagai sumber kebenaran waktu.

Ketika siswa menekan:

MULAI UJIAN

server membuat:

```text
started_at = server_current_time
expected_end_at = started_at + 105 minutes
```

Contoh:

```text
started_at
08:15:00

expected_end_at
10:00:00
```

Browser hanya menampilkan countdown berdasarkan data server.

Jika browser:

* refresh;
* ditutup;
* dibuka kembali;
* berpindah halaman;
* perangkat mengalami perubahan waktu;

timer tetap mengikuti server.

---

# O. SERVER TIME

Jangan menggunakan waktu perangkat siswa sebagai sumber utama.

Jangan melakukan:

```javascript
new Date()
```

sebagai sumber otoritas ujian.

Gunakan timestamp server/database.

Semua validasi:

```text
current_server_time < expected_end_at
```

---

# P. BATAS WAKTU

Durasi default:

**105 menit**

Admin boleh mengatur durasi jika sistem dibuat configurable.

Contoh:

```text
durasi = 105
```

Timer:

```text
01:45:00
```

Kemudian:

```text
01:44:59
01:44:58
...
00:00:03
00:00:02
00:00:01
00:00:00
```

---

# Q. STATUS TIMER

Gunakan indikator visual:

Normal:
lebih dari 30 menit.

Warning:
10–30 menit.

Critical:
kurang dari 10 menit.

Ketika kurang dari 5 menit, tampilkan peringatan.

Contoh:

"PERHATIAN: Waktu ujian tersisa 04 menit 58 detik."

Jangan mengandalkan warna saja. Gunakan teks juga agar jelas.

---

# R. HALAMAN SOAL

Layout desktop:

```text
┌──────────────────────────────────────────────────┐
│ SIMULASI TKA/TKAD                01:34:22       │
├──────────────────────────────────────────────────┤
│ MUHAMMAD FULAN                                  │
│ Peserta: 260001                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│ SOAL 12                                          │
│                                                  │
│ Bacalah teks berikut dengan teliti...            │
│                                                  │
│ ○ A. ...                                         │
│ ○ B. ...                                         │
│ ○ C. ...                                         │
│ ○ D. ...                                         │
│                                                  │
├──────────────────────────────────────────────────┤
│ [SEBELUMNYA]                     [BERIKUTNYA]    │
└──────────────────────────────────────────────────┘
```

Untuk mobile, buat layout menjadi satu kolom.

---

# S. NAVIGASI SOAL

Tampilkan nomor:

```text
1  2  3  4  5
6  7  8  9  10
...
```

Status:

BELUM DIJAWAB
SUDAH DIJAWAB
SOAL AKTIF

Jangan hanya mengandalkan warna; gunakan ikon/status jika diperlukan.

---

# T. DATABASE QUESTIONS

Struktur:

```text
questions
id
exam_id
question_number
question_type
question_text
image_url
audio_url
option_a
option_b
option_c
option_d
correct_answer
score
order_index
created_at
updated_at
```

Untuk keamanan:

**correct_answer tidak boleh dikirim ke client selama ujian.**

Siswa hanya mendapatkan:

```text
question_text
option_a
option_b
option_c
option_d
```

---

# U. RANDOMISASI

Buat konfigurasi:

```text
randomize_questions
randomize_options
```

Jika aktif:

* soal dapat diacak;
* opsi dapat diacak.

Tetapi sistem harus menyimpan mapping urutan soal untuk setiap session agar refresh tidak mengubah urutan.

Contoh:

```text
exam_session_questions
session_id
question_id
display_order
```

Jadi urutan siswa tetap konsisten.

---

# V. PENYIMPANAN JAWABAN

Buat:

```text
answers
id
session_id
question_id
answer
is_final
answered_at
updated_at
```

Gunakan unique constraint:

```text
(session_id, question_id)
```

Agar satu soal tidak mempunyai duplikasi jawaban.

---

# W. AUTOSAVE

Setiap perubahan jawaban:

1. Update UI.
2. Kirim ke server.
3. Server validasi session.
4. Server memastikan session masih aktif.
5. Server memastikan waktu belum habis.
6. Simpan jawaban.
7. Return status berhasil.

Tampilkan indikator kecil:

"Jawaban tersimpan"

Jika gagal:

"Jawaban belum tersimpan — mencoba kembali..."

Jangan menghapus jawaban lokal sebelum server mengonfirmasi penyimpanan.

---

# X. OFFLINE / KONEKSI TERPUTUS

Jika internet terputus:

Tampilkan:

"Koneksi internet terputus."

Jawaban yang belum terkirim dapat disimpan sementara di browser menggunakan mekanisme yang sesuai.

Ketika koneksi kembali:

* sinkronkan jawaban;
* server tetap menjadi sumber kebenaran;
* jangan memperpanjang waktu ujian.

Jika waktu server sudah habis ketika koneksi kembali, session harus tetap dianggap selesai.

---

# Y. PREVENT DUPLICATE SUBMIT

Semua operasi submit harus idempotent.

Jika request terkirim dua kali:

server tidak boleh membuat dua hasil.

Gunakan:

```text
session_id
status
transaction
unique constraints
```

---

# Z. SUBMIT UJIAN

Ketika siswa memilih:

[ SELESAI UJIAN ]

tampilkan modal:

```text
Apakah Anda yakin ingin mengakhiri ujian?

Masih ada X soal yang belum dijawab.

[ KEMBALI ]
[ YA, SELESAIKAN ]
```

Jika dikonfirmasi:

Server:

1. validasi session;
2. validasi waktu;
3. simpan jawaban terakhir;
4. ubah status;
5. hitung hasil;
6. simpan hasil;
7. lock session.

---

# AA. AUTO SUBMIT

Jika:

```text
current_server_time >= expected_end_at
```

maka:

```text
status = TIME_EXPIRED
```

Kemudian:

* lock session;
* finalisasi jawaban;
* hitung hasil;
* simpan hasil.

Tidak boleh ada jawaban baru setelah session final.

---

# AB. SCORING

Untuk pilihan ganda:

```text
jumlah_benar
jumlah_salah
tidak_dijawab
```

Contoh:

40 soal.

Benar:
32

Salah:
6

Kosong:
2

Nilai default:

```text
32 / 40 × 100 = 80
```

Tetapi sistem harus dibuat configurable.

Jangan menghitung nilai berdasarkan data dari browser.

Server harus mengambil:

```text
jawaban siswa
+
correct_answer dari database
```

kemudian menghitung nilai.

---

# AC. RESULT

Tabel:

```text
results
id
session_id
student_id
exam_id
total_questions
correct_answers
wrong_answers
unanswered
score
started_at
finished_at
duration_used
created_at
```

---

# AD. HASIL SISWA

Admin memiliki setting:

```text
show_result_to_student
```

Jika false:

"Ujian telah selesai. Hasil akan diumumkan oleh sekolah."

Jika true:

tampilkan:

```text
HASIL SIMULASI

Nama:
MUHAMMAD FULAN

Nomor Peserta:
260001

Jumlah Soal:
40

Benar:
32

Salah:
6

Tidak Dijawab:
2

Nilai:
80
```

---

# AE. ADMIN LOGIN

URL:

```text
/admin/login
```

Jangan menggunakan login siswa untuk admin.

Admin authentication harus terpisah secara authorization.

Setelah login:

```text
/admin
```

---

# AF. ADMIN DASHBOARD

Dashboard:

```text
SIMULASI TKA/TKAD
ADMIN DASHBOARD

Total Peserta
120

Belum Mulai
22

Sedang Mengerjakan
73

Selesai
25
```

Tambahkan statistik:

* jumlah peserta per kelas;
* jumlah selesai;
* rata-rata nilai;
* jumlah belum mengerjakan;
* jumlah sedang mengerjakan.

---

# AG. MONITORING REALTIME

Tabel:

```text
NO
NOMOR PESERTA
NAMA
KELAS
STATUS
PROGRES
MULAI
SISA WAKTU
```

Contoh:

```text
260001 | Ahmad | VI | Mengerjakan | 28/40 | 01:02:12
260002 | Budi  | VI | Selesai     | 40/40 | -
```

Admin dapat melihat perubahan status secara realtime jika teknologi mendukung.

---

# AH. DETAIL PESERTA

Admin dapat membuka:

```text
Detail Peserta
```

Menampilkan:

* identitas;
* status;
* ujian;
* waktu mulai;
* waktu selesai;
* progres;
* nilai;
* daftar jawaban.

Namun akses ini hanya untuk admin.

---

# AI. RESET SESSION

Admin dapat memiliki tombol:

"Reset Sesi"

Tetapi wajib menggunakan konfirmasi:

```text
PERINGATAN

Reset sesi akan membuat peserta dapat memulai ulang sesuai aturan ujian.

Apakah Anda yakin?
```

Semua reset harus dicatat dalam audit log.

---

# AJ. MANAJEMEN PESERTA

Admin dapat:

Tambah:

```text
Nomor Peserta
Nama
NIS
NISN
Kelas
Rombel
Foto
Password
Status
```

Edit.

Nonaktifkan.

Reset password.

Import CSV/Excel.

Export data.

---

# AK. IMPORT SISWA

Jika dibuat:

Admin dapat upload:

```text
CSV / XLSX
```

Format:

```text
nomor_peserta
nama
nis
nisn
kelas
rombel
password
```

Validasi:

* nomor peserta tidak boleh duplikat;
* NISN tidak boleh duplikat jika diwajibkan;
* kelas harus valid;
* password diproses menjadi hash;
* tampilkan daftar error sebelum import final.

Gunakan transaksi agar import gagal secara aman jika terdapat masalah kritis.

---

# AL. MANAJEMEN SOAL

Admin dapat:

* tambah;
* edit;
* hapus;
* duplikasi;
* urutkan;
* import;
* preview.

Editor soal harus mendukung:

* teks;
* bold;
* italic;
* tabel sederhana jika diperlukan;
* gambar.

---

# AM. SOAL BERGAMBAR

Jika soal mempunyai gambar:

```text
image_url
```

Gambar disimpan di storage.

Jangan memasukkan gambar berukuran terlalu besar tanpa optimasi.

Gunakan compression/responsive image.

---

# AN. MANAJEMEN UJIAN

Admin dapat membuat:

```text
Nama Ujian
Kode Ujian
Mata Pelajaran
Kelas
Deskripsi
Tanggal Mulai
Tanggal Selesai
Durasi
Jumlah Soal
Randomisasi
Tampilkan Nilai
Status
```

---

# AO. PUBLISH / UNPUBLISH

Ujian memiliki status:

DRAFT

Belum dapat diakses siswa.

SCHEDULED

Menunggu waktu.

ACTIVE

Dapat digunakan.

PAUSED

Sementara dihentikan sesuai aturan.

FINISHED

Sudah selesai.

ARCHIVED

Diarsipkan.

---

# AP. TOKEN GENERATOR

Admin dapat menekan:

[ GENERATE TOKEN ]

Sistem menghasilkan:

```text
73914
```

Jangan menggunakan:

12345
11111
22222
00000

kecuali admin memang memasukkannya secara manual.

Token dapat dibuat random secara cryptographically secure.

---

# AQ. AUDIT LOG

Catat:

```text
LOGIN_SUCCESS
LOGIN_FAILED
TOKEN_SUCCESS
TOKEN_FAILED
EXAM_STARTED
ANSWER_SAVED
EXAM_SUBMITTED
EXAM_TIME_EXPIRED
ADMIN_LOGIN
STUDENT_CREATED
STUDENT_UPDATED
TOKEN_CREATED
TOKEN_UPDATED
QUESTION_CREATED
QUESTION_UPDATED
SESSION_RESET
RESULT_UPDATED
```

Jangan mencatat password.

---

# AR. SECURITY

Terapkan:

### Authentication

* secure session;
* password hashing;
* session expiration;
* logout.

### Authorization

* RBAC;
* student hanya data sendiri;
* admin data sesuai hak akses.

### Database

* foreign key;
* unique constraint;
* indexes;
* transaction.

### API

* validasi input;
* rate limit;
* authorization pada setiap endpoint;
* jangan percaya data dari client.

### Secret

Jangan expose:

```text
DATABASE_PASSWORD
SERVICE_ROLE_KEY
PRIVATE_KEY
JWT_SECRET
```

ke browser.

Gunakan environment variables.

---

# AS. SUPABASE RLS

Jika menggunakan Supabase, aktifkan Row Level Security.

Siswa hanya dapat mengakses:

* profil sendiri;
* session sendiri;
* jawaban sendiri;
* hasil sendiri.

Siswa tidak boleh melakukan query bebas terhadap:

```text
students
questions.correct_answer
results siswa lain
admin
exam_tokens
```

Admin memiliki policy yang sesuai.

Jangan memberikan service role key kepada frontend.

---

# AT. INDEX DATABASE

Tambahkan index pada field yang sering digunakan:

```text
students.nomor_peserta
students.nisn
students.kelas
exam_sessions.student_id
exam_sessions.exam_id
exam_sessions.status
answers.session_id
answers.question_id
questions.exam_id
results.student_id
results.exam_id
```

Tujuannya agar aplikasi tetap cepat ketika data siswa dan jawaban bertambah.

---

# AU. CONCURRENCY

Aplikasi harus dirancang untuk kondisi:

100 siswa login bersamaan.

Kemudian:

100 siswa memulai ujian hampir bersamaan.

Kemudian:

100 siswa menyimpan jawaban secara berkala.

Jangan membuat satu request yang tidak perlu untuk setiap detik timer.

Timer browser tidak boleh melakukan request ke server setiap detik.

Gunakan timestamp server dan sinkronisasi secara efisien.

---

# AV. PERFORMANCE

Optimalkan:

* database query;
* pagination;
* caching yang aman;
* image optimization;
* lazy loading;
* API response;
* bundle size.

Jangan mengambil seluruh tabel siswa ketika hanya membutuhkan satu siswa.

Jangan mengambil seluruh soal ketika tidak diperlukan.

Untuk daftar admin gunakan pagination.

---

# AW. ERROR HANDLING

Semua error harus ditangani.

Contoh:

```text
404
Data tidak ditemukan.

401
Anda belum login.

403
Anda tidak memiliki akses.

409
Session sudah aktif / konflik data.

429
Terlalu banyak permintaan.

500
Terjadi kesalahan server.
```

Untuk siswa, jangan tampilkan stack trace atau informasi database.

---

# AX. NETWORK FAILURE

Jika request autosave gagal:

Jangan langsung menganggap ujian selesai.

Tampilkan status:

```text
MENUNGGU KONEKSI
```

Kemudian lakukan retry secara terkendali.

Hindari infinite request loop.

---

# AY. SECURITY TERHADAP MANIPULASI CLIENT

Jangan percaya:

```text
student_id
score
remaining_time
correct_answer
is_admin
```

yang dikirim browser.

Semua harus diverifikasi server.

Contoh buruk:

```text
POST /submit
{
  "score": 100
}
```

Server tidak boleh menerima nilai sebagai sumber kebenaran.

Server menghitung sendiri.

---

# AZ. DIRECT URL ACCESS

Jika siswa membuka:

```text
/exam/123
```

tanpa session yang sah:

redirect ke login.

Jika siswa mencoba mengganti:

```text
student_id=456
```

server harus menolak jika bukan miliknya.

Jangan hanya menyembunyikan data di frontend.

---

# BA. BROWSER REFRESH

Setelah refresh:

1. cek authentication;
2. cek active exam session;
3. ambil expected_end_at;
4. hitung waktu tersisa;
5. ambil jawaban;
6. ambil posisi soal;
7. lanjutkan.

Tidak boleh membuat session baru jika session lama masih aktif.

---

# BB. BROWSER CLOSE

Jika siswa menutup browser:

session tetap:

```text
IN_PROGRESS
```

Ketika login kembali:

lanjutkan session tersebut selama waktu belum habis.

---

# BC. MULTIPLE DEVICE

Jika siswa mencoba login di perangkat kedua:

Tentukan kebijakan.

Default:

Satu siswa hanya boleh memiliki satu session ujian aktif.

Jika perangkat baru mengambil alih session, harus ada aturan yang eksplisit.

Jangan diam-diam membuat dua ujian berjalan.

---

# BD. RESULT FINALIZATION

Finalisasi harus dilakukan dalam transaksi.

Secara konsep:

```text
BEGIN TRANSACTION

lock session

cek status

cek waktu

ambil seluruh jawaban

hitung benar

hitung salah

hitung kosong

hitung nilai

insert/update result

update session = SUBMITTED/TIME_EXPIRED

COMMIT
```

Tujuannya mencegah race condition.

---

# BE. EXPORT

Admin dapat export:

CSV

Excel

Jika memungkinkan:

PDF

Data:

```text
Nomor Peserta
Nama
Kelas
Jumlah Soal
Benar
Salah
Kosong
Nilai
Waktu Mulai
Waktu Selesai
Status
```

---

# BF. SEARCH

Admin dapat mencari:

* nama;
* nomor peserta;
* NIS;
* NISN.

---

# BG. FILTER

Filter:

* kelas;
* status;
* ujian;
* rentang nilai.

---

# BH. PAGINATION

Jangan menampilkan ribuan data sekaligus.

Gunakan:

10
25
50
100

data per halaman.

---

# BI. MOBILE

Karena kemungkinan besar siswa menggunakan smartphone:

Prioritaskan mobile.

Pastikan:

* tombol cukup besar;
* teks soal mudah dibaca;
* pilihan jawaban mudah disentuh;
* timer tetap terlihat;
* navigasi soal tidak mengganggu;
* tidak terjadi horizontal scrolling;
* gambar soal responsive.

---

# BJ. ACCESSIBILITY

Perhatikan:

* kontras;
* ukuran teks;
* focus state;
* keyboard navigation;
* label input;
* aria-label bila diperlukan.

Jangan menjadikan warna sebagai satu-satunya indikator status.

---

# BK. UI STYLE

Desain:

PROFESIONAL
FORMAL
BERSIH
SEDERHANA
MODERN SECARA WAJAR

Jangan menggunakan desain terlalu ramai.

Gunakan komponen konsisten:

* Button
* Input
* Modal
* Card
* Table
* Badge
* Alert
* Toast
* Pagination
* Tabs

---

# BL. LANDING PAGE

Buat halaman awal sederhana:

```text
SIMULASI TKA/TKAD

[NAMA SEKOLAH]

Platform Simulasi Ujian Online

[ LOGIN SISWA ]

[ LOGIN ADMIN ]
```

Tidak perlu terlalu banyak informasi.

---

# BM. DATABASE RELATIONSHIP

Minimal:

```text
students
    │
    ├───────────────┐
    │               │
    ▼               ▼
exam_sessions     results
    │
    ▼
answers
    │
    ▼
questions
    │
    ▼
exams
    │
    ▼
exam_tokens
```

Buat foreign key yang sesuai.

---

# BN. DATA INTEGRITY

Gunakan:

* foreign key;
* unique constraints;
* not null;
* check constraints jika sesuai;
* transaction;
* indexes.

Contoh:

Nomor peserta harus unique.

Untuk jawaban:

```text
UNIQUE(session_id, question_id)
```

---

# BO. BACKUP

Jika menggunakan database cloud:

Pastikan strategi backup tersedia.

Jangan menghapus data hasil ujian hanya karena ujian selesai.

Ujian yang selesai dapat diarsipkan.

---

# BP. PRIVASI DATA

Data siswa merupakan data sensitif.

Jangan menampilkan:

* NISN;
* password;
* data pribadi;

kepada pengguna lain.

Gunakan prinsip least privilege.

---

# BQ. TEST ACCOUNT

Buat akun testing:

ADMIN:

```text
admin@example.test
```

STUDENT:

```text
Nomor Peserta: 260001
```

Gunakan password testing yang tidak digunakan untuk production.

Jelaskan kepada saya bagaimana mengganti credential production.

---

# BR. SEED EXAM

Buat:

```text
SIMULASI TKA SD
```

Jumlah soal:

40

Durasi:

105 menit

Token:

5 digit

Buat beberapa soal dummy untuk pengujian.

---

# BS. TESTING WAJIB

Buat automated test atau setidaknya checklist pengujian untuk:

### Authentication

* login berhasil;
* login gagal;
* akun nonaktif;
* logout;
* session expiration.

### Token

* token benar;
* token salah;
* token expired;
* token belum aktif;
* token salah panjang;
* token digunakan pada ujian berbeda.

### Exam

* start;
* timer;
* refresh;
* reconnect;
* submit;
* timeout.

### Answers

* create;
* update;
* duplicate request;
* failed request;
* recovery.

### Security

* unauthorized API;
* IDOR;
* student → admin;
* student → student lain;
* correct answer exposure;
* score manipulation.

### Result

* correct;
* wrong;
* unanswered;
* score;
* timeout;
* duplicate submit.

---

# BT. EDGE CASES

Tangani kasus berikut:

1. Siswa login tepat ketika token expired.
2. Siswa menekan mulai tepat ketika ujian berakhir.
3. Dua request start terkirim bersamaan.
4. Dua request submit terkirim bersamaan.
5. Browser refresh ketika autosave sedang berjalan.
6. Internet putus tepat ketika siswa memilih jawaban.
7. Internet putus ketika waktu habis.
8. Siswa membuka dua tab.
9. Siswa login pada dua perangkat.
10. Admin menonaktifkan ujian ketika siswa sedang mengerjakan.
11. Admin mereset session ketika siswa sedang mengerjakan.
12. Soal diubah ketika ujian sudah berjalan.
13. Token berubah ketika ujian sudah berjalan.

Buat aturan yang konsisten dan dokumentasikan perilakunya.

---

# BU. ADMIN TIDAK BOLEH MERUSAK UJIAN AKTIF

Jika ujian sudah ACTIVE dan terdapat peserta yang sedang mengerjakan:

Admin sebaiknya tidak dapat mengubah:

* pertanyaan;
* pilihan jawaban;
* jawaban benar;
* durasi;

secara langsung tanpa peringatan.

Jika perubahan memang diperlukan, gunakan mekanisme versioning atau buat versi ujian baru.

---

# BV. EXAM VERSIONING

Jika memungkinkan buat:

```text
exam_version
```

Setelah ujian dimulai, session menggunakan versi ujian tersebut.

Dengan demikian perubahan soal pada masa mendatang tidak mengubah soal peserta yang sedang/ sudah ujian.

---

# BW. DATA YANG DILIHAT SISWA

Saat ujian, response API siswa hanya boleh berisi:

```text
question_id
question_number
question_text
image_url
options
```

Tidak boleh:

```text
correct_answer
score
answer_key
admin_data
other_students
```

---

# BX. DATA YANG DILIHAT ADMIN

Admin dapat melihat sesuai hak akses:

* peserta;
* soal;
* token;
* session;
* jawaban;
* hasil.

Tetap gunakan authorization.

---

# BY. LOGGING

Server harus mempunyai logging untuk error teknis.

Namun:

JANGAN mencatat:

* password;
* token rahasia secara plaintext jika tidak diperlukan;
* data pribadi berlebihan.

---

# BZ. ENVIRONMENT

Buat:

```text
.env.example
```

Contoh:

```text
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
```

Service role key hanya server-side.

---

# CA. README

Buat README yang menjelaskan:

1. Instalasi.
2. Environment variables.
3. Database migration.
4. Seed data.
5. Menjalankan development.
6. Build production.
7. Deployment.
8. Membuat admin.
9. Import siswa.
10. Membuat ujian.
11. Membuat soal.
12. Membuat token.
13. Menjalankan simulasi.
14. Melihat hasil.

---

# CB. MIGRATION

Semua tabel harus dapat dibuat melalui migration.

Jangan hanya membuat tabel manual tanpa dokumentasi.

Sediakan:

```text
migrations/
```

atau mekanisme migration sesuai stack.

---

# CC. COMPONENT ARCHITECTURE

Pisahkan komponen:

```text
components/
  auth/
  student/
  exam/
  admin/
  questions/
  timer/
  results/
  ui/
```

Pisahkan:

```text
lib/
  auth/
  database/
  exam/
  scoring/
  security/
  validation/
```

Jangan membuat satu file besar yang berisi seluruh aplikasi.

---

# CD. API ARCHITECTURE

Jika menggunakan API:

```text
/api/auth
/api/student
/api/exams
/api/exams/[id]/start
/api/exams/[id]/questions
/api/exams/[id]/answer
/api/exams/[id]/submit
/api/exams/[id]/session
/api/admin/students
/api/admin/questions
/api/admin/tokens
/api/admin/results
/api/admin/monitoring
```

Gunakan authorization pada setiap endpoint.

---

# CE. VALIDATION

Gunakan schema validation.

Contoh:

Nomor peserta:

```text
required
string
length sesuai konfigurasi
```

Token:

```text
required
exactly 5 digits
```

Answer:

```text
harus merupakan pilihan yang tersedia
```

Jangan mempercayai input frontend.

---

# CF. PASSWORD

Password siswa:

* jangan disimpan plaintext;
* gunakan password hashing;
* jangan tampilkan password dalam dashboard;
* admin dapat melakukan reset password;
* setelah reset, password baru harus diproses dengan hashing.

---

# CG. ADMIN SECURITY

Admin sebaiknya:

* memiliki authentication terpisah;
* session aman;
* rate limiting;
* authorization;
* audit log.

Jika memungkinkan tambahkan:

2FA untuk admin.

Tetapi jangan menghambat login siswa.

---

# CH. SECURITY HEADERS

Jika sesuai dengan framework, terapkan:

* Content Security Policy;
* X-Frame-Options;
* Referrer-Policy;
* X-Content-Type-Options;
* secure cookies;
* SameSite cookie policy.

Jangan menambahkan konfigurasi yang menyebabkan aplikasi rusak.

---

# CI. CSRF

Jika authentication menggunakan cookie/session, lindungi endpoint yang memodifikasi data dari CSRF sesuai arsitektur framework.

---

# CJ. XSS

Semua input teks yang ditampilkan kembali harus disanitasi/escaped.

Jika rich text digunakan pada soal, gunakan sanitizer yang aman.

---

# CK. RATE LIMITING

Terapkan rate limiting untuk:

* login;
* token validation;
* API sensitif;
* admin actions.

Jangan membuat rate limit terlalu agresif sehingga mengganggu autosave normal.

---

# CL. ANTI-TAMPERING

Jika siswa mengubah:

```text
localStorage
sessionStorage
browser clock
JavaScript timer
request payload
student_id
score
```

server tetap harus mempertahankan keadaan yang benar.

Browser adalah client yang tidak dipercaya.

---

# CM. PENGGUNAAN TOKEN

Token bukan pengganti authentication.

Urutan:

Authentication
+
Authorization
+
Token verification

Semua harus lolos.

---

# CN. SESSION LOCK

Setelah:

SUBMITTED

atau

TIME_EXPIRED

session harus immutable untuk siswa.

Tidak boleh:

* menambah jawaban;
* mengubah jawaban;
* mengubah timer.

---

# CO. ADMIN OVERRIDE

Jika admin memiliki kemampuan untuk mengubah session, semua override harus:

* membutuhkan konfirmasi;
* dicatat audit log;
* tidak dilakukan secara diam-diam.

---

# CP. RESPONSIVE ADMIN

Dashboard admin harus nyaman digunakan di desktop.

Siswa diprioritaskan mobile.

---

# CQ. UI STATES

Setiap halaman harus memiliki:

Loading

Empty

Success

Error

Unauthorized

Not Found

Offline

Saving

Saved

Expired

---

# CR. AUTOSAVE INDICATOR

Tampilkan:

```text
✓ Jawaban tersimpan
```

atau:

```text
⟳ Menyimpan...
```

atau:

```text
⚠ Belum tersimpan
```

Status harus berasal dari kondisi nyata, bukan animasi palsu.

---

# CS. TIMER SYNC

Jangan melakukan request setiap detik.

Gunakan:

```text
server timestamp
+
expected_end_at
```

Browser menghitung display countdown.

Secara berkala lakukan synchronization untuk mengurangi perbedaan waktu.

Server tetap menentukan apakah session masih valid.

---

# CT. TAB SWITCH

Untuk versi pertama tidak perlu memblokir perpindahan tab secara ekstrem.

Namun jika ingin mencatat:

```text
visibility_change
```

dapat dimasukkan ke audit log.

Jangan menganggap siswa curang hanya karena berpindah tab tanpa aturan resmi.

---

# CU. PRINT / SCREENSHOT

Tidak perlu membuat klaim bahwa sistem dapat mencegah screenshot secara absolut.

Jika diperlukan, cukup:

* tampilkan identitas peserta;
* gunakan watermark;
* catat aktivitas tertentu.

Tetapi jangan mengklaim bahwa screenshot dapat dicegah sepenuhnya.

---

# CV. ACCESSIBILITY UNTUK SISWA SD

Gunakan bahasa yang mudah dipahami:

"Jawaban tersimpan."

"Waktu tersisa."

"Anda belum menjawab soal ini."

"Apakah Anda yakin ingin menyelesaikan ujian?"

Hindari istilah teknis kepada siswa.

---

# CW. BAHASA

Default seluruh UI:

**Bahasa Indonesia**

Gunakan bahasa formal tetapi mudah dipahami siswa.

---

# CX. FORMAT WAKTU

Gunakan:

```text
01:45:00
```

untuk timer.

Tanggal menggunakan format Indonesia jika ditampilkan kepada pengguna.

Timezone aplikasi:

```text
Asia/Jakarta
```

Pastikan database timestamp memiliki strategi timezone yang konsisten.

---

# CY. DATABASE TIMEZONE

Simpan timestamp secara konsisten.

Jangan mencampur:

* waktu browser;
* waktu server lokal;
* UTC;

tanpa konversi yang jelas.

---

# CZ. DEPLOYMENT

Siapkan aplikasi agar dapat:

```text
development
staging
production
```

Jangan menggunakan data testing pada production.

---

# DA. PRODUCTION CHECKLIST

Sebelum production:

[ ] Environment variable benar
[ ] Database migration selesai
[ ] RLS aktif
[ ] Service role tidak bocor
[ ] HTTPS aktif
[ ] Admin account aman
[ ] Password siswa ter-hash
[ ] Timer server-side
[ ] Autosave aktif
[ ] Scoring server-side
[ ] Authorization diuji
[ ] Backup tersedia
[ ] Logging aktif
[ ] Rate limit aktif
[ ] Error page aman
[ ] Dummy data dihapus
[ ] Test account tidak digunakan production

---

# DB. ACCEPTANCE CRITERIA

Aplikasi dianggap berhasil apabila:

### TEST 1

Siswa memasukkan nomor peserta dan password yang benar.

Hasil:
Berhasil login.

### TEST 2

Siswa memasukkan password salah.

Hasil:
Login ditolak.

### TEST 3

Siswa memasukkan token 5 digit yang salah.

Hasil:
Token ditolak.

### TEST 4

Siswa memasukkan token benar.

Hasil:
Masuk ke instruksi.

### TEST 5

Siswa mulai ujian.

Hasil:
Server membuat session dan timer 105 menit.

### TEST 6

Siswa refresh browser.

Hasil:
Ujian tetap berjalan dan waktu tidak reset.

### TEST 7

Siswa mengubah jawaban.

Hasil:
Jawaban terbaru tersimpan.

### TEST 8

Internet terputus sementara.

Hasil:
Sistem menunjukkan status koneksi dan mencoba sinkronisasi kembali.

### TEST 9

Waktu habis.

Hasil:
Ujian otomatis berakhir.

### TEST 10

Siswa mencoba mengubah score melalui browser.

Hasil:
Tidak berhasil karena score dihitung server.

### TEST 11

Siswa mencoba melihat jawaban benar.

Hasil:
Tidak tersedia di client.

### TEST 12

Siswa mencoba mengakses data siswa lain.

Hasil:
403 / akses ditolak.

### TEST 13

Admin login.

Hasil:
Dashboard admin dapat diakses.

### TEST 14

Admin membuat token.

Hasil:
Token 5 digit dibuat dan dapat diaktifkan.

### TEST 15

Admin melihat monitoring.

Hasil:
Status peserta dapat dilihat.

### TEST 16

Admin melihat hasil.

Hasil:
Nilai sesuai perhitungan server.

---

# DC. JANGAN MERUSAK PROJECT YANG SUDAH ADA

Jika saya memberikan project yang sudah memiliki kode:

1. Periksa struktur terlebih dahulu.
2. Identifikasi framework.
3. Identifikasi database.
4. Identifikasi authentication.
5. Identifikasi halaman yang sudah ada.
6. Jangan menghapus fitur yang sudah berjalan.
7. Jangan melakukan rewrite besar tanpa alasan.
8. Gunakan komponen yang sudah ada jika masih layak.
9. Berikan daftar file yang diubah.
10. Berikan alasan perubahan penting.

Jika terdapat kode yang tidak aman, perbaiki dengan tetap mempertahankan fungsi aplikasinya.

---

# DD. METODE PENGERJAAN

Kerjakan secara bertahap.

## PHASE 0 — AUDIT PROJECT

Periksa:

* framework;
* package;
* database;
* environment;
* routing;
* authentication;
* struktur folder.

Jangan langsung mengubah kode.

## PHASE 1 — DATABASE

Buat migration dan relationship.

## PHASE 2 — AUTHENTICATION

Buat login siswa dan admin.

## PHASE 3 — STUDENT PROFILE

Tampilkan data siswa.

## PHASE 4 — EXAM

Buat ujian dan soal.

## PHASE 5 — TOKEN

Implementasikan token 5 digit.

## PHASE 6 — SESSION

Implementasikan exam session.

## PHASE 7 — TIMER

Implementasikan server-side timer.

## PHASE 8 — ANSWER

Implementasikan autosave.

## PHASE 9 — SUBMISSION

Implementasikan submit dan auto-submit.

## PHASE 10 — SCORING

Implementasikan perhitungan nilai.

## PHASE 11 — ADMIN

Implementasikan dashboard.

## PHASE 12 — MONITORING

Implementasikan monitoring.

## PHASE 13 — EXPORT

Implementasikan export.

## PHASE 14 — SECURITY

Audit security.

## PHASE 15 — TESTING

Lakukan end-to-end testing.

---

# DE. ATURAN PENTING UNTUK AI DEVELOPER

Jangan:

* membuat fake API;
* menggunakan data hardcoded sebagai sistem final;
* menyimpan password plaintext;
* menyimpan jawaban benar di frontend;
* menghitung nilai hanya di frontend;
* menggunakan waktu device sebagai sumber waktu utama;
* membuat timer yang reset setelah refresh;
* menganggap localStorage sebagai database;
* menaruh secret key di frontend;
* memberikan akses database penuh kepada client;
* mengabaikan authorization.

Semua data penting harus berasal dari database/server.

---

# DF. OUTPUT SETIAP PHASE

Setelah setiap phase selesai, berikan:

1. Apa yang dibuat.
2. File yang dibuat.
3. File yang diubah.
4. Database migration yang dibuat.
5. Environment variable baru.
6. Cara menjalankan.
7. Cara melakukan testing.
8. Potensi masalah.
9. Status phase.

Contoh:

```text
PHASE 1 — COMPLETED

Created:
- ...
- ...

Modified:
- ...

Database:
- ...

Testing:
- ...

Status:
READY FOR PHASE 2
```

---

# DG. FINAL DELIVERABLE

Pada akhir pembangunan harus tersedia:

```text
FULL WEB APPLICATION

├── Student Login
├── Student Profile
├── Token Verification
├── Exam Instructions
├── Exam Session
├── Server Timer
├── Question Engine
├── Autosave
├── Reconnect
├── Submit
├── Auto Submit
├── Scoring
├── Student Result
├── Admin Login
├── Admin Dashboard
├── Student Management
├── Exam Management
├── Question Management
├── Token Management
├── Exam Monitoring
├── Result Management
├── Export
├── Audit Log
├── Security
├── Database Migration
├── Seed Data
├── Automated/Manual Tests
└── Documentation
```

---

# DH. KONFIGURASI DEFAULT

Untuk versi pertama gunakan:

Nama:
SIMULASI TKA/TKAD SD

Bahasa:
Bahasa Indonesia

Timezone:
Asia/Jakarta

Durasi:
105 menit

Token:
5 digit angka

Jenis soal:
Pilihan Ganda

Jumlah soal testing:
40

Role:
STUDENT
ADMIN

Autosave:
AKTIF

Server-side timer:
WAJIB

Server-side scoring:
WAJIB

Admin dashboard:
AKTIF

Monitoring:
AKTIF jika infrastruktur mendukung

---

# DI. HASIL YANG SAYA HARAPKAN

Saya ingin aplikasi yang ketika digunakan siswa benar-benar terasa seperti sistem ujian online sekolah.

Contoh pengalaman siswa:

```text
LOGIN
↓
Nomor Peserta: 260001
Password: ********
↓
DATA SISWA
↓
Masukkan Token:
58321
↓
TOKEN VALID
↓
INSTRUKSI
↓
MULAI UJIAN
↓
01:45:00
↓
SOAL 1
↓
JAWAB
↓
AUTOSAVE
↓
SOAL 2
↓
...
↓
SOAL 40
↓
SELESAI
↓
NILAI
```

Sedangkan guru:

```text
ADMIN LOGIN
↓
DASHBOARD
↓
120 PESERTA
↓
AKTIFKAN UJIAN
↓
GENERATE TOKEN
↓
BAGIKAN TOKEN KEPADA SISWA
↓
MONITORING
↓
PESERTA MENGERJAKAN
↓
SELESAI
↓
HASIL
↓
EXPORT
```

---

# DJ. INSTRUKSI TERAKHIR

Mulai dengan **AUDIT PROJECT TERLEBIH DAHULU**.

Jangan langsung membuat seluruh aplikasi dalam satu langkah jika project sudah memiliki kode.

Tampilkan kepada saya:

1. Struktur project saat ini.
2. Teknologi yang digunakan.
3. Database yang digunakan.
4. Authentication yang sudah tersedia.
5. Bagian yang sudah dapat digunakan.
6. Bagian yang belum tersedia.
7. Rencana implementasi.
8. Risiko teknis yang ditemukan.

Setelah itu mulai implementasi dari PHASE 1.

**Jangan mengarang konfigurasi yang tidak ada. Jika membutuhkan informasi atau credential tertentu, jelaskan secara spesifik apa yang dibutuhkan.**

Tujuan akhir bukan membuat demo, tetapi membuat **platform simulasi TKA/TKAD SD yang benar-benar siap digunakan oleh sekolah dengan data siswa nyata.**
