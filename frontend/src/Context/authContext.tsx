import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../Api/axios'; // Twój plik z axiosInstance
import type { JwtResponse } from '../Api/types'
import {scheduleTokenRefresh} from '../Api/axios';

interface AuthContextType {
  user: string | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Przy starcie aplikacji sprawdzamy, czy są tokeny
    const storedToken = localStorage.getItem('accessToken');
    const storedEmail = localStorage.getItem('email'); // Dodaj do loginu!
    if (storedToken && storedEmail) {
      setAccessToken(storedToken);
      setUser(storedEmail);
    }
  }, []);


const login = async (email: string, password: string) => {
	const response = await axiosInstance.post<JwtResponse>('/auth/login', { email, password });
	const { token, refreshToken, email: responseEmail } = response.data;

	localStorage.setItem('accessToken', token);
	localStorage.setItem('refreshToken', refreshToken);
	localStorage.setItem('email', responseEmail);

	setAccessToken(token);
	setUser(responseEmail);

	scheduleTokenRefresh(); // <-- TUTAJ! Timer uruchamia się od razu po loginie
};


  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout', { email: user });
    } catch (e) {
      // Ignoruj, jeśli błąd
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('email');
    setUser(null);
    setAccessToken(null);
    window.location.href = '/login'; // Przekieruj usera
  };

  // **Automatyczne wylogowanie gdy backend odrzuci refresh lub wygaśnie sesja**
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
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
