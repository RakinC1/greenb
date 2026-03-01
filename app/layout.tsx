import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/UI/Toast';

export const metadata: Metadata = {
  title:       'GreenBridge — Food Rescue Platform',
  description: 'AI-powered surplus food redistribution connecting restaurants with shelters.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
