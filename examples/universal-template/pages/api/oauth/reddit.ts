import { NextApiRequest, NextApiResponse } from 'next';
import { RedditOAuthConfig, createRedditOAuth } from "@microfox/reddit-oauth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;

  if (!code) {
    return res.redirect('/?error=Authorization code is required');
  }

  try {
    // Create OAuth config
    const oauthConfig: RedditOAuthConfig = {
      clientId: process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID || '',
      clientSecret: process.env.NEXT_PUBLIC_REDDIT_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_REDDIT_REDIRECT_URI || '',
      scopes: process.env.NEXT_PUBLIC_REDDIT_SCOPE?.split(',') || [],
    };

    // Initialize OAuth SDK
    const oauthSdk = createRedditOAuth(oauthConfig);
    
    // Exchange code for tokens
    const tokens = await oauthSdk.getAccessToken(code as string);
    console.log(tokens);

    if (!tokens) {
      return res.redirect('/?error=Failed to exchange code for tokens');
    }

    // Return HTML that sets tokens in localStorage and redirects
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <script>
            // Store tokens in localStorage
            localStorage.setItem('reddit_access_token', '${tokens.access_token}');
            ${tokens.refresh_token ? `localStorage.setItem('reddit_refresh_token', '${tokens.refresh_token}');` : ''}
            
            // Redirect to home page
            window.location.href = '/reddit';
          </script>
        </head>
        <body>
          <p>Authenticating with Reddit...</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.redirect(`/?error=Failed to exchange token: ${encodeURIComponent(errorMessage)}`);
  }
} 