import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// ============================================
// Homepage - Redirect to Dashboard
// ============================================

export const metadata: Metadata = {
  title: 'SMST - Social Media Scheduling Tool',
  description: 'Schedule, publish, and analyze content across TikTok, Facebook, Instagram, and YouTube. Streamline your social media workflow with powerful scheduling and analytics tools.',
};

export default function HomePage() {
  redirect('/dashboard');
}
