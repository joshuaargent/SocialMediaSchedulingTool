import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Uploads',
  description: `View and manage your recent media uploads to ${siteConfig.name}.`,
  keywords: ['uploads', 'media uploads', 'video uploads', 'image uploads', siteConfig.name],
};