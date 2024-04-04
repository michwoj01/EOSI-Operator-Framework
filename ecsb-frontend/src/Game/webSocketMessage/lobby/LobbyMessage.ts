export enum LobbyMessageType {
  LobbyChange = 'landing_page/change',
  LobbyStart = 'landing_page/game_started',
  LobbyEnd = 'landing_page/game_ended',
}

export interface PlayerAmountInfo {
  amount: number
  needed: number
}

export interface LobbyChangeMessage {
  type: LobbyMessageType.LobbyChange
  playersAmount: PlayerAmountInfo
  players: string[]
}

export interface LobbyStartMessage {
  type: LobbyMessageType.LobbyStart
}

export interface LobbyEndMessage {
  type: LobbyMessageType.LobbyEnd
}

export type LobbyMessage = LobbyChangeMessage | LobbyStartMessage | LobbyEndMessage
