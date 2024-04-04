import type { ReactElement } from 'react'
import { Navigate } from 'react-router'
import { getAuthToken } from '../../apis/apis'

const NoAuthTokenProtectedRoute = ({ children }: { children: ReactElement }) => {
  const token = getAuthToken()
  if (token) {
    return <Navigate to='/' replace />
  }

  return children
}

export default NoAuthTokenProtectedRoute
