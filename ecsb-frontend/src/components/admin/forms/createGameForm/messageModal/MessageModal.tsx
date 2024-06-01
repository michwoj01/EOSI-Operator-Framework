import React from 'react';
import './MessageModal.css'

interface MessageModalProps {
  message: string
  onClose: (value: React.SetStateAction<boolean>) => void
}

const MessageModal: React.FC<MessageModalProps> = ({ message, onClose }) => {
  return (
    <div className='message-modal'>
      <div className='modal-content'>
        <div id='strip'></div>
        <p>{message}</p>
        <div className='modal-content-button'>
          <button
            onClick={() => {
              onClose(false)
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageModal
