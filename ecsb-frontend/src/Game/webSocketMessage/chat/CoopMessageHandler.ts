import { type CoopEquipmentDto, type GameResourceDto } from '../../../services/game/Types'
import { type Websocket } from 'websocket-ts'

export interface CoopBid {
  travelerId: string
  moneyRatio: number
  resources: GameResourceDto[]
}

export enum IncomingCoopMessageType {
  CoopStartPlanning = 'coop/system/start_planning', // done
  CoopSimpleJoinPlanning = 'coop/system/join_planning/simple', // done
  CoopGatheringJoinPlanning = 'coop/system/join_planning/gathering', // done
  CoopProposeOwnTravel = 'coop/system/propose_own_travel', // done
  CoopStartNegotiation = 'coop/system/negotiation/start', // done
  CoopNegotiationBid = 'coop/system/negotiation/bid', // done
  CoopFinishNegotiation = 'coop/system/negotiation/finish', // done
  CoopResourceChange = 'coop/system/resource_change', // done
  CoopWaitForTravel = 'coop/system/travel_ready/wait', // done
  CoopGoToTravel = 'coop/system/travel_ready/go', // done
  CoopTravelAccept = 'coop/system/travel/accept', // done
  CoopTravelDeny = 'coop/system/travel/deny', // done
  CoopFinish = 'coop/system/finish', // done
  CoopCancel = 'coop/system/cancel_coop', // done
  CoopCancelNegotiation = 'coop/system/cancel_negotiation', // done
  CoopCancelPlanning = 'coop/system/cancel_planning', // done
}

export interface CoopStartPlanningMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopStartPlanning
    ownerId: string
    travelName: string
  }
}

export interface CoopSimpleJoinPlanningMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopSimpleJoinPlanning
    ownerId: string
  }
}

export interface CoopGatheringJoinPlanningMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopGatheringJoinPlanning
    ownerId: string
  }
}

export interface CoopProposeOwnTravelMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopProposeOwnTravel
    guestId: string
    travelName: string
  }
}

export interface CoopStartNegotiationMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopStartNegotiation
    receiverId: string
    travelName: string
    myTurn: boolean
  }
}

export interface CoopNegotiationBidMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopNegotiationBid
    receiverId: string
    coopBid: CoopBid
  }
}

export interface CoopFinishNegotiationMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopFinishNegotiation
    receiverId: string
  }
}

export interface CoopResourceChangeMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopResourceChange
    travelName: string
    equipments: CoopEquipmentDto[]
  }
}

export interface CoopWaitForTravelMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopWaitForTravel
    receiverId: string
    travelerId: string
    travelName: string
    equipments: CoopEquipmentDto[]
  }
}

export interface CoopGoToTravelMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopGoToTravel
    receiverId: string
    travelName: string
    equipments: CoopEquipmentDto[]
  }
}

export interface CoopTravelAcceptMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopTravelAccept
    receiverId: string
    time: number
  }
}

export interface CoopTravelDenyMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopTravelDeny
    receiverId: string
    reason: string
  }
}

export interface CoopFinishMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopFinish
    receiverId: string
    travelerId: string
    travelName: string
  }
}

export interface CoopCancelMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopCancel
    receiverId: string
  }
}

export interface CoopCancelNegotiationMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopCancelNegotiation
    receiverId: string
  }
}

export interface CoopCancelPlanningMessage {
  senderId: string
  message: {
    type: IncomingCoopMessageType.CoopCancelPlanning
    receiverId: string
  }
}

export type IncomingCoopMessage =
  | CoopStartPlanningMessage
  | CoopSimpleJoinPlanningMessage
  | CoopGatheringJoinPlanningMessage
  | CoopProposeOwnTravelMessage
  | CoopStartNegotiationMessage
  | CoopNegotiationBidMessage
  | CoopFinishNegotiationMessage
  | CoopResourceChangeMessage
  | CoopWaitForTravelMessage
  | CoopGoToTravelMessage
  | CoopTravelAcceptMessage
  | CoopTravelDenyMessage
  | CoopFinishMessage
  | CoopCancelMessage
  | CoopCancelNegotiationMessage
  | CoopCancelPlanningMessage

