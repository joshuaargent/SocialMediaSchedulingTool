import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Series',
  description: `Organize your content into series for better storytelling and audience engagement with ${siteConfig.name}.`,
  keywords: ['series', 'content series', 'video series', 'content organization', siteConfig.name],
};