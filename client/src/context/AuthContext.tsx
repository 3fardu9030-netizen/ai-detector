import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ message: string }>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check auth state on launch
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('truthlens_access_token');
      const savedUser = localStorage.getItem('truthlens_user');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);

          // Verify profile with server to sync state
          const res = await api.get('/auth/profile');
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('truthlens_user', JSON.stringify(res.data));
          }
        } catch {
          performLogout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, []);

  const performLogout = () => {
    localStorage.removeItem('truthlens_access_token');
    localStorage.removeItem('truthlens_refresh_token');
    localStorage.removeItem('truthlens_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('truthlens_access_token', accessToken);
      localStorage.setItem('truthlens_refresh_token', refreshToken);
      localStorage.setItem('truthlens_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ message: string }> => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  };

  const verifyOtp = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email, code });
      const { accessToken, refreshToken, user: userData } = res.data;

      localStorage.setItem('truthlens_access_token', accessToken);
      localStorage.setItem('truthlens_refresh_token', refreshToken);
      localStorage.setItem('truthlens_user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email: string): Promise<void> => {
    await api.post('/auth/resend-otp', { email });
  };

  const logout = () => {
    performLogout();
  };

  const updateUser = (name: string, email: string) => {
    if (user) {
      const updatedUser = { ...user, name, email };
      setUser(updatedUser);
      localStorage.setItem('truthlens_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
