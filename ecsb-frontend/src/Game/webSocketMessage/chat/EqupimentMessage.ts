import { type GameResourceDto, type Equipment } from '../../../services/game/Types'

export enum EquipmentMessageType {
  EquipmentChange = 'equipment/change',
  QueueProcessed = 'queue/processed',
}

export interface EquipmentChangeMessage {
  senderId: string
  message: {
    type: EquipmentMessageType.EquipmentChange
    receiverId: string
    playerEquipment: Equipment
  }
}

export interface QueueProcessedMessage {
  senderId: string
  message: {
    type: EquipmentMessageType.QueueProcessed
    receiverId: string
    context: string
    money: number | null
    resources: GameResourceDto[] | null
  }
}

export type EquipmentMessage = EquipmentChangeMessage | QueueProcessedMessage
