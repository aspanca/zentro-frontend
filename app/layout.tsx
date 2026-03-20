import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'KosovaProna — Tregu i pasurive të patundshme në Kosovë',
    template: '%s | KosovaProna',
  },
  description:
    'Gjeni pronën tuaj të ëndrrave në Kosovë. Banesa, shtëpi dhe truall për shitje në Prishtinë, Prizren, Pejë dhe qytete tjera.',
  keywords: ['prona Kosovë', 'banesa shitje', 'shtëpi Prishtinë', 'real estate Kosovo'],
  openGraph: {
    type: 'website',
    locale: 'sq_XK',
    siteName: 'KosovaProna',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="font-bold text-gray-900">
                  Kosova<span className="text-rose-500">Prona</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">
                © {new Date().getFullYear()} KosovaProna. Të gjitha të drejtat e rezervuara.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
