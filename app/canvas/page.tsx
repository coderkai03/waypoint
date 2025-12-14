import { FlowCanvas } from '@/components/flow/FlowCanvas';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CanvasPage() {
  // Only check auth if Clerk is configured
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    try {
      const { userId } = await auth();
      
      if (!userId) {
        redirect('/');
      }
    } catch (error) {
      // If auth check fails, still render (for development)
      console.warn('Auth check failed:', error);
    }
  }

  return <FlowCanvas />;
}

