import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIMULASI TKA/TKAD SD — Platform Ujian & Belajar Resmi',
  description:
    'Platform Simulasi Tes Kemampuan Akademik (TKA/TKAD) Sekolah Dasar dengan timer server terpusat, penguncian otomatis, dan modul belajar interaktif.',
  authors: [{ name: 'SD Negeri Kalisalak 01' }],
  keywords: ['TKA', 'TKAD', 'Simulasi Ujian', 'Sekolah Dasar', 'Pusmendik', 'Asesmen'],
  icons: {
    icon: '/logo-tegal.svg',
    shortcut: '/logo-tegal.svg',
    apple: '/logo-tegal.svg',
  },
  openGraph: {
    title: 'SIMULASI TKA/TKAD SD — Platform Ujian & Belajar Resmi',
    description:
      'Platform Simulasi Tes Kemampuan Akademik (TKA/TKAD) Sekolah Dasar dengan timer server terpusat dan bank soal resmi.',
    type: 'website',
    locale: 'id_ID',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased selection:bg-blue-600 selection:text-white">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
