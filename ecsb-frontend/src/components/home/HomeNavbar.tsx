import React from 'react';
import {useNavigate} from 'react-router'
import {decodeAuthToken, getAuthToken} from '../../apis/apis'
import './HomeNavbar.css'
import authService from '../../services/auth/AuthService'

const HomeNavbar = () => {
  const navigate = useNavigate()

  const authToken = getAuthToken()
  if (!authToken) {
    return null
  }

  const isAdmin = decodeAuthToken(authToken).roles.includes('ADMIN')

  const handleAdminClick = () => {
    navigate('/admin')
  }

  const handleLogOut = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className='home-navbar'>
      {isAdmin && (
        <button className='home-navbar-btn' onClick={handleAdminClick}>
          Admin Panel
        </button>
      )}
      <button className='home-navbar-btn' onClick={handleLogOut}>
        Log Out
      </button>
    </div>
  )
}

export default HomeNavbar
