import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: `View your ${siteConfig.name} dashboard with content calendar, scheduled posts, and platform analytics overview.`,
  keywords: ['dashboard', 'social media dashboard', 'content calendar', 'scheduled posts', siteConfig.name],
};