import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CARE BLACKBOX — The Black Box for Safer Healthcare',
  description: 'Real-time clinical voice capture, structured event conversion, and hospital memory platform.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
