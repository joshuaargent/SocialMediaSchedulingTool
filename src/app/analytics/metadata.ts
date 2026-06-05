import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Analytics',
  description: `Track your social media performance with detailed analytics for YouTube, TikTok, Instagram, and Facebook using ${siteConfig.name}.`,
  keywords: ['analytics', 'social media analytics', 'youtube analytics', 'performance metrics', 'engagement stats', siteConfig.name],
};
