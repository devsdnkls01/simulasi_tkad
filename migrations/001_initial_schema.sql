-- Migration: 001_initial_schema.sql
-- Description: Platform Simulasi TKA/TKAD Sekolah Dasar Database Schema
-- Compatible with PostgreSQL & Supabase

-- ENUMS
DO $$ BEGIN
  CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'GURU', 'OPERATOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "ExamStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'FINISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "TokenStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE "SessionStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'TIME_EXPIRED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Students Table
CREATE TABLE IF NOT EXISTS "students" (
  "id" TEXT PRIMARY KEY,
  "nomor_peserta" TEXT UNIQUE NOT NULL,
  "nama_lengkap" TEXT NOT NULL,
  "nis" TEXT,
  "nisn" TEXT,
  "kelas" TEXT NOT NULL,
  "rombel" TEXT,
  "foto_url" TEXT,
  "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
  "password_hash" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_students_nomor_peserta" ON "students"("nomor_peserta");
CREATE INDEX IF NOT EXISTS "idx_students_nisn" ON "students"("nisn");
CREATE INDEX IF NOT EXISTS "idx_students_kelas" ON "students"("kelas");

-- 2. Admins Table
CREATE TABLE IF NOT EXISTS "admins" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "nama" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Exams Table
CREATE TABLE IF NOT EXISTS "exams" (
  "id" TEXT PRIMARY KEY,
  "kode_ujian" TEXT UNIQUE NOT NULL,
  "nama_ujian" TEXT NOT NULL,
  "deskripsi" TEXT,
  "mata_pelajaran" TEXT NOT NULL,
  "kelas" TEXT NOT NULL,
  "tanggal_mulai" TIMESTAMP(3),
  "tanggal_selesai" TIMESTAMP(3),
  "durasi_menit" INTEGER NOT NULL DEFAULT 105,
  "jumlah_soal" INTEGER NOT NULL DEFAULT 40,
  "status" "ExamStatus" NOT NULL DEFAULT 'DRAFT',
  "randomize_questions" BOOLEAN NOT NULL DEFAULT TRUE,
  "randomize_options" BOOLEAN NOT NULL DEFAULT TRUE,
  "show_result" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Exam Tokens Table
CREATE TABLE IF NOT EXISTS "exam_tokens" (
  "id" TEXT PRIMARY KEY,
  "exam_id" TEXT NOT NULL REFERENCES "exams"("id") ON DELETE CASCADE,
  "token_code" VARCHAR(5) NOT NULL,
  "token_hash" TEXT,
  "status" "TokenStatus" NOT NULL DEFAULT 'ACTIVE',
  "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "valid_until" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_exam_tokens_exam_id" ON "exam_tokens"("exam_id");
CREATE INDEX IF NOT EXISTS "idx_exam_tokens_token_code" ON "exam_tokens"("token_code");

-- 5. Questions Table
CREATE TABLE IF NOT EXISTS "questions" (
  "id" TEXT PRIMARY KEY,
  "exam_id" TEXT NOT NULL REFERENCES "exams"("id") ON DELETE CASCADE,
  "question_number" INTEGER NOT NULL,
  "question_type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
  "question_text" TEXT NOT NULL,
  "image_url" TEXT,
  "audio_url" TEXT,
  "option_a" TEXT NOT NULL,
  "option_b" TEXT NOT NULL,
  "option_c" TEXT NOT NULL,
  "option_d" TEXT NOT NULL,
  "correct_answer" VARCHAR(1) NOT NULL,
  "score" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
  "order_index" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_questions_exam_id" ON "questions"("exam_id");
CREATE INDEX IF NOT EXISTS "idx_questions_number" ON "questions"("question_number");

-- 6. Exam Sessions Table
CREATE TABLE IF NOT EXISTS "exam_sessions" (
  "id" TEXT PRIMARY KEY,
  "exam_id" TEXT NOT NULL REFERENCES "exams"("id") ON DELETE CASCADE,
  "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "token_id" TEXT,
  "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expected_end_at" TIMESTAMP(3) NOT NULL,
  "actual_end_at" TIMESTAMP(3),
  "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "current_question" INTEGER NOT NULL DEFAULT 1,
  "status" "SessionStatus" NOT NULL DEFAULT 'NOT_STARTED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_exam_sessions_exam_id" ON "exam_sessions"("exam_id");
CREATE INDEX IF NOT EXISTS "idx_exam_sessions_student_id" ON "exam_sessions"("student_id");
CREATE INDEX IF NOT EXISTS "idx_exam_sessions_status" ON "exam_sessions"("status");

-- 7. Exam Session Questions Table (Random display mapping per session)
CREATE TABLE IF NOT EXISTS "exam_session_questions" (
  "id" TEXT PRIMARY KEY,
  "session_id" TEXT NOT NULL REFERENCES "exam_sessions"("id") ON DELETE CASCADE,
  "question_id" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "display_order" INTEGER NOT NULL,
  "option_order" TEXT,
  CONSTRAINT "uq_session_question" UNIQUE ("session_id", "question_id"),
  CONSTRAINT "uq_session_order" UNIQUE ("session_id", "display_order")
);

CREATE INDEX IF NOT EXISTS "idx_session_questions_session_id" ON "exam_session_questions"("session_id");

-- 8. Answers Table
CREATE TABLE IF NOT EXISTS "answers" (
  "id" TEXT PRIMARY KEY,
  "session_id" TEXT NOT NULL REFERENCES "exam_sessions"("id") ON DELETE CASCADE,
  "question_id" TEXT NOT NULL REFERENCES "questions"("id") ON DELETE CASCADE,
  "answer" VARCHAR(1),
  "is_final" BOOLEAN NOT NULL DEFAULT FALSE,
  "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "uq_answers_session_question" UNIQUE ("session_id", "question_id")
);

CREATE INDEX IF NOT EXISTS "idx_answers_session_id" ON "answers"("session_id");
CREATE INDEX IF NOT EXISTS "idx_answers_question_id" ON "answers"("question_id");

-- 9. Results Table
CREATE TABLE IF NOT EXISTS "results" (
  "id" TEXT PRIMARY KEY,
  "session_id" TEXT UNIQUE NOT NULL REFERENCES "exam_sessions"("id") ON DELETE CASCADE,
  "student_id" TEXT NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
  "exam_id" TEXT NOT NULL REFERENCES "exams"("id") ON DELETE CASCADE,
  "total_questions" INTEGER NOT NULL,
  "correct_answers" INTEGER NOT NULL,
  "wrong_answers" INTEGER NOT NULL,
  "unanswered" INTEGER NOT NULL,
  "score" DOUBLE PRECISION NOT NULL,
  "started_at" TIMESTAMP(3) NOT NULL,
  "finished_at" TIMESTAMP(3) NOT NULL,
  "duration_used" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_results_student_id" ON "results"("student_id");
CREATE INDEX IF NOT EXISTS "idx_results_exam_id" ON "results"("exam_id");

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "user_type" TEXT NOT NULL,
  "user_id" TEXT,
  "details" TEXT,
  "ip_address" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");
