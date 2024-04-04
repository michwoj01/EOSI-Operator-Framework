const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email)
}

// At least 6 chatacters longs
export const validatePassword = (password: string): boolean => {
  return password.length >= MIN_PASSWORD_LENGTH
}

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}
