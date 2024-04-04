import { useRef, useState } from 'react'
import gameService from '../../../../services/game/GameService'
import './StartGameForm.css'
import LoadingSpinner from '../../../common/spinner/LoadingSpinner'
import MessageModal from '../createGameForm/messageModal/MessageModal'

const StartGameForm = () => {
  const submitButton = useRef<HTMLButtonElement>(null)
  const [gameSessionId, setGameSessionId] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [showResultModal, setShowResultModal] = useState<boolean>(false)
  const [modalMessage, setModalMessage] = useState<string>('')

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

    await gameService
      .startGame(gameSessionId)
      .then(() => {
        setModalMessage(`Game ${gameSessionId} started`)
        setShowResultModal(true)
      })
      .catch((err) => {
        setModalMessage(`Error while starting game ${gameSessionId} - ${err}`)
        setShowResultModal(true)
      })

    setIsLoading(false)
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
          Start Game
        </button>
      </form>
      {showResultModal && (
        <MessageModal
          message={modalMessage}
          onClose={() => {
            setShowResultModal(false)
          }}
        />
      )}
      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default StartGameForm
