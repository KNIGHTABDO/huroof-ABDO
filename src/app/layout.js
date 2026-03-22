import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'حروف مع عبدو',
  description: 'لعبة الحروف العربية التفاعلية - تحدي الفرق في الوقت الحقيقي. العب مع عائلتك وأصدقائك!',
  metadataBase: new URL('https://huroof-abdo.vercel.app'),
  openGraph: {
    title: 'حروف مع عبدو',
    description: 'لعبة الحروف العربية التفاعلية - تحدي الفرق في الوقت الحقيقي',
    url: 'https://huroof-abdo.vercel.app',
    siteName: 'حروف مع عبدو',
    images: [
      {
        url: '/assets/logo_transparent.png',
        width: 640,
        height: 640,
        alt: 'حروف مع عبدو',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حروف مع عبدو',
    description: 'لعبة الحروف العربية التفاعلية - تحدي الفرق في الوقت الحقيقي',
    images: ['/assets/logo_transparent.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/assets/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'حروف مع عبدو',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6B3FA0',
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
      </body>
    </html>
  );
}
