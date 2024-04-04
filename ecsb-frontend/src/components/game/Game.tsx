import { useEffect } from 'react'
import { stopGame } from '../../Game/Game'
import './Game.css'
import { useGameStore } from '../../store/GameStore'
import { Navigate } from 'react-router-dom'

const Game = () => {
  const { gameData, setGameData } = useGameStore()

  useEffect(() => {
    return () => {
      if (gameData) {
        stopGame(gameData)
        setGameData(null)
        document.body.style.overflow = 'auto'
      }
    }

    // eslint-disable-next-line
  }, [])

  return gameData ? <div id='game-content' /> : <Navigate to='/' replace />
}

export default Game
