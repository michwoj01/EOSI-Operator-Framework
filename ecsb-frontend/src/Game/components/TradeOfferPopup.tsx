import { toast } from 'react-toastify'
import { type Scene } from '../scenes/Scene'
import './TradeOfferPopup.css'
import { ERROR_TIMEOUT, RANGE, TOAST_DISMISS_TIMEOUT } from '../GameUtils'
import { ErrorView } from '../views/ErrorView'

interface TradeProps {
  scene: Scene
  from: string
}

export const TradeOfferPopup = (props: TradeProps) => {
  const { scene, from } = props

  const isPlayerInRange = () => {
    const neighbor = scene.players[from]
    const currPlayer = scene.players[scene.playerId]
    return (
      Math.abs(neighbor.coords.x - currPlayer.coords.x) <= RANGE &&
      Math.abs(neighbor.coords.y - currPlayer.coords.y) <= RANGE
    )
  }

  const handleAcceptTrade = () => {
    if (!isPlayerInRange()) {
      const errorMessage = new ErrorView()
      errorMessage.setText(`${from} chce z tobą handlować, ale jesteś zbyt daleko`)
      errorMessage.show()
      setTimeout(() => {
        errorMessage.close()
      }, ERROR_TIMEOUT)
      return
    }

    if (!scene.movingEnabled) return

    const btnAccept = document.getElementById(`${from}-accept`)?.style
    if (btnAccept) {
      btnAccept.display = 'none'
    }

    const btnDecline = document.getElementById(`${from}-decline`)?.style
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
    scene.acceptTradeInvitation(from)
  }

  const handleDeclineTrade = () => {
    toast.dismiss(from)
  }

  return (
    <div className='container'>
      <p>{from} chce handlować</p>
      <div className='buttons-container'>
        <div id='buttonWrapper'>
          <button className='decisionButton' id={`${from}-accept`} onClick={handleAcceptTrade}>
            Akceptuj
          </button>
        </div>
        <div id='buttonWrapper'>
          <button className='decisionButton' id={`${from}-decline`} onClick={handleDeclineTrade}>
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
