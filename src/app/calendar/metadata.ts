import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Calendar',
  description: `Plan and visualize your content schedule with an interactive social media content calendar using ${siteConfig.name}.`,
  keywords: ['calendar', 'content calendar', 'social media schedule', 'content planning', 'scheduling', siteConfig.name],
};