import { useRef, useState } from 'react'
import gameService from '../../../../services/game/GameService'
import type { GameSettings } from '../../../../services/game/Types'
import './GetGameSettingsForm.css'
import Settings from './settings/Settings'
import LoadingSpinner from '../../../common/spinner/LoadingSpinner'

const GetGameSettingsForm = () => {
  const submitButton = useRef<HTMLButtonElement>(null)
  const [gameSessionId, setGameSessionId] = useState<number>(0)
  const [showSettings, setShowSettings] = useState<boolean>(false)
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null)
  const [modalSettings, setModalSettings] = useState<GameSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const disableSubmitButton = () => {
    if (submitButton.current) {
      submitButton.current.disabled = true
      submitButton.current.classList.add('disabled')
    }
  }

  const enableSubmitButton = () => {
    if (submitButton.current) {
      submitButton.current.disabled = false
      submitButton.current.classList.remove('disabled')
    }
  }

  const handleGameSessionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGameSessionId = Number(e.target.value)
    if (newGameSessionId < 1) {
      return
    }

    setGameSessionId(Number(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)

    disableSubmitButton()

    setModalSettings(null)
    setModalErrorMessage(null)

    await gameService
      .getAdminGameSettings(gameSessionId)
      .then((settings: GameSettings) => {
        setModalSettings(settings)
      })
      .catch((err) => {
        setModalErrorMessage(err.message)
      })

    setIsLoading(false)
    setShowSettings(true)
    enableSubmitButton()
  }

  return (
    <>
      <form className='game-settings-form' onSubmit={handleSubmit}>
        <label htmlFor='gameSessionId'>Game Session ID</label>
        <input
          id='gameSessionId'
          type='number'
          value={gameSessionId}
          min={1}
          onChange={(e) => {
            handleGameSessionIdChange(e)
          }}
          required
        />
        <button
          ref={submitButton}
          type='submit'
          className={`${gameSessionId < 1 ? 'disabled' : ''}`}
          disabled={gameSessionId < 1}
        >
          Get Settings
        </button>
      </form>
      {showSettings && (
        <Settings
          settings={modalSettings}
          errorMessage={modalErrorMessage}
          onClose={() => {
            setShowSettings(false)
          }}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default GetGameSettingsForm
