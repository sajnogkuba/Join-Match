import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

const axiosInstance: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	withCredentials: true,
})

let isRefreshing = false
let failedQueue: any[] = []

let disconnectWebSocket: (() => void) | null = null

export function setDisconnectWebSocket(disconnectFn: () => void) {
	disconnectWebSocket = disconnectFn
}

const processQueue = (error: any, token: any = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error)
		} else {
			prom.resolve(token)
		}
	})
	failedQueue = []
}

const refreshToken = async (): Promise<void> => {
	try {
		await axiosInstance.post('/auth/refreshToken')
	} catch (error) {
		console.error('Błąd wewnątrz funkcji refreshToken:', error)
		throw error
	}
}

const publicEndpoints = [
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
	'/notifications',
]

const isPublicEndpoint = (url: string | undefined): boolean => {
	if (!url) return false
	const path = url.replace(import.meta.env.VITE_API_URL || '', '')
	const isPublic = publicEndpoints.some(endpoint => path.startsWith(endpoint))

	const isProtected =
		path.includes('/auth/user/details') ||
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

// axios.ts
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refreshToken')) {
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => axiosInstance(originalRequest))
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/refreshToken`, {}, { withCredentials: true });
            
            isRefreshing = false;
            processQueue(null); 
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError);
            window.location.href = '/login'; 
            return Promise.reject(refreshError);
        }
    }
);

export default axiosInstance
