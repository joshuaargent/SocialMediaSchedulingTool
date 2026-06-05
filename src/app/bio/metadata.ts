import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Bio',
  description: `Manage your social media bios across multiple platforms from one central location with ${siteConfig.name}.`,
  keywords: ['bio', 'social media bio', 'profile bios', 'platform profiles', siteConfig.name],
};