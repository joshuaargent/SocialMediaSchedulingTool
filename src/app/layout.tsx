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
  title: {
    default: 'SMST - Social Media Scheduling Tool',
    template: '%s | SMST',
  },
  description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube. Streamline your social media workflow with powerful scheduling and analytics tools.',
  keywords: [
    'social media scheduling',
    'content scheduling',
    'social media management',
    'tiktok scheduling',
    'youtube scheduling',
    'instagram scheduling',
    'facebook scheduling',
    'content calendar',
    'social media analytics',
    'SMST'
  ],
  authors: [{ name: 'Joshua Argent', url: 'https://joshuaargent.co.uk' }],
  creator: 'Joshua Argent',
  publisher: 'SMST',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://smst.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://smst.app',
    siteName: 'SMST',
    title: 'SMST - Social Media Scheduling Tool',
    description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SMST - Social Media Scheduling Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SMST - Social Media Scheduling Tool',
    description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube.',
    images: ['/og-image.png'],
    creator: '@joshua_argent',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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
          <main className="min-h-screen pb-24">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
