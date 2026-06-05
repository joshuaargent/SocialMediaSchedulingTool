import type { Metadata } from 'next';
import { siteConfig } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pending Approval',
  description: `Your account is pending approval. Please wait while we review your ${siteConfig.name} account.`,
  keywords: ['pending', 'approval', 'account', siteConfig.name],
};