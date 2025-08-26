import { http, HttpResponse } from 'msw';

export const authHandlers = [
  // Google OAuth mock
  http.post('https://oauth2.googleapis.com/token', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
    });
  }),

  // Google User Info mock
  http.get('https://www.googleapis.com/oauth2/v2/userinfo', () => {
    return HttpResponse.json({
      id: 'google_user_123',
      email: 'user@gmail.com',
      name: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    });
  }),

  // Email sending mock (သုံးရင်)
  http.post('*/api/auth/signin/email', () => {
    return HttpResponse.json({
      message: 'Check your email for signin link',
    });
  }),
];

export const handlers = [...authHandlers];
