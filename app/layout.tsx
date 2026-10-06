import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Pengundian Digital Nomor Otomatis',
  description: 'Aplikasi pengundian nomor acak digital profesional untuk doorprize, undian kupon, dan acara panggung dengan tampilan layar penuh dan proyektor.',
  openGraph: {
    title: 'Pengundian Digital Nomor Otomatis',
    description: 'Aplikasi pengundian nomor acak digital profesional untuk doorprize, undian kupon, dan acara panggung dengan tampilan layar penuh dan proyektor.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pengundian Digital Nomor Otomatis',
    description: 'Aplikasi pengundian nomor acak digital profesional untuk doorprize, undian kupon, dan acara panggung dengan tampilan layar penuh dan proyektor.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
