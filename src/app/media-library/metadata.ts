import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Media Library',
  description: `Browse and manage your uploaded media files including videos, images, and thumbnails in ${siteConfig.name}.`,
  keywords: ['media library', 'video library', 'image library', 'uploaded files', 'media management', siteConfig.name],
};