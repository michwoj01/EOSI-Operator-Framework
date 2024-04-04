import type { AxiosInstance } from 'axios'
import axios from 'axios'
import jwt_decode from 'jwt-decode'

const AUTH_AND_MENAGEMENT_API_URL: string = import.meta.env
  .VITE_ECSB_HTTP_AUTH_AND_MENAGEMENT_API_URL
const SELF_INTERACTIONS_API_URL: string = import.meta.env.VITE_ECSB_HTTP_SELF_INTERACTIONS_API_URL
const AUTH_TOKEN_KEY = 'auth-token'
const GAME_TOKEN_KEY = 'game-token'

export interface AuthTokenData {
  name: string
  roles: string[]
  id: number
}

export interface GameTokenData {
  exp: number
  loginUserId: number
  playerId: string
  roles: string[]
  gameSessionId: number
}

export const getAuthToken = (): string | null => localStorage.getItem(AUTH_TOKEN_KEY)

export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  authTokenAuthAndMenagementAPI.defaults.headers.Authorization = `Bearer ${token}`
}

export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  delete authTokenAuthAndMenagementAPI.defaults.headers.Authorization
}

export const decodeAuthToken = (token: string): AuthTokenData => {
  return jwt_decode(token)
}

export const getGameToken = (): string | null => localStorage.getItem(GAME_TOKEN_KEY)

export const setGameToken = (token: string): void => {
  localStorage.setItem(GAME_TOKEN_KEY, token)
  gameTokenAPI.defaults.headers.Authorization = `Bearer ${token}`
  gameTokenSelfInteractionsAPI.defaults.headers.Authorization = `Bearer ${token}`
}

export const removeGameToken = (): void => {
  localStorage.removeItem(GAME_TOKEN_KEY)
  delete gameTokenAPI.defaults.headers.Authorization
  delete gameTokenSelfInteractionsAPI.defaults.headers.Authorization
}

export const decodeGameToken = (token: string): GameTokenData => {
  return jwt_decode(token)
}

export const authTokenAuthAndMenagementAPI: AxiosInstance = axios.create({
  baseURL: AUTH_AND_MENAGEMENT_API_URL,
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${getAuthToken()}` || '',
  },
})

export const gameTokenSelfInteractionsAPI: AxiosInstance = axios.create({
  baseURL: SELF_INTERACTIONS_API_URL,
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${getGameToken()}` || '',
  },
})

export const gameTokenAPI: AxiosInstance = axios.create({
  baseURL: AUTH_AND_MENAGEMENT_API_URL,
  headers: {
    'Content-type': 'application/json',
    Authorization: `Bearer ${getGameToken()}` || '',
  },
})
