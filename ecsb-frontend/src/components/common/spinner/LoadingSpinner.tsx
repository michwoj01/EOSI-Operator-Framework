import React from 'react';
import './LoadingSpinner.css'

const LoadingSpinner = () => {
  return (
    <div className='modal-overlay'>
      <div className='spinner-container'>
        <div className='loading-spinner'></div>
      </div>
    </div>
  )
}

export default LoadingSpinner
