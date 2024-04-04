import { type Websocket } from 'websocket-ts'

export enum IncomingWorkshopMessageType {
  WorkshopAccept = 'workshop/accept',
  WorkshopDeny = 'workshop/deny',
}

export interface WorkshopAcceptMessage {
  senderId: string
  message: {
    type: IncomingWorkshopMessageType.WorkshopAccept
    time: number
  }
}

export interface WorkshopDenyMessage {
  senderId: string
  message: {
    type: IncomingWorkshopMessageType.WorkshopDeny
    reason: string
  }
}

export type IncomingWorkshopMessage = WorkshopAcceptMessage | WorkshopDenyMessage

export enum OutcomingWorkshopMessageType {
  WorkshopChoosingStart = 'workshop/choosing/start', // Signal opening workshop window
  WorkshopChoosingStop = 'workshop/choosing/stop', // Signal closing workshop window
  WorkshopChoosingChange = 'workshop/choosing/change',
  WorkshopStart = 'workshop/start',
}

export interface WorkshopChoosingStartMessage {
  type: OutcomingWorkshopMessageType.WorkshopChoosingStart
}

export interface WorkshopChoosingStopMessage {
  type: OutcomingWorkshopMessageType.WorkshopChoosingStop
}

export interface WorkshopChoosingChangeMessage {
  type: OutcomingWorkshopMessageType.WorkshopChoosingChange
  amount: number
}

export interface WorkshopStartMessage {
  type: OutcomingWorkshopMessageType.WorkshopStart
  amount: number
}

export type OutcomingWorkshopMessage =
  | WorkshopChoosingStartMessage
  | WorkshopChoosingStopMessage
  | WorkshopChoosingChangeMessage
  | WorkshopStartMessage

export const sendWorkshopMessage = (socket: Websocket, message: OutcomingWorkshopMessage): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing message. Reason: ${(error as Error).message}`)
  }
}
