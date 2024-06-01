import React from 'react';
import {toast} from 'react-toastify'
import {type Scene} from '../scenes/Scene'
import './CoopOfferPopup.css'
import {ERROR_TIMEOUT, RANGE, TOAST_DISMISS_TIMEOUT} from '../GameUtils'
import {ErrorView} from '../views/ErrorView'

interface CoopProps {
  scene: Scene
  from: string
  travelName: string
  ownership: boolean
  joining: boolean
  senderHasTravel: boolean | null
}

export const CoopOfferPopup = (props: CoopProps) => {
  const { scene, from, travelName, ownership, joining, senderHasTravel } = props

  const isPlayerInRange = () => {
    const neighbor = scene.players[from]
    const currPlayer = scene.players[scene.playerId]
    return (
      Math.abs(neighbor.coords.x - currPlayer.coords.x) <= RANGE &&
      Math.abs(neighbor.coords.y - currPlayer.coords.y) <= RANGE
    )
  }

  const handleAcceptCoop = () => {
    if (!isPlayerInRange()) {
      const errorMessage = new ErrorView()
      errorMessage.setText(`${from} chce z tobą negocjować spółkę, ale jesteś zbyt daleko`)
      errorMessage.show()
      setTimeout(() => {
        errorMessage.close()
      }, ERROR_TIMEOUT)
      return
    }

    if (!scene.movingEnabled) return

    const btnAccept = document.getElementById(`${from}-accept-coop`)?.style
    if (btnAccept) {
      btnAccept.display = 'none'
    }

    const btnDecline = document.getElementById(`${from}-decline-coop`)?.style
    if (btnDecline) {
      btnDecline.display = 'none'
    }

    const tag = document.getElementById(`${from}-hiddenTag`)?.style
    if (tag) {
      tag.display = 'inline'
    }

    setTimeout(() => {
      toast.dismiss(from)
    }, TOAST_DISMISS_TIMEOUT)
    scene.acceptCoopInvitation(from, joining, senderHasTravel, travelName)
  }

  const handleDeclineCoop = () => {
    toast.dismiss(`${from}-coop`)
  }

  return (
    <div className='container'>
      <p>
        {ownership
          ? `${from} chce dołączyć do twojej wyprawy do miasta ${travelName}`
          : `${from} zaprasza Cię do swojej wyprawy do miasta ${travelName}`}
      </p>
      <div className='buttons-container'>
        <div id='buttonWrapper'>
          <button className='decisionButton' id={`${from}-accept-coop`} onClick={handleAcceptCoop}>
            Negocjuj
          </button>
        </div>
        <div id='buttonWrapper'>
          <button
            className='decisionButton'
            id={`${from}-decline-coop`}
            onClick={handleDeclineCoop}
          >
            Odrzuć
          </button>
        </div>
      </div>
      <h4 className='tag' id={`${from}-hiddenTag`}>
        Zaakceptowano
      </h4>
    </div>
  )
}
