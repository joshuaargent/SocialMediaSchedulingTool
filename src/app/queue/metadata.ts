import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Queue',
  description: `Manage your scheduled posts queue and organize upcoming content for social media platforms with ${siteConfig.name}.`,
  keywords: ['queue', 'scheduled posts', 'post queue', 'content queue', 'upcoming content', siteConfig.name],
};