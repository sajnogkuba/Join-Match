// src/routes/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Context/authContext'
import type { ReactElement } from 'react'

export default function PrivateRoute({ children }: { children: ReactElement }) {
	const { isAuthenticated, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) {
		return <div className='min-h-screen bg-gray-900 text-white flex items-center justify-center'>Ładowanie...</div>
	}

	if (!isAuthenticated) {
		return <Navigate to='/login' replace state={{ from: location }} />
	}
	return children
}
