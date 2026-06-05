import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Login',
  description: `Sign in to your ${siteConfig.name} account to manage your social media scheduling and analytics.`,
  keywords: ['login', 'sign in', 'account', 'authentication', siteConfig.name],
};