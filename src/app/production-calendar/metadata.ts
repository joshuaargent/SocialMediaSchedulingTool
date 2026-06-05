import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Production Calendar',
  description: `Plan your content production timeline and manage the workflow from concept to publication with ${siteConfig.name}.`,
  keywords: ['production calendar', 'content production', 'workflow', 'production timeline', siteConfig.name],
};