import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { decodeAuthToken, getAuthToken } from '../../apis/apis'

const AuthTokenProtectedRoute = ({
  children,
  roles,
}: {
  children: ReactElement
  roles: string[]
}) => {
  const token = getAuthToken()
  if (!token) {
    return <Navigate to='/login' replace />
  }

  const decodedToken = decodeAuthToken(token)
  if (!roles.every((role) => decodedToken.roles.includes(role))) {
    return <Navigate to='/' replace />
  }

  return children
}

export default AuthTokenProtectedRoute
