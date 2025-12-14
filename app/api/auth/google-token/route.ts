import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    // Get the Clerk client instance
    const client = await clerkClient();
    
    // First, check if user has a Google external account
    try {
      const user = await client.users.getUser(userId);
      const externalAccounts = user.externalAccounts || [];
      const hasGoogleAccount = externalAccounts.some(
        (account) => account.provider === 'oauth_google' || account.provider === 'google'
      );
      
      // Log available providers for debugging
      const providers = externalAccounts.map(acc => acc.provider);
      console.log(`[Google Token] User has ${externalAccounts.length} external account(s):`, providers);
      
      if (!hasGoogleAccount) {
        return NextResponse.json(
          { 
            error: 'No Google account connected',
            hint: 'Please sign in with Google OAuth to connect your Google account. You can do this by signing out and signing back in with Google, or by connecting Google in your account settings.',
            availableProviders: providers
          },
          { status: 400 }
        );
      }
    } catch (userError) {
      console.warn('Could not check user external accounts:', userError);
      // Continue anyway, try to get token
    }
    
    // Retrieve Google OAuth access token for the user
    // Try both 'google' and 'oauth_google' as provider names
    let response;
    let providerUsed = 'google';
    try {
      response = await client.users.getUserOauthAccessToken(userId, 'google');
    } catch (error: any) {
      // If 'google' fails, try 'oauth_google'
      if (error?.status === 400 || error?.status === 404) {
        try {
          providerUsed = 'oauth_google';
          response = await client.users.getUserOauthAccessToken(userId, 'oauth_google');
        } catch (error2: any) {
          return NextResponse.json(
            { 
              error: 'Failed to get Google OAuth token',
              details: error2?.message || 'Could not retrieve token with either provider name',
              hint: 'Make sure Google OAuth is enabled in your Clerk dashboard and you have signed in with Google.'
            },
            { status: error2?.status || 500 }
          );
        }
      } else {
        throw error;
      }
    }
    
    // The response is an array of OAuth access tokens
    // Get the first (most recent) token
    if (response && response.data && response.data.length > 0) {
      const token = response.data[0].token;
      if (token) {
        return NextResponse.json({ token });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'No Google token available',
        hint: 'Token was retrieved but is empty. You may need to reconnect your Google account.'
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Failed to get Google token:', error);
    
    // Handle specific error cases
    if (error?.status === 400) {
      return NextResponse.json(
        { 
          error: 'Bad Request - Google OAuth not connected',
          details: error.message,
          hint: 'Please sign in with Google OAuth to connect your account.'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to get Google token', 
        details: error instanceof Error ? error.message : 'Unknown error',
        status: error?.status || 500
      },
      { status: error?.status || 500 }
    );
  }
}