export enum OutcomingCoopMessageType {
  StartPlanning = 'coop/start_planning', // done
  AdvertisePlanningStart = 'coop/advertise_planning/start', // done
  AdvertisePlanningStop = 'coop/advertise_planning/stop', // done
  SimpleJoinPlanning = 'coop/join_planning/simple', // done
  SimpleJoinPlanningAck = 'coop/join_planning/simple/ack', // done
  GatheringJoinPlanning = 'coop/join_planning/gathering', // done
  GatheringJoinPlanningAck = 'coop/join_planning/gathering/ack', // done
  ProposeOwnTravel = 'coop/propose_own_travel', // done
  ProposeOwnTravelAck = 'coop/propose_own_travel/ack', // done
  ResourceDecide = 'coop/resource_decide', // done
  ResourceDecideAck = 'coop/resource_decide/ack', // done
  CancelCoop = 'coop/cancel_coop', // done
  CancelNegotiation = 'coop/cancel_negotiation', // done
  CancelPlanning = 'coop/cancel_planning', // done
  StartPlannedTravel = 'coop/start_planned_travel', // done
  StartSimpleTravel = 'coop/start_simple_travel', // done
}

export interface StartPlanningMessage {
  type: OutcomingCoopMessageType.StartPlanning
  travelName: string
}

export interface AdvertisePlanningStart {
  type: OutcomingCoopMessageType.AdvertisePlanningStart
  travelName: string
}

export interface AdvertisePlanningStop {
  type: OutcomingCoopMessageType.AdvertisePlanningStop
}

export interface SimpleJoinPlanningMessage {
  type: OutcomingCoopMessageType.SimpleJoinPlanning
  ownerId: string
}

export interface SimpleJoinPlanningAckMessage {
  type: OutcomingCoopMessageType.SimpleJoinPlanningAck
  guestId: string
}

export interface GatheringJoinPlanningMessage {
  type: OutcomingCoopMessageType.GatheringJoinPlanning
  ownerId: string
}

export interface GatheringJoinPlanningAckMessage {
  type: OutcomingCoopMessageType.GatheringJoinPlanningAck
  otherOwnerId: string
}

export interface ProposeOwnTravelMessage {
  type: OutcomingCoopMessageType.ProposeOwnTravel
  travelName: string
  guestId: string
}

export interface ProposeOwnTravelAckMessage {
  type: OutcomingCoopMessageType.ProposeOwnTravelAck
  travelName: string
  ownerId: string
}

export interface ResourceDecideMessage {
  type: OutcomingCoopMessageType.ResourceDecide
  yourBid: CoopBid
}

export interface ResourceDecideAckMessage {
  type: OutcomingCoopMessageType.ResourceDecideAck
  yourBid: CoopBid
}

export interface CancelCoopMessage {
  type: OutcomingCoopMessageType.CancelCoop
}

export interface CancelNegotiationMessage {
  type: OutcomingCoopMessageType.CancelNegotiation
}

export interface CancelPlanningMessage {
  type: OutcomingCoopMessageType.CancelPlanning
}

export interface StartPlannedTravelMessage {
  type: OutcomingCoopMessageType.StartPlannedTravel
  travelName: string
}

export interface StartSimpleTravelMessage {
  type: OutcomingCoopMessageType.StartSimpleTravel
  travelName: string
}

export type OutcomingCoopMessage =
  | StartPlanningMessage
  | AdvertisePlanningStart
  | AdvertisePlanningStop
  | SimpleJoinPlanningMessage
  | SimpleJoinPlanningAckMessage
  | GatheringJoinPlanningMessage
  | GatheringJoinPlanningAckMessage
  | ProposeOwnTravelMessage
  | ProposeOwnTravelAckMessage
  | ResourceDecideMessage
  | ResourceDecideAckMessage
  | CancelCoopMessage
  | CancelNegotiationMessage
  | CancelPlanningMessage
  | StartPlannedTravelMessage
  | StartSimpleTravelMessage

export const sendCoopMessage = (socket: Websocket, message: OutcomingCoopMessage): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing trade message. Reason: ${(error as Error).message}`)
  }
}
