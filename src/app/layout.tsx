
'use client';
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider, useAppContext } from '@/context/AppContext';
import AuthWrapper from '@/components/AuthWrapper';

// Since the layout is now a client component to access context, we define metadata this way.
// Note: This is a simplified approach. For fully dynamic metadata, more advanced Next.js patterns would be needed.
// export const metadata: Metadata = {
//   title: 'CZium ERP',
//   description: 'A modern ERP for your business, built with Next.js and Firebase.',
//   manifest: '/manifest.json',
// };

function DynamicStyles() {
    const { themeSettings } = useAppContext();
    
    // Convert HSL strings to CSS variables format
    const styles = `
      :root {
        ${themeSettings.primaryColor ? `--primary: ${themeSettings.primaryColor};` : ''}
        ${themeSettings.backgroundColor ? `--background: ${themeSettings.backgroundColor};` : ''}
        ${themeSettings.accentColor ? `--accent: ${themeSettings.accentColor};` : ''}
      }
      .dark {
        ${themeSettings.primaryColor ? `--primary: ${themeSettings.primaryColor};` : ''}
        ${themeSettings.backgroundColor ? `--background: ${themeSettings.backgroundColor};` : ''}
        ${themeSettings.accentColor ? `--accent: ${themeSettings.accentColor};` : ''}
      }
    `;
    return <style>{styles}</style>;
}


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
            <DynamicStyles />
            <AuthWrapper>
                {children}
            </AuthWrapper>
            <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
