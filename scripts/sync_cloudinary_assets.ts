import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Sinkronisasi Aset ke Cloudinary (ixjihcvx) ---');

  const soalDir = path.join(process.cwd(), 'public', 'soal-images');
  const urlMapping: Record<string, string> = {};

  if (fs.existsSync(soalDir)) {
    const files = fs.readdirSync(soalDir);
    console.log(`Ditemukan ${files.length} gambar soal di folder public/soal-images`);

    for (const file of files) {
      const filePath = path.join(soalDir, file);
      const filenameWithoutExt = path.parse(file).name;
      const localUrl = `/soal-images/${file}`;

      try {
        console.log(`Mengunggah ${file} ke Cloudinary...`);
        const res = await cloudinary.uploader.upload(filePath, {
          folder: 'tka_simulasi/soal_images',
          public_id: filenameWithoutExt,
          overwrite: true,
          resource_type: 'image',
        });
        urlMapping[localUrl] = res.secure_url;
        console.log(`✓ Berhasil: ${localUrl} -> ${res.secure_url}`);
      } catch (err: any) {
        console.error(`✕ Gagal mengunggah ${file}:`, err.message);
      }
    }
  }

  // Also upload logo-tegal.svg
  const logoPath = path.join(process.cwd(), 'public', 'logo-tegal.svg');
  if (fs.existsSync(logoPath)) {
    try {
      console.log('Mengunggah logo-tegal.svg ke Cloudinary...');
      const resLogo = await cloudinary.uploader.upload(logoPath, {
        folder: 'tka_simulasi/branding',
        public_id: 'logo-tegal',
        overwrite: true,
        resource_type: 'image',
      });
      urlMapping['/logo-tegal.svg'] = resLogo.secure_url;
      console.log(`✓ Logo Cloudinary URL: ${resLogo.secure_url}`);
    } catch (err: any) {
      console.error('✕ Gagal mengunggah logo:', err.message);
    }
  }

  // Update Database Questions in Supabase
  console.log('\n--- Mengupdate URL Gambar Soal di Database Supabase ---');
  const questions = await prisma.question.findMany({
    where: {
      image_url: { not: null },
    },
  });

  console.log(`Ditemukan ${questions.length} soal dengan gambar.`);
  let updatedCount = 0;

  for (const q of questions) {
    if (!q.image_url) continue;

    // Handle single or multiple image URLs separated by comma or semicolon
    const parts = q.image_url.split(/[,;]\s*/);
    const newParts = parts.map((part) => {
      const trimmed = part.trim();
      if (urlMapping[trimmed]) {
        return urlMapping[trimmed];
      }
      return trimmed;
    });

    const newImageUrl = newParts.join(', ');
    if (newImageUrl !== q.image_url) {
      await prisma.question.update({
        where: { id: q.id },
        data: { image_url: newImageUrl },
      });
      updatedCount++;
    }
  }

  console.log(`✓ Berhasil memperbarui ${updatedCount} soal di database Supabase dengan link Cloudinary CDN!`);
  console.log('\n--- SINKRONISASI CLOUDINARY SELESAI ---');
}

main()
  .catch((e) => {
    console.error('Error in sync script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
