import type { Metadata, Viewport } from 'next';
import { inter, lora, jetbrainsMono } from '@/lib/fonts';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import { OAuthConnectionSync } from '@/components/auth/OAuthConnectionSync';
import './globals.css';

// ============================================
// Metadata
// ============================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d9488',
};

export const metadata: Metadata = {
  title: 'ContentHub - Social Media Command Center',
  description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube',
  icons: {
    icon: '/favicon.ico',
  },
};

// ============================================
// Root Layout
// ============================================

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0d9488" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#134e4a" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storedTheme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var root = document.documentElement;
                  if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
                    root.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <OAuthConnectionSync />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
