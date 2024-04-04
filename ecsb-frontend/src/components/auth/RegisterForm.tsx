import { useState } from 'react'
import type React from 'react'
import { validateConfirmPassword, validateEmail, validatePassword } from './Validation'
import type { RegisterFormData } from './Types'
import { Link, useNavigate } from 'react-router-dom'
import type { NavigateFunction } from 'react-router-dom'
import authService from '../../services/auth/AuthService'
import type { UserData } from '../../services/auth/Types'
import './Form.css'

const RegisterForm = () => {
  const navigate: NavigateFunction = useNavigate()

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})
  const [registerStatus, setRegisterStatus] = useState<string>('')

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
    setErrors((prevState) => ({
      ...prevState,
      [name]: undefined,
    }))
    setRegisterStatus('')
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateFormData(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    authService.register(formData.email, formData.password).then(
      (response: UserData) => {
        navigate('/')
      },
      (error: Error) => {
        setRegisterStatus(error.message)
      },
    )
  }

  const validateFormData = (data: RegisterFormData) => {
    const errors: Partial<RegisterFormData> = {}
    if (!validateEmail(data.email)) {
      errors.email = 'Invalid email format'
    }
    if (!validatePassword(data.password)) {
      errors.password = 'Password must be at least 6 characters long'
    }
    if (!validateConfirmPassword(data.password, data.confirmPassword)) {
      errors.confirmPassword = 'Passwords are not same'
    }
    return errors
  }

  return (
    <div className='auth-form-container md:col-span-4'>
      <form className='auth-form' onSubmit={handleSubmit}>
        <label htmlFor='email'>Email:</label>
        <input
          type='email'
          id='email'
          name='email'
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        {errors.email && <span className='auth-error'>{errors.email}</span>}
        <label htmlFor='password'>Password:</label>
        <input
          type='password'
          id='password'
          name='password'
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {errors.password && <span className='auth-error'>{errors.password}</span>}
        <label htmlFor='confirm-password'>Confirm Password:</label>
        <input
          type='password'
          id='confirm-password'
          name='confirmPassword'
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        {errors.confirmPassword && <span className='auth-error'>{errors.confirmPassword}</span>}
        {registerStatus !== '' && registerStatus !== 'success' && (
          <span className='auth-error'>{registerStatus}</span>
        )}
        <button className='auth-btn-submit' type='submit'>
          Register
        </button>
      </form>
      <p className='auth-message'>
        Already have an account?{' '}
        <Link className='link' to='/login'>
          Login
        </Link>
      </p>
    </div>
  )
}

export default RegisterForm
