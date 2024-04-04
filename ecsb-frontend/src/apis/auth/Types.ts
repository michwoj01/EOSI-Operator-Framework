export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  jwtToken: string
  roles: string[]
  user: {
    id: number
    email: string
  }
}

/**
  AuthResponseError represents an error from the server.
  Code is 0 if the error is not from the server.
*/
export class AuthResponseError extends Error {
  public constructor(public code: number, public message: string) {
    super(message)
  }
}
