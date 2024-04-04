import { type Websocket } from 'websocket-ts'

export enum TravelChoosingMessageType {
  TravelStart = 'travel/choosing/start', // Signal opening travel window
  TravelStop = 'travel/choosing/stop', // Signal closing travel window
  TravelChange = 'travel/choosing/change',
}

export interface TravelChoosingStartMessage {
  type: TravelChoosingMessageType.TravelStart
}

export interface TravelChoosingStopMessage {
  type: TravelChoosingMessageType.TravelStop
}

export interface TravelChoosingChangeMessage {
  type: TravelChoosingMessageType.TravelChange
  travelName: string
}

export type TravelChoosingMessage =
  | TravelChoosingStartMessage
  | TravelChoosingStopMessage
  | TravelChoosingChangeMessage

export const sendTravelChoosingMessage = (
  socket: Websocket,
  message: TravelChoosingMessage,
): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing message. Reason: ${(error as Error).message}`)
  }
}
