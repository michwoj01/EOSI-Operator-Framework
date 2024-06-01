import React, {useRef, useState} from 'react';
import GetGameSettingsForm from './forms/getGameSettingsForm/GetGameSettingsForm'
import {useNavigate} from 'react-router-dom'
import authService from '../../services/auth/AuthService'
import CreateGameForm from './forms/createGameForm/CreateGameForm'
import './Admin.css'
import GetGameLogsForm from './forms/getGameLogsForm/GetGameLogsForm'
import StartGameForm from './forms/startGameForm/StartGameForm'
import CopyGameForm from './forms/copyGameForm/copyGameForm'

enum FormType {
  CreateGame,
  GetGameSettings,
  GetGameLogs,
  StartGame,
  CopyGame,
}

const Admin = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormType | null>(null)
  const btnCreateGame = useRef<HTMLButtonElement>(null)
  const btnGetGameSettings = useRef<HTMLButtonElement>(null)
  const btnGetGameLogs = useRef<HTMLButtonElement>(null)
  const btnStartGame = useRef<HTMLButtonElement>(null)
  const btnCopyGame = useRef<HTMLButtonElement>(null)

  const handleLogOut = () => {
    authService.logout()
    navigate('/login')
  }

  return (
    <div className='admin-container'>
      <div className='admin-container-navbar'>
        <div className='admin-container-navbar-buttons'>
          <button
            ref={btnCreateGame}
            onClick={() => {
              setForm(FormType.CreateGame)
            }}
            className={`${form === FormType.CreateGame ? 'disabled' : ''}`}
            disabled={form === FormType.CreateGame}
          >
            Create Game
          </button>
          <button
            ref={btnGetGameSettings}
            onClick={() => {
              setForm(FormType.GetGameSettings)
            }}
            className={`${form === FormType.GetGameSettings ? 'disabled' : ''}`}
            disabled={form === FormType.GetGameSettings}
          >
            Get Game Settings
          </button>
          <button
            ref={btnGetGameLogs}
            onClick={() => {
              setForm(FormType.GetGameLogs)
            }}
            className={`${form === FormType.GetGameLogs ? 'disabled' : ''}`}
            disabled={form === FormType.GetGameLogs}
          >
            Get Game Logs
          </button>
          <button
            ref={btnStartGame}
            onClick={() => {
              setForm(FormType.StartGame)
            }}
            className={`${form === FormType.StartGame ? 'disabled' : ''}`}
            disabled={form === FormType.StartGame}
          >
            Start Game
          </button>
          <button
            ref={btnCopyGame}
            onClick={() => {
              setForm(FormType.CopyGame)
            }}
            className={`${form === FormType.CopyGame ? 'disabled' : ''}`}
            disabled={form === FormType.CopyGame}
          >
            Copy Game
          </button>
        </div>
        <div className='admin-container-navbar-buttons'>
          <button
            onClick={() => {
              navigate('/')
            }}
          >
            Home
          </button>
          <button
            onClick={() => {
              handleLogOut()
            }}
          >
            Log Out
          </button>
        </div>
      </div>
      <div className='admin-container-form'>
        {form === FormType.CreateGame && <CreateGameForm />}
        {form === FormType.GetGameSettings && <GetGameSettingsForm />}
        {form === FormType.GetGameLogs && <GetGameLogsForm />}
        {form === FormType.StartGame && <StartGameForm />}
        {form === FormType.CopyGame && <CopyGameForm />}
      </div>
    </div>
  )
}

export default Admin
