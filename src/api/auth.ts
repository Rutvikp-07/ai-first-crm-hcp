import axiosInstance from './axios';

export const authApi = {
  login: async (email: string, password: string) => {
    // Backend OAuth2PasswordRequestForm expects URL-encoded form data
    const params = new URLSearchParams();
    params.append('username', email);
    params.append('password', password);

    const response = await axiosInstance.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data; // Expects { access_token: string, token_type: string }
  },

  register: async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
