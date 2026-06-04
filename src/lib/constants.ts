// ============================================
// Site Configuration
// ============================================

export const siteConfig = {
  name: 'SMST',
  description: 'Social Media Scheduling Tool for content creators',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://smst.app',
  ogImage: '/og-image.png',
  location: 'Surrey, United Kingdom',
  links: {
    youtube: 'https://youtube.com/@joshua_argent',
    github: 'https://github.com/joshuaargent',
    instagram: 'https://instagram.com/joshua_argent',
    facebook: 'https://facebook.com/joshua_argent',
    strava: 'https://www.strava.com/athletes/500534339',
    email: 'mailto:argentjackjoshua@outlook.com',
  },
  author: {
    name: 'Joshua Argent',
    bio: 'Top-performing content creator',
  },
};

// ============================================
// Metadata
// ============================================

export const meta = {
  title: 'SMST - Social Media Scheduling Tool',
  description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube',
  keywords: ['social media', 'content scheduling', 'tiktok', 'youtube', 'instagram', 'facebook'] as string[],
  siteName: 'SMST',
  twitter: '@joshua_argent',
  instagramHandle: '@joshua_argent',
};

// ============================================
// Navigation
// ============================================

export const mainNav = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Queue', href: '/queue' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Media', href: '/media-library' },
  { label: 'Pipeline', href: '/pipeline' },
  { label: 'Settings', href: '/settings' },
];

export const footerNav = {
  main: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Queue', href: '/queue' },
    { label: 'Calendar', href: '/calendar' },
    { label: 'Analytics', href: '/analytics' },
    { label: 'Media Library', href: '/media-library' },
    { label: 'Settings', href: '/settings' },
  ],
  social: [
    { label: 'YouTube', href: siteConfig.links.youtube },
    { label: 'GitHub', href: siteConfig.links.github },
    { label: 'Instagram', href: siteConfig.links.instagram },
    { label: 'Facebook', href: siteConfig.links.facebook },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms and Conditions', href: '/terms-and-conditions' },
  ],
};

// ============================================
// Design Tokens
// ============================================

export const colors = {
  primary: '#0D9488',
  primaryHover: '#0F766E',
} as const;

// ============================================
// Animation
// ============================================

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
} as const;

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 },
  },
} as const;
