import { redirect } from 'next/navigation';
import { auth } from '@/auth';

// ============================================
// Homepage - Redirect based on auth status
// ============================================

export default async function HomePage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  if (!session.user?.approved) {
    redirect('/pending');
  }
  
  redirect('/dashboard');
}
