import { redirect } from 'next/navigation';

// ============================================
// Homepage - Redirect to Dashboard
// ============================================

export default function HomePage() {
  redirect('/dashboard');
}
