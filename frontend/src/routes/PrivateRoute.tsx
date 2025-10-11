// src/routes/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../Context/authContext'
import type { ReactElement } from 'react'

export default function PrivateRoute({ children }: { children: ReactElement }) {
    const { isAuthenticated } = useAuth()
    const location = useLocation() // bez ręcznego : Location<any>

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }
    return children
}
