# Platform Simulasi TKA/TKAD Sekolah Dasar

Platform simulasi ujian online resmi untuk Sekolah Dasar yang dirancang khusus dengan fokus pada keamanan data, otoritas waktu berbasis server (*server-side timer*), penyimpanan jawaban otomatis (*real-time autosave*), dan kemudahan akses bagi siswa SD maupun guru/administrator.

Aplikasi ini dibangun mengacu penuh pada spesifikasi [blueprint.md](file:///b:/WEBSITE/tka_simulasion/blueprint.md).

---

## Fitur Utama

1. **Autentikasi Aman & Terpisah (RBAC)**:
   - Siswa login menggunakan Nomor Peserta + Password (Hashed bcrypt) dengan opsi *Lihat Password*.
   - Portal Admin khusus di `/admin/login`.
   - Autentikasi berbasis HTTP-Only Secure Cookies.
2. **Validasi Token 5 Digit**:
   - Token unik 5 digit angka yang divalidasi langsung oleh server.
   - Generator token acak kriptografis di sisi admin.
3. **Timer Otoritatif Sisi Server**:
   - Durasi 105 menit dihitung dari `started_at` dan `expected_end_at` server.
   - Browser hanya menampilkan hitung mundur; refresh atau perubahan jam perangkat tidak memengaruhi sisa waktu.
   - Status visual: Normal (>30m), Warning (10–30m), Kritis (<10m), dan Peringatan (<5m).
4. **Autosave Seketika & Ketahanan Jaringan**:
   - Setiap pilihan jawaban disimpan secara instan ke database melalui transaksi atomik.
   - Queue penyimpanan lokal otomatis saat koneksi internet terputus dan sinkronisasi otomatis saat online kembali.
5. **Kerahasiaan Kunci Jawaban**:
   - Kunci jawaban (`correct_answer`) **tidak pernah dikirim ke browser siswa**.
6. **Perhitungan Nilai Server-Side**:
   - Nilai dihitung 100% di server berdasarkan kunci jawaban database saat siswa menyelesaikan ujian atau saat waktu habis (*auto-submit*).
7. **Monitoring Peserta Real-Time**:
   - Guru/admin dapat memantau status pengerjaan, sisa waktu, dan progres setiap peserta secara langsung.
   - Fitur *Reset Sesi* darurat yang dilengkapi konfirmasi dan pencatatan *Audit Log*.
8. **Ekspor Nilai**:
   - Ekspor rekapitulasi nilai dan durasi pengerjaan ke format **Excel (.xlsx)** dan **CSV**.

---

## Akun Pengujian (Testing Accounts)

### 1. Akun Administrator
- **URL**: `http://localhost:3000/admin/login`
- **Email**: `admin@example.test`
- **Password**: `Admin#TKA2026!`

### 2. Akun Siswa Pengujian
- **URL**: `http://localhost:3000/login`
- **Nomor Peserta**: `260001`
- **Password**: `Siswa#2026!`
- **Token Ujian 5 Digit Aktif**: `58321`

*(Tersedia pula akun siswa tambahan: `260002`, `260003`, `260004`, `260005` dengan password yang sama).*

---

## Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- Node.js versi 18 ke atas (disarankan Node.js v20/v24).
- Database PostgreSQL (Dapat menggunakan **Supabase**, **Neon**, **Railway**, atau PostgreSQL lokal).

### 2. Pengaturan Environment Variables
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi database dan rahasia aplikasi pada `.env`:
```env
# URL Koneksi PostgreSQL / Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]?schema=public"

# Kunci Rahasia JWT (Minimal 32 karakter untuk production)
JWT_SECRET="tka-simulasi-sd-secret-key-super-secure-token-2026"
ADMIN_JWT_SECRET="tka-simulasi-sd-admin-secret-key-super-secure-2026"

# Informasi Sekolah
NEXT_PUBLIC_APP_NAME="SIMULASI TKA/TKAD SD"
NEXT_PUBLIC_SCHOOL_NAME="SD NEGERI KALISALAK 01"
NEXT_PUBLIC_EXAM_DURATION_MINUTES="105"
```

### 3. Migrasi Database & Seeding Data
Jalankan perintah migrasi Prisma untuk menyusun tabel di database PostgreSQL:
```bash
# Push skema ke database
npx prisma db push

# Atau jika menggunakan Supabase SQL Editor:
# Eksekusi berkas: migrations/001_initial_schema.sql
```

Jalankan skrip seed untuk membuat akun admin, siswa, ujian aktif, token 5 digit, dan 40 butir soal simulasi TKA SD:
```bash
npx tsx prisma/seed.ts
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

### 5. Kompilasi Production
```bash
npm run build
npm run start
```

---

## Struktur Direktori

```text
tka_simulasion/
├── migrations/
│   └── 001_initial_schema.sql       # Skrip SQL mentah PostgreSQL/Supabase
├── prisma/
│   ├── schema.prisma                # Skema data ORM
│   └── seed.ts                      # Seeder 40 soal & akun pengujian
├── src/
│   ├── app/
│   │   ├── admin/                   # Halaman Dashboard, Monitoring, Peserta, Ujian, Hasil
│   │   ├── api/                     # REST API terproteksi JWT & RBAC
│   │   │   ├── admin/               # API khusus administrator
│   │   │   ├── auth/                # API autentikasi siswa & admin
│   │   │   └── exams/               # API ujian, token, timer, autosave, submit
│   │   ├── dashboard/               # Dashboard siswa
│   │   ├── exam/[id]/               # Lembar ujian siswa (Timer & Autosave)
│   │   ├── login/                   # Halaman login siswa
│   │   └── page.tsx                 # Landing page resmi sekolah
│   └── lib/
│       ├── audit.ts                 # Pencatat audit log aktivitas
│       ├── auth.ts                  # Utilitas JWT & hash password bcrypt
│       ├── db.ts                    # Prisma client singleton
│       └── scoring.ts               # Engine penilaian server-side
└── blueprint.md                     # Master blueprint & spesifikasi sistem
```

---

## Cara Mengganti Kredensial untuk Production

1. Ubah `JWT_SECRET` dan `ADMIN_JWT_SECRET` pada file `.env` dengan string acak dengan entropi tinggi (contoh: `openssl rand -base64 32`).
2. Buat akun administrator baru melalui menu admin atau langsung di database dengan password yang aman.
3. Hapus data testing siswa atau perbarui nomor peserta dan NISN sesuai data Dapodik sekolah yang valid menggunakan fitur **Import CSV**.
4. Hapus token uji coba lama dan hasilkan token baru melalui tombol `[ Generate Token ]` di portal admin sebelum ujian resmi dimulai.
