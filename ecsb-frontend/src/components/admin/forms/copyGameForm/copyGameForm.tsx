import { useRef, useState } from 'react'
import gameService from '../../../../services/game/GameService'
import './copyGameForm.css'
import LoadingSpinner from '../../../common/spinner/LoadingSpinner'
import MessageModal from '../createGameForm/messageModal/MessageModal'

const CopyGameForm = () => {
  const submitButton = useRef<HTMLButtonElement>(null)
  const [gameSessionId, setGameSessionId] = useState<number>(0)
  const [gameName, setGameName] = useState<string>('')
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

  const handleGameNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGameName(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setIsLoading(true)
    disableSubmitButton()

    await gameService
      .copyGame(gameSessionId, gameName)
      .then((res: number) => {
        setIsLoading(false)
        setModalMessage(`Game copied successfully, new game ID - ${res}`)
        setShowResultModal(true)
      })
      .catch((err) => {
        setModalMessage(`Error occured while copying game - ${err}`)
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
        <label htmlFor='gameName'>Game Name</label>
        <input
          id='gameName'
          type='string'
          value={gameName}
          onChange={(e) => {
            handleGameNameChange(e)
          }}
          required
        />
        <button
          ref={submitButton}
          type='submit'
          className={`${gameSessionId < 1 ? 'disabled' : ''}`}
          disabled={gameSessionId < 1}
        >
          Copy
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

export default CopyGameForm
