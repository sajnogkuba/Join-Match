import React, { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../Api/axios';

interface AuthContextType {
    user: string | null;
    login: (email: string, password: string) => Promise<void>;
    verifyAccount: (email: string, code: string) => Promise<void>;
    loginWithGoogle: (email: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext)!;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Automatyczne sprawdzanie sesji przy starcie aplikacji
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Interceptor sam spróbuje odświeżyć token, jeśli wygasł
                const response = await axiosInstance.get<{ email: string }>('/auth/user');
                setUser(response.data.email || null);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Pingowanie sesji co 10 min, żeby nie wygasła w trakcie bezczynności
    useEffect(() => {
        if (!user) return;

        const REFRESH_INTERVAL_MS = 10 * 60 * 1000;
        const pingSession = () => {
            axiosInstance.get('/auth/user').catch(() => {});
        };

        const intervalId = window.setInterval(pingSession, REFRESH_INTERVAL_MS);
        const onFocus = () => pingSession();

        window.addEventListener('focus', onFocus);
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', onFocus);
        };
    }, [user]);

    const login = async (email: string, password: string) => {
        const response = await axiosInstance.post<{ email: string }>('/auth/login', { email, password });
        setUser(response.data.email);
    };

    const verifyAccount = async (email: string, code: string) => {
        await axiosInstance.post('/auth/verify', { email, code });
    };

    const loginWithGoogle = (email: string) => {
        setUser(email);
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/auth/logout', { email: user });
        } catch (e) {
            console.error("Logout error", e);
        } finally {
            // Czyścimy stan niezależnie od wyniku API
            setUser(null);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                verifyAccount,
                loginWithGoogle,
                logout,
                isLoading,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};