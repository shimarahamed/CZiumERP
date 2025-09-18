import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/context/AppContext';
import AuthWrapper from '@/components/AuthWrapper';

export const metadata: Metadata = {
  title: 'CZium ERP',
  description: 'A modern ERP for your business',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#5b21b6" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AuthWrapper>
            {children}
          </AuthWrapper>
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
