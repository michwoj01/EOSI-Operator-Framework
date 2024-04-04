import { useRef, useState } from 'react'
import gameService from '../../../../services/game/GameService'
import './GetGameLogsForm.css'
import LoadingSpinner from '../../../common/spinner/LoadingSpinner'

const GetGameLogsForm = () => {
  const submitButton = useRef<HTMLButtonElement>(null)
  const [gameSessionId, setGameSessionId] = useState<number>(0)
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

    await gameService
      .getAdminGameLogs(gameSessionId)
      .then((csv) => {
        const fileName = `logs_game_${gameSessionId}.csv`
        const blob = new Blob([csv], { type: 'text/plain' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = fileName
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch((err) => {
        console.log(err)
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
          Get Logs
        </button>
      </form>
      {isLoading && <LoadingSpinner />}
    </>
  )
}

export default GetGameLogsForm
