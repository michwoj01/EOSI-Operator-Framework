import type { Direction } from 'grid-engine'
import type { Websocket } from 'websocket-ts'

export enum MovementMessageType {
  PlayerAdded = 'player_added',
  PlayerRemoved = 'player_remove',
  PlayerMoved = 'player_moved',
  SyncRequest = 'sync_request',
  PlayerSyncing = 'player_syncing',
  Move = 'move',
}

export interface Coordinates {
  x: number
  y: number
}

export interface PlayerAddedMessage {
  type: MovementMessageType.PlayerAdded
  id: string
  coords: Coordinates
  direction: Direction
  className: string
}

export interface PlayerRemovedMessage {
  type: MovementMessageType.PlayerRemoved
  id: string
}

export interface PlayerMovedMessage {
  type: MovementMessageType.PlayerMoved
  id: string
  coords: Coordinates
  direction: Direction
}

export interface MoveMessage {
  type: MovementMessageType.Move
  coords: Coordinates
  direction: string
}

export interface SyncRequestMessage {
  type: MovementMessageType.SyncRequest
}

export interface PlayerPositionWithClass {
  className: string
  playerPosition: PlayerPosition
}

export interface PlayerPosition {
  id: string
  coords: Coordinates
  direction: Direction
}

export interface PlayersSyncMessage {
  type: MovementMessageType.PlayerSyncing
  players: PlayerPositionWithClass[]
}

export type MovementMessage =
  | PlayerAddedMessage
  | PlayerRemovedMessage
  | PlayerMovedMessage
  | SyncRequestMessage
  | PlayersSyncMessage
  | MoveMessage

export const sendMovementMessage = (socket: Websocket, message: MovementMessage): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing message. Reason: ${(error as Error).message}`)
  }
}
