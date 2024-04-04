export enum BackendWarningMessageType {
  UserWarning = 'user_warning',
}

export interface UserBusyMessage {
  senderId: string
  message: {
    type: BackendWarningMessageType.UserWarning
    reason: string
    receiverId: string
  }
}

export type BackendWarningMessage = UserBusyMessage
