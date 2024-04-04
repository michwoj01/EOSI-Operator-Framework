import type { AuthResponse, AuthResponseError } from '../../apis/auth/Types'
import type { UserData } from './Types'
import { removeAuthToken, removeGameToken, setAuthToken } from '../../apis/apis'
import authAPI from '../../apis/auth/AuthAPI'

const login = async (email: string, password: string): Promise<UserData> => {
  return await authAPI
    .login({ email, password })
    .then((res: AuthResponse) => {
      const userData: UserData = {
        id: res.user.id,
        email: res.user.email,
        jwtToken: res.jwtToken,
        roles: res.roles,
      }

      setAuthToken(userData.jwtToken)

      return userData
    })
    .catch((err: AuthResponseError) => {
      throw new Error(err.message)
    })
}

const register = async (email: string, password: string): Promise<UserData> => {
  return await authAPI
    .register({ email, password })
    .then((res: AuthResponse) => {
      const userData: UserData = {
        id: res.user.id,
        email: res.user.email,
        jwtToken: res.jwtToken,
        roles: res.roles,
      }

      setAuthToken(userData.jwtToken)

      return userData
    })
    .catch((err: AuthResponseError) => {
      throw new Error(err.message)
    })
}

const logout = (): void => {
  removeAuthToken()
  removeGameToken()
}

const authService = {
  login,
  register,
  logout,
}

export default authService
