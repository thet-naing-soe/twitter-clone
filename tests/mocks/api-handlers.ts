import { http, HttpResponse } from 'msw';

interface LoginBody {
  username?: string;
  password?: string;
}

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({
      id: 'c7b3d8e0-5e0b-4b0f-8b3a-3b9f4b3d3b3d',
      firstName: 'John',
      lastName: 'Maverick',
    });
  }),

  http.post('/api/login', async ({ request }) => {
    const info = (await request.json()) as LoginBody;

    if (!info?.username || !info?.password) {
      return new HttpResponse('Username and password are required', { status: 400 });
    }

    if (info.username === 'testuser' && info.password === 'password') {
      return HttpResponse.json({ success: true, token: 'fake-jwt-token' });
    } else {
      return new HttpResponse('Invalid credentials', { status: 401 });
    }
  }),
];
