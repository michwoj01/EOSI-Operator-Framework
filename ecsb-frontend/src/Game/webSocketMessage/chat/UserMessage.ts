import { type Websocket } from 'websocket-ts'

export enum UserMessageType {
  UserClicked = 'user/clicked',
}

export interface UserClickedMessage {
  type: UserMessageType.UserClicked
  name: string
}

export type UserMessage = UserClickedMessage

export const sendUserMessage = (socket: Websocket, message: UserMessage): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing user status message. Reason: ${(error as Error).message}`)
  }
}
