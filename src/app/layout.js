import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata = {
  title: 'حروف مع عبدو',
  description: 'لعبة الحروف العربية - تحدي الفرق في الوقت الحقيقي',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#6B3FA0" />
      </head>
      <body className={cairo.className}>
        {children}
      </body>
    </html>
  );
}
