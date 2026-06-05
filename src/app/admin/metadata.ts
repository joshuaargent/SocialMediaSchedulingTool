import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Admin',
  description: `${siteConfig.name} administration panel for managing users and system settings.`,
  keywords: ['admin', 'administration', 'users', 'system settings', siteConfig.name],
};