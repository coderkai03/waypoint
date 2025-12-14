import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Gets the Google OAuth access token from Clerk for the current user
 * This token can be used as a bearer token for Google Workspace MCP
 * 
 * Note: The user must have signed in with Google OAuth for this to work.
 * The token is retrieved from the user's external account connection.
 */
export async function getGoogleToken(): Promise<string | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.warn('No user ID found. User must be authenticated.');
      return null;
    }
    
    // Get the Clerk client instance
    const client = await clerkClient();
    
    // First, check if user has a Google external account
    try {
      const user = await client.users.getUser(userId);
      const hasGoogleAccount = user.externalAccounts?.some(
        (account) => account.provider === 'oauth_google' || account.provider === 'google'
      );
      
      if (!hasGoogleAccount) {
        console.warn('User does not have a Google OAuth account connected. Please sign in with Google.');
        return null;
      }
    } catch (userError) {
      console.warn('Could not check user external accounts:', userError);
      // Continue anyway, try to get token
    }
    
    // Retrieve Google OAuth access token for the user
    // Try both 'google' and 'oauth_google' as provider names
    let response;
    try {
      response = await client.users.getUserOauthAccessToken(userId, 'google');
    } catch (error: any) {
      // If 'google' fails, try 'oauth_google'
      if (error?.status === 400 || error?.status === 404) {
        try {
          response = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
        } catch (error2) {
          console.error('Failed to get Google token with both provider names:', error2);
          return null;
        }
      } else {
        throw error;
      }
    }
    
    // The response is an array of OAuth access tokens
    // Get the first (most recent) token
    if (response && response.data && response.data.length > 0) {
      const accessToken = response.data[0].token;
      if (accessToken) {
        return accessToken;
      }
    }
    
    console.warn('No Google OAuth access token found in response.');
    return null;
  } catch (error: any) {
    // Handle specific Clerk errors
    if (error?.status === 400) {
      console.error('Bad Request - User may not have Google OAuth connected:', error.message);
    } else if (error?.status === 404) {
      console.error('Not Found - Google OAuth provider may not be enabled:', error.message);
    } else {
      console.error('Failed to get Google token:', error);
    }
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

