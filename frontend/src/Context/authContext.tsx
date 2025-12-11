import React, { createContext, useContext, useEffect, useState } from 'react'
import axiosInstance from '../Api/axios'
import { getCookie, deleteCookie } from '../utils/cookies'

interface AuthContextType {
	user: string | null
	accessToken: string | null
	login: (email: string, password: string) => Promise<void>
	verifyAccount: (email: string, code: string) => Promise<void>
	loginWithGoogle: (email: string) => void
	logout: () => void
	isAuthenticated: boolean
	isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => useContext(AuthContext)!

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<string | null>(null)
	const [accessToken, setAccessToken] = useState<string | null>(null)

	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const response = await axiosInstance.get<{ email: string }>('/auth/user')
				setUser(response.data.email || null)
			} catch (error) {
				console.log('Brak aktywnej sesji')
				setUser(null)
			} finally {
				setIsLoading(false)
				setAccessToken(null)
			}
		}
		checkAuth()
	}, [])

	const login = async (email: string, password: string) => {
		const response = await axiosInstance.post<{ email: string }>('/auth/login', { email, password })
		const responseEmail = response.data.email

		setTimeout(() => {
			const cookieEmail = getCookie('email') || responseEmail
			if (cookieEmail) {
				setUser(cookieEmail)
				setAccessToken(null)
			}
		}, 100)
	}

	const verifyAccount = async (email: string, code: string) => {
		await axiosInstance.post('/auth/verify', { email, code })
	}

	const loginWithGoogle = (email: string) => {
		setUser(email)
		setAccessToken(null)
	}

	const logout = async () => {
		try {
			await axiosInstance.post('/auth/logout', { email: user })
		} catch (e) {}
		deleteCookie('accessToken')
		deleteCookie('refreshToken')
		deleteCookie('email')
		setUser(null)
		setAccessToken(null)
		if (window.location.pathname !== '/login') {
			window.location.href = '/login'
		}
	}

	// USUNĄŁEM STĄD CAŁY useEffect Z INTERCEPTOREM!
	// To axios.ts zarządza cyklem życia tokena, nie Context.

	return (
		<AuthContext.Provider
			value={{
				user,
				accessToken,
				login,
				verifyAccount,
				loginWithGoogle,
				logout,
				isLoading,
				isAuthenticated: !!user,
			}}>
			{children}
		</AuthContext.Provider>
	)
}
