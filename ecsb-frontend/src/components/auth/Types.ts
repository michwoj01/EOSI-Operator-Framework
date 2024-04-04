export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface User {
  loginUserDTO: {
    id: number
    email: string
  }
  roles: string[]
  jwtToken: string
}

export const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
}
