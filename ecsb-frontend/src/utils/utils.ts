import jwt_decode from 'jwt-decode'

export const isTokenExpired = (token: string): boolean => {
  const decodedToken: { exp: number } = jwt_decode(token)

  return !decodedToken.exp || decodedToken.exp < Date.now() / 1000
}

export const isNumber = (value: string): boolean => {
  return !isNaN(Number(value))
}
