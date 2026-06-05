import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: `Read the ${siteConfig.name} Terms and Conditions. Understand the terms of service for using our social media scheduling platform.`,
  keywords: ['terms and conditions', 'terms of service', 'TOS', 'legal', siteConfig.name],
};