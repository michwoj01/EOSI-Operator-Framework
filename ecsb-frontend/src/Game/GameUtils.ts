import { type ClassResourceRepresentation } from '../apis/game/Types'

// ASSETS
export const TILES_ASSET_KEY = 'tiles'
export const MAP_ASSET_KEY = 'glade'
export const CHARACTER_ASSET_KEY = 'player'

// MAP
export const LAYER_SCALE = 2.25
export const RANGE = 3

// PLAYERS
export const SPRITE_WIDTH = 52
export const SPRITE_HEIGHT = 72
export const RESOURCE_ICON_WIDTH = 171
export const PLAYER_DESC_OFFSET_LEFT = 10
export const ALL_PLAYERS_DESC_OFFSET_TOP = 75
export const getPlayerMapping =
  (initialCharacterMapping: ClassResourceRepresentation[]) =>
  (playerClass: string): number =>
    initialCharacterMapping.find((dto) => dto.key === playerClass)?.value.classAsset ?? 0
export const getResourceMapping =
  (initialResourceMapping: ClassResourceRepresentation[]) =>
  (resourceName: string): number =>
    initialResourceMapping.find((dto) => dto.value.gameResourceName === resourceName)?.value
      .resourceAsset ?? 0

// OTHER
export const SPACE_PRESS_ACTION_PREFIX = 'Wciśnij <strong>spację</strong> by'
export const TOAST_INVITE_MSG = 'Wysłano zaproszenie do handlu'
export const TOAST_INVITE_MSG_COOP = 'Wysłano zaproszenie do spółki'
export const TOAST_DISMISS_TIMEOUT = 500
export const ERROR_TIMEOUT = 5000
export const INFORMATION_TIMEOUT = 8000
export const ONE_SECOND = 1000
export const RESOURCE_ICON_SCALE = 0.22222 // 0.(2)
export const RESOURCE_ICON_SCALE_SMALL = 0.17
export const TIMEOUT_OFFSET = 300
