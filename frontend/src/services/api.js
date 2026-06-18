import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://ai-stock-backend-25oq.onrender.com/api',

  timeout: 30000, // increase timeout

  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');

    if (user) {
      const parsedUser = JSON.parse(user);

      config.headers.Authorization =
        `Bearer mock-jwt-token-for-${parsedUser.email}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');

      // Prevent redirect loops if the user is already on a public/guest page
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      const publicPaths = ['/login', '/register', '/forgot-password', '/'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;