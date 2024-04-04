import { type Websocket } from 'websocket-ts'
import { type TradeEquipment } from '../../../services/game/Types'

export interface TradeBid {
  senderOffer: TradeEquipment
  senderRequest: TradeEquipment
}

export enum IncomingTradeMessageType {
  TradeServerPropose = 'trade/system/propose_trade',
  TradeServerStart = 'trade/system/start_trade',
  TradeServerBid = 'trade/system/trade_bid',
  TradeServerFinish = 'trade/system/finish_trade',
  TradeServerCancel = 'trade/system/cancel_trade',
}

export interface TradeServerProposeMessage {
  senderId: string
  message: {
    type: IncomingTradeMessageType.TradeServerPropose
    proposalReceiverId: string
  }
}

export interface TradeServerStartMessage {
  senderId: string
  message: {
    type: IncomingTradeMessageType.TradeServerStart
    myTurn: boolean
    receiverId: string
  }
}

export interface TradeServerBidMessage {
  senderId: string
  message: {
    type: IncomingTradeMessageType.TradeServerBid
    tradeBid: TradeBid
    receiverId: string
  }
}

export interface TradeServerFinishMessage {
  senderId: string
  message: {
    type: IncomingTradeMessageType.TradeServerFinish
    receiverId: string
  }
}

export interface TradeServerCancelMessage {
  senderId: string
  message: {
    type: IncomingTradeMessageType.TradeServerCancel
    receiverId: string
  }
}

export type IncomingTradeMessage =
  | TradeServerProposeMessage
  | TradeServerStartMessage
  | TradeServerBidMessage
  | TradeServerFinishMessage
  | TradeServerCancelMessage

export enum OutcomingTradeMessageType {
  TradeBuy = 'trade/buy',
  TradeSell = 'trade/sell',
  ProposeTrade = 'trade/propose_trade',
  ProposeTradeAck = 'trade/propose_trade_ack',
  TradeMinorChange = 'trade/minor_change',
  TradeBid = 'trade/trade_bid',
  TradeBidAck = 'trade/trade_bid_ack',
  TradeCancel = 'trade/cancel_trade',
}

export interface TradeBuyMessage {
  type: OutcomingTradeMessageType.TradeBuy
  gameResourceName: string
}

export interface TradeSellMessage {
  type: OutcomingTradeMessageType.TradeSell
  gameResourceName: string
}

export interface ProposeTradeMessage {
  type: OutcomingTradeMessageType.ProposeTrade
  proposalReceiverId: string
}

export interface ProposeTradeAckMessage {
  type: OutcomingTradeMessageType.ProposeTradeAck
  proposalSenderId: string
}

export interface TradeBidMessage {
  type: OutcomingTradeMessageType.TradeBid
  tradeBid: TradeBid
  receiverId: string
}

export interface TradeMinorChangeMessage {
  type: OutcomingTradeMessageType.TradeMinorChange
  tradeBid: TradeBid
  receiverId: string
}

export interface TradeFinishMessage {
  type: OutcomingTradeMessageType.TradeBidAck
  finalBid: TradeBid
  receiverId: string
}

export interface TradeCancelMessage {
  type: OutcomingTradeMessageType.TradeCancel
}

export type OutcomingTradeMessage =
  | TradeBuyMessage
  | TradeSellMessage
  | ProposeTradeMessage
  | ProposeTradeAckMessage
  | TradeBidMessage
  | TradeFinishMessage
  | TradeCancelMessage
  | TradeMinorChangeMessage

export const sendTradeMessage = (socket: Websocket, message: OutcomingTradeMessage): void => {
  try {
    const serialized = JSON.stringify(message)
    socket.send(serialized)
  } catch (error) {
    console.error(`Error serializing trade message. Reason: ${(error as Error).message}`)
  }
}
