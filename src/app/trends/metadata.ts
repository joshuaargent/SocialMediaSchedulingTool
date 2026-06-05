import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Trends',
  description: `Discover trending topics and content ideas for your social media channels using ${siteConfig.name}.`,
  keywords: ['trends', 'trending topics', 'content ideas', 'social media trends', siteConfig.name],
};