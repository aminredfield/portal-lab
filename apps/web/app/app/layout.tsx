import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/Providers';

// Import Inter font from Google. This ensures consistent typography.
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Portal Lab',
  description: 'Internal portal demonstrating auth, uploads, errors and performance.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}