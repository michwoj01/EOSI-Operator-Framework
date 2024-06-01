import React, {useRef, useState} from 'react';
import type {NavigateFunction} from 'react-router'
import {useNavigate} from 'react-router'
import gameService from '../../services/game/GameService'
import {getAuthToken, getGameToken} from '../../apis/apis'
import './Home.css'
import HomeNavbar from './HomeNavbar'
import {useGameStore} from '../../store/GameStore'
import {startGame} from '../../Game/Game'
import LoadingSpinner from '../common/spinner/LoadingSpinner'

const Home = () => {
  const navigate: NavigateFunction = useNavigate()

  const { setGameData } = useGameStore()
  const [gameCode, setGameCode] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [usernameError, setUsernameError] = useState<string>('')
  const [gameCodeError, setGameCodeError] = useState<string>('')
  const submitBtnRef = useRef<HTMLButtonElement | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleGameCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const gameCode = event.target.value
    setGameCode(gameCode)

    if (gameCode.length !== 6) {
      setGameCodeError('Game code must be 6 characters long')
    } else {
      setGameCodeError('')
    }
    setError('')
  }

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const username = event.target.value
    setUsername(username)

    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long')
    } else {
      setUsernameError('')
    }
    setError('')
  }

  const enableSubmitBtn = (): void => {
    if (submitBtnRef && submitBtnRef.current) {
      submitBtnRef.current.disabled = false
    }
  }

  const disableSubmitBtn = (): void => {
    if (submitBtnRef && submitBtnRef.current) {
      submitBtnRef.current.disabled = true
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (usernameError || gameCodeError) {
      return
    }

    setIsLoading(true)
    disableSubmitBtn()

    try {
      const authToken = getAuthToken()

      if (authToken) {
        const gameSession = await gameService.getGameSession(gameCode, username)
        const gameSettings = await gameService.getUserGameSettings()
        const gameStatus = await gameService.getUserGameStatus()

        const gameToken = getGameToken()

        if (!gameToken) {
          setError('Error getting game token')
        } else {
          const mapConfig = await gameService.getAssetConfig(gameSettings.gameAssets.mapAssetId)

          const characterURL = await gameService.getAsset(gameSettings.gameAssets.characterAssetsId)
          const resourceURL = await gameService.getAsset(gameSettings.gameAssets.resourceAssetsId)
          const tileSetURL = await gameService.getAsset(gameSettings.gameAssets.tileAssetsId)

          const gameData = startGame(
            gameToken,
            gameStatus,
            gameSettings,
            mapConfig,
            characterURL,
            resourceURL,
            tileSetURL,
          )

          setGameData(gameData)

          document.body.style.overflow = 'hidden'

          navigate(`/game/${gameSession}`)
        }
      }
    } catch (error: any) {
      setError(`Error joining game: ${error.message}`)
    } finally {
      setIsLoading(false)
      enableSubmitBtn()
    }
  }

  return (
    <>
      <div className='home-container'>
        <HomeNavbar />
        <div className='home-form-container'>
          <form className='home-form' onSubmit={handleSubmit}>
            <input
              type='text'
              id='username'
              name='username'
              placeholder='Enter username'
              value={username}
              onChange={handleUsernameChange}
              maxLength={10}
              required
            />
            <input
              type='text'
              id='gameCode'
              name='gameCode'
              placeholder='Enter game code'
              value={gameCode}
              onChange={handleGameCodeChange}
              maxLength={6}
              required
            />
            {error && <span className='home-form-error'>{error}</span>}
            {usernameError && <span className='home-form-error'>{usernameError}</span>}
            {gameCodeError && <span className='home-form-error'>{gameCodeError}</span>}
            <button
              ref={submitBtnRef}
              className={`${
                submitBtnRef && submitBtnRef.current && submitBtnRef.current.disabled
                  ? 'disabled'
                  : ''
              } home-form-btn-submit`}
              type='submit'
            >
              JOIN THE GAME
            </button>
          </form>
        </div>
      </div>
      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default Home
