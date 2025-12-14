import { auth } from '@clerk/nextjs/server';

/**
 * Gets the Google OAuth token from Clerk for the current user
 * This token can be used as a bearer token for Google Workspace MCP
 * 
 * Note: You need to configure a JWT template in Clerk Dashboard:
 * 1. Go to JWT Templates
 * 2. Create a new template named "google_workspace"
 * 3. Add Google as the OAuth provider
 * 4. The token will be the Google OAuth access token
 */
export async function getGoogleToken(): Promise<string | null> {
  try {
    const { getToken } = await auth();
    
    // Request Google OAuth token from Clerk
    // The template name should match what you configure in Clerk dashboard
    const token = await getToken({ 
      template: 'google_workspace',
    });
    
    return token;
  } catch (error) {
    console.error('Failed to get Google token:', error);
    return null;
  }
}

/**
 * Client-side version for use in React components
 */
export async function getGoogleTokenClient(): Promise<string | null> {
  try {
    const { useAuth } = await import('@clerk/nextjs');
    // This would need to be used in a client component
    // For server-side usage, use getGoogleToken() instead
    return null;
  } catch (error) {
    console.error('Failed to get Google token:', error);
    return null;
  }
}

