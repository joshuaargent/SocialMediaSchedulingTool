import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Read the ${siteConfig.name} Privacy Policy. Learn how we collect, use, and protect your personal data under GDPR and UK GDPR.`,
  keywords: ['privacy policy', 'data protection', 'GDPR', 'UK GDPR', 'personal data', siteConfig.name],
};