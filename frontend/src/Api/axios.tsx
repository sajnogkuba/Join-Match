import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

let disconnectWebSocket: (() => void) | null = null;

export function setDisconnectWebSocket(disconnectFn: () => void) {
    disconnectWebSocket = disconnectFn;
}

const refreshToken = async (): Promise<void> => {
    try {
        await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/auth/refreshToken`,
            {},
            { withCredentials: true }
        );
    } catch (error) {
        console.error('Błąd odświeżania tokena:', error);
        const currentPath = window.location.pathname
        const publicPaths = ['/login', '/register', '/', '/events', '/teams', '/about', '/kontakt', '/faq', '/privacy', '/terms']
        if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/event/') && !currentPath.startsWith('/team/') && !currentPath.startsWith('/post/') && !currentPath.startsWith('/profile/')) {
            window.location.href = '/login'
        }
        throw error;
    }
}

const publicEndpoints = [
	'/auth/user',
	'/auth/login',
	'/auth/register',
	'/auth/verify',
	'/event',
	'/team',
	'/post',
	'/sport-type',
	'/user',
	'/badge',
	'/friends',
	'/user-event',
	'/user-saved-event',
	'/ratings',
	'/rankings',
	'/conversations',
	'/notifications'
]

const isPublicEndpoint = (url: string | undefined): boolean => {
	if (!url) return false
	const path = url.replace(import.meta.env.VITE_API_URL || '', '')
	const isPublic = publicEndpoints.some(endpoint => path.startsWith(endpoint))
	const isProtected = path.includes('/auth/user/details') || 
	                   path.includes('/auth/changePass') ||
	                   path.includes('/auth/user/photo') ||
	                   path.includes('/auth/report/') ||
	                   path.includes('/team/report/') ||
	                   path.includes('/event/report/') ||
	                   path.includes('/ratings/report/') ||
	                   path.includes('/user-event/request') ||
	                   path.includes('/user-event/approve') ||
	                   path.includes('/user-event/reject') ||
	                   path.includes('/user-event/invite') ||
	                   path.includes('/user-event/invitation/') ||
	                   path.includes('/conversations/') ||
	                   path.includes('/chat/')
	return isPublic && !isProtected
}

axiosInstance.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isPublicEndpoint(originalRequest.url)) {
				return Promise.reject(error)
			}

			originalRequest._retry = true

			try {
				await refreshToken()
				return axiosInstance(originalRequest)
			} catch (refreshError) {
				console.error('Błąd podczas ponownego logowania:', refreshError);
				if (disconnectWebSocket) {
					disconnectWebSocket();
				}
				const currentPath = window.location.pathname
				const publicPaths = ['/login', '/register', '/', '/events', '/teams', '/about', '/kontakt', '/faq', '/privacy', '/terms']
				if (!publicPaths.includes(currentPath) && !currentPath.startsWith('/event/') && !currentPath.startsWith('/team/') && !currentPath.startsWith('/post/') && !currentPath.startsWith('/profile/')) {
					window.location.href = '/login'
				}
				return Promise.reject(refreshError)
			}
		}

		return Promise.reject(error)
	}
)

export default axiosInstance
