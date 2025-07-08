import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { JwtResponse } from './types'

const axiosInstance: AxiosInstance = axios.create({
	baseURL: 'http://localhost:8080/api', // Ensure consistent base URL
	headers: {
		'Content-Type': 'application/json',
	},
})

// Funkcja do parsowania access tokena (JWT)
function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

// Globalna zmienna do timeoutu
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

// Funkcja do ustawiania automatycznego odświeżania
export function scheduleTokenRefresh() {
    if (refreshTimeout) clearTimeout(refreshTimeout);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const payload = parseJwt(accessToken);
    if (!payload?.exp) return;

    const expTime = payload.exp * 1000;
    const now = Date.now();
    const oneMinute = 60 * 1000;

    const timeUntilRefresh = expTime - now - oneMinute;

    if (timeUntilRefresh <= 0) {
        refreshToken().then(() => scheduleTokenRefresh());
    } else {
        refreshTimeout = setTimeout(async () => {
            await refreshToken();
            scheduleTokenRefresh();
        }, timeUntilRefresh);
    }
}


const refreshToken = async (): Promise<string> => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
        throw new Error('Brak refresh tokena');
    }

    try {
        const response = await axios.post<JwtResponse>(
            'http://localhost:8080/api/auth/refreshToken',
            { refreshToken: storedRefreshToken }
        );
        const newAccessToken = response.data.token;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Wywołanie scheduleTokenRefresh za KAŻDYM razem, gdy masz nowy accessToken:
        scheduleTokenRefresh();

        return newAccessToken;
    } catch (error) {
        console.error('Błąd odświeżania tokena:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw error;
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
