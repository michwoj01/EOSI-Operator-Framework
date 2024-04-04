import { type LobbyMessage, LobbyMessageType } from './LobbyMessage'

export const parseLobbyMessage = (message: string): LobbyMessage | null => {
  try {
    const parsed = JSON.parse(message)

    switch (parsed.message.type) {
      case LobbyMessageType.LobbyChange:
        return parsed.message
      case LobbyMessageType.LobbyStart:
        return parsed.message
      case LobbyMessageType.LobbyEnd:
        return parsed.message
      default:
        console.error(
          `Unrecognized message type: ${(parsed as { message: { type: string } }).message.type}`,
        )
        return null
    }
  } catch (error) {
    console.error(`Error parsing message: ${message}. Reason: ${(error as Error).message}`)
    return null
  }
}
