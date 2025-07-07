import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { JwtResponse } from './types'

const axiosInstance: AxiosInstance = axios.create({
	baseURL: 'http://localhost:8080/api', // Ensure consistent base URL
	headers: {
		'Content-Type': 'application/json',
	},
})


// Funkcja do odświeżenia tokena
const refreshToken = async (): Promise<string> => {
	const storedRefreshToken = localStorage.getItem('refreshToken') // Avoid shadowing
	if (!storedRefreshToken) {
		throw new Error('Brak refresh tokena')
	}

	try {
		const response = await axios.post<JwtResponse>(
			'http://localhost:8080/api/auth/refreshToken', // Match base URL
			{ refreshToken: storedRefreshToken }
		)
		const newAccessToken = response.data.token
		const newRefreshToken = response.data.refreshToken

		localStorage.setItem('accessToken', newAccessToken)
		localStorage.setItem('refreshToken', newRefreshToken)
		return newAccessToken
	} catch (error) {
		console.error('Błąd odświeżania tokena:', error)
		localStorage.removeItem('accessToken') // Clear tokens on failure
		localStorage.removeItem('refreshToken')
		throw error
	}
}

// Request Interceptor: dodaj token do każdego zapytania
axiosInstance.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const accessToken = localStorage.getItem('accessToken')
		if (accessToken && config.headers) {
			config.headers.Authorization = `Bearer ${accessToken}`
		}
		return config
	},
	error => Promise.reject(error)
)

// Response Interceptor: obsługa 401
axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true

			try {
				const newAccessToken = await refreshToken()
				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
				}
				return axiosInstance(originalRequest)
			} catch (refreshError) {
				console.error('Błąd podczas ponownego logowania:', refreshError) // Improved error logging
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.location.href = '/login'
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export default axiosInstance
