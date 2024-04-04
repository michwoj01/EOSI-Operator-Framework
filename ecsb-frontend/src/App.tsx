import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Game from './components/game/Game'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import Home from './components/home/Home'
import AuthTokenProtectedRoute from './components/protectedRoutes/AuthTokenProtectedRoute'
import NoAuthTokenProtectedRoute from './components/protectedRoutes/NoAuthTokenProtectedRoute'
import GameTokenProtectedRoute from './components/protectedRoutes/GameTokenProtectedRoute'
import './App.css'
import Admin from './components/admin/Admin'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />
        <Route path='/login' element={<NoAuthTokenProtectedRoute children={<LoginForm />} />} />
        <Route
          path='/register'
          element={<NoAuthTokenProtectedRoute children={<RegisterForm />} />}
        />
        <Route
          path='/home'
          element={<AuthTokenProtectedRoute children={<Home />} roles={['USER']} />}
        />
        <Route
          path='/admin'
          element={<AuthTokenProtectedRoute children={<Admin />} roles={['ADMIN']} />}
        />
        <Route
          path='/game/:gameId'
          element={
            <AuthTokenProtectedRoute
              children={<GameTokenProtectedRoute children={<Game />} roles={['USER']} />}
              roles={['USER']}
            />
          }
        />
        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
      <ToastContainer
        toastStyle={{
          clipPath:
            'polygon(3.05% 90.00%,24.63% 92.01%,27.36% 88.02%,30.45% 93.05%,39.53% 93.09%,54.54% 95.18%,72.51% 95.37%,91.71% 94.74%,94.61% 93.11%,96.73% 91.49%,97.29% 88.24%,98.11% 82.00%,98.40% 64.77%,97.93% 49.30%,97.51% 29.37%,96.68% 9.50%,89.40% 9.64%,82.38% 8.28%,75.41% 7.56%,72.98% 14.11%,70.73% 7.23%,61.53% 6.45%,49.95% 5.90%,41.43% 4.81%,31.72% 5.61%,21.73% 5.22%,13.26% 5.44%,7.33% 6.88%,4.36% 7.76%,2.44% 11.26%,1.58% 18.28%,0.98% 27.79%,0.91% 39.31%,1.09% 51.32%,1.59% 62.10%,2.09% 76.88%)',
          backgroundColor: '#E3C296',
          color: 'black',
          boxShadow: '-4px 4px 4px rgba(0, 0, 0, 0.25)',
          textAlign: 'center',
          fontFamily: 'Rowdies',
          fontSize: '1.2rem',
          bottom: '5.8rem',
        }}
      />
    </BrowserRouter>
  )
}

export default App
