import { type EquipmentMessage, EquipmentMessageType } from './EqupimentMessage'
import { type IncomingNotificationMessage, NotificationMessageType } from './NotificationMessage'
import { type TimeMessage, TimeMessageType } from './TimeMessage'
import { type IncomingTradeMessage, IncomingTradeMessageType } from './TradeMessageHandler'
import { type BackendWarningMessage, BackendWarningMessageType } from './BackendWarningMessage'
import { type IncomingCoopMessage, IncomingCoopMessageType } from './CoopMessageHandler'
import { type IncomingWorkshopMessage, IncomingWorkshopMessageType } from './WorkshopMessageHandler'

export type ChatMessage =
  | IncomingTradeMessage
  | IncomingNotificationMessage
  | BackendWarningMessage
  | EquipmentMessage
  | TimeMessage
  | IncomingCoopMessage
  | IncomingWorkshopMessage

export const parseChatMessage = (message: string): ChatMessage | null => {
  try {
    const parsed = JSON.parse(message)

    switch (parsed.message.type) {
      case IncomingTradeMessageType.TradeServerPropose:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingTradeMessageType.TradeServerStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingTradeMessageType.TradeServerBid:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingTradeMessageType.TradeServerCancel:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingTradeMessageType.TradeServerFinish:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopStartPlanning:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopSimpleJoinPlanning:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopGatheringJoinPlanning:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopProposeOwnTravel:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopStartNegotiation:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopNegotiationBid:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopFinishNegotiation:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopResourceChange:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopWaitForTravel:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopGoToTravel:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopTravelAccept:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopTravelDeny:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopFinish:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopCancel:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopCancelNegotiation:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingCoopMessageType.CoopCancelPlanning:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingWorkshopMessageType.WorkshopAccept:
        return { senderId: parsed.senderId, message: parsed.message }
      case IncomingWorkshopMessageType.WorkshopDeny:
        return { senderId: parsed.senderId, message: parsed.message }
      case BackendWarningMessageType.UserWarning:
        return { senderId: parsed.senderId, message: parsed.message }
      case EquipmentMessageType.EquipmentChange:
        return { senderId: parsed.senderId, message: parsed.message }
      case EquipmentMessageType.QueueProcessed:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationAdvertisementBuy:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationAdvertisementSell:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTradeStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTradeEnd:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTravelStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTravelEnd:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTravelChoosingStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationTravelChoosingStop:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationWorkshopChoosingStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationWorkshopChoosingStop:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationProductionStart:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationProductionEnd:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationStartAdvertiseCoop:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationStopAdvertiseCoop:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationStartNegotiation:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationStopNegotiation:
        return { senderId: parsed.senderId, message: parsed.message }
      case TimeMessageType.SyncResponse:
        return { senderId: parsed.senderId, message: parsed.message }
      case TimeMessageType.End:
        return { senderId: parsed.senderId, message: parsed.message }
      case TimeMessageType.Remaining:
        return { senderId: parsed.senderId, message: parsed.message }
      case TimeMessageType.PlayerRegen:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationSyncTradeResponse:
        return { senderId: parsed.senderId, message: parsed.message }
      case NotificationMessageType.NotificationSyncCoopResponse:
        return { senderId: parsed.senderId, message: parsed.message }
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
