import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../Api/axios';
import {scheduleTokenRefresh} from '../Api/axios';
import { getCookie, deleteCookie } from '../utils/cookies';

interface AuthContextType {
  user: string | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = getCookie('accessToken');
    const storedEmail = getCookie('email');
    if (storedToken && storedEmail) {
      setAccessToken(storedToken);
      setUser(storedEmail);
    }
  }, []);


const login = async (email: string, password: string) => {
	const response = await axiosInstance.post<{ email: string }>('/auth/login', { email, password });
	const responseEmail = response.data.email;
	
	setTimeout(() => {
		const accessToken = getCookie('accessToken');
		const cookieEmail = getCookie('email') || responseEmail;
		if (accessToken && cookieEmail) {
			setAccessToken(accessToken);
			setUser(cookieEmail);
			scheduleTokenRefresh();
		}
	}, 100);
};

const loginWithGoogle = (email: string) => {
  const accessToken = getCookie('accessToken');
  if (accessToken) {
    setAccessToken(accessToken);
    setUser(email);
    scheduleTokenRefresh();
  }
};



  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout', { email: user });
    } catch (e) {
    }
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('email');
    setUser(null);
    setAccessToken(null);
    window.location.href = '/login';
  };

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      resp => resp,
      err => {
        if (err.response?.status === 401) {
          logout();
        }
        return Promise.reject(err);
      }
    );
    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
