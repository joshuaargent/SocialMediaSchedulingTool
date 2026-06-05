import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'SEO',
  description: `SEO tools and optimization features for your social media content in ${siteConfig.name}.`,
  keywords: ['SEO', 'search engine optimization', 'social media SEO', 'content optimization', siteConfig.name],
};