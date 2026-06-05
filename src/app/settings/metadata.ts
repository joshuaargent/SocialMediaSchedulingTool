import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Settings',
  description: `Configure your ${siteConfig.name} account settings, manage platform connections, and customize your preferences.`,
  keywords: ['settings', 'account settings', 'platform connections', 'preferences', siteConfig.name],
};