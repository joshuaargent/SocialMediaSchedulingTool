import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pipeline',
  description: `Manage your content production pipeline and track content from ideation to publication with ${siteConfig.name}.`,
  keywords: ['pipeline', 'content pipeline', 'production workflow', 'content creation', 'production management', siteConfig.name],
};