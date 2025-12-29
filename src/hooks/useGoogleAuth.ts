'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { getUserInfo } from '@/lib/google-api';
import type { TokenClient, TokenResponse } from '@/types/google';

// Replace with your Google Cloud OAuth Client ID
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
].join(' ');

export function useGoogleAuth() {
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const { setAuth, clearAuth, isAuthenticated, accessToken, user, isTokenValid } = useAuthStore();

  // Load Google Identity Services script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setIsGsiLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Initialize token client when GSI is loaded
  useEffect(() => {
    if (!isGsiLoaded || !window.google || !GOOGLE_CLIENT_ID) return;

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response: TokenResponse) => {
        if (response.error) {
          console.error('Auth error:', response.error_description);
          return;
        }

        try {
          const userInfo = await getUserInfo(response.access_token);
          setAuth(response.access_token, response.expires_in, userInfo);
        } catch (error) {
          console.error('Failed to get user info:', error);
        }
      },
      error_callback: (error) => {
        console.error('Token client error:', error);
      },
    });

    setTokenClient(client);
  }, [isGsiLoaded, setAuth]);

  const login = useCallback(() => {
    if (!tokenClient) {
      console.error('Google Identity Services not initialized');
      return;
    }
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }, [tokenClient]);

  const logout = useCallback(() => {
    if (accessToken && window.google) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        clearAuth();
      });
    } else {
      clearAuth();
    }
  }, [accessToken, clearAuth]);

  const refreshToken = useCallback(() => {
    if (!tokenClient) return;
    tokenClient.requestAccessToken({ prompt: '' });
  }, [tokenClient]);

  // Check token validity on mount
  useEffect(() => {
    if (isAuthenticated && !isTokenValid()) {
      // Token expired, try silent refresh
      if (tokenClient) {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    }
  }, [isAuthenticated, isTokenValid, tokenClient]);

  return {
    login,
    logout,
    refreshToken,
    isAuthenticated,
    isReady: isGsiLoaded && !!tokenClient,
    user,
    accessToken,
    isTokenValid,
  };
}

