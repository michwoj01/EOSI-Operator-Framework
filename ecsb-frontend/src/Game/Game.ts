import Phaser from 'phaser'
import GridEngine from 'grid-engine'
import { Scene } from './scenes/Scene'
import type { AssetConfig, GameSettings, GameStatus } from '../services/game/Types'

export interface GameData {
  game: Phaser.Game
  scene: Scene
}

export const startGame = (
  gameToken: string,
  userStatus: GameStatus,
  settings: GameSettings,
  mapConfig: AssetConfig,
  characterURL: string,
  resourceURL: string,
  tileSetURL: string,
): GameData => {
  const scene = new Scene(
    gameToken,
    userStatus,
    settings,
    mapConfig,
    characterURL,
    resourceURL,
    tileSetURL,
  )

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    dom: {
      createContainer: true,
    },
    render: {
      antialias: false,
    },
    scale: {
      mode: Phaser.Scale.ScaleModes.RESIZE,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    parent: 'game-content',
    scene: scene,
    plugins: {
      scene: [
        {
          key: 'gridEngine',
          plugin: GridEngine,
          mapping: 'gridEngine',
        },
      ],
    },
  }

  const game = new Phaser.Game(config)

  return {
    game,
    scene,
  }
}

export const stopGame = (gameData: GameData): void => {
  window.document.getElementById('btn')?.remove()

  window.document.getElementById('errorsAndInfo')?.remove()

  clearOverlayWindows()

  gameData.scene.userDataView?.close()
  gameData.scene.equipmentView?.close()
  gameData.scene.settingsView?.close()
  gameData.scene.timeView?.close()
  gameData.scene.lobbyView?.close()
  gameData.scene.leaderboardView?.close()
  gameData.scene.loadingView?.close()
  gameData.scene.statusAndCoopView?.close()

  gameData.scene.destroy()
  gameData.scene.sys.plugins.removeScenePlugin('gridEngine')
  gameData.scene.sys.game.destroy(true)

  gameData.game.plugins.removeScenePlugin('gridEngine')
  gameData.game.destroy(true)
}

export const clearOverlayWindows = (): void => {
  window.document.getElementById('travelBoxWrapper')?.remove()
  window.document.getElementById('tradeBoxWrapper')?.remove()
  window.document.getElementById('tradeSuccessBox')?.remove()
  window.document.getElementById('workshopBoxWrapper')?.remove()
  window.document.getElementById('resourceNegotiationBoxWrapper')?.remove()
  window.document.getElementById('resourceNegotiationSuccessBox')?.remove()
}
