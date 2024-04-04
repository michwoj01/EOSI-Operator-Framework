import { create } from 'zustand'
import type { GameData } from '../Game/Game'

interface GameState {
  gameData: GameData | null
  setGameData: (game: GameData | null) => void
}

export const useGameStore = create<GameState>((set) => ({
  gameData: null,
  setGameData: (gameData: GameData | null) => {
    set({ gameData })
  },
}))
