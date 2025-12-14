import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { getToken, userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // Get Google OAuth token from Clerk
    // The template name should match what you configure in Clerk dashboard
    // If template doesn't exist, try getting the OAuth token directly
    let token = await getToken({ template: 'google_workspace' });
    
    // Fallback: try to get token from OAuth session
    if (!token) {
      // Try alternative method - get session token
      const sessionToken = await getToken();
      token = sessionToken;
    }
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'No Google token available. Please connect your Google account in Clerk settings.',
          hint: 'Make sure you have signed in with Google and configured a JWT template named "google_workspace" in Clerk Dashboard.'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Failed to get Google token:', error);
    return NextResponse.json(
      { error: 'Failed to get Google token', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

