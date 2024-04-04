import { type ClassResourceRepresentation } from '../../apis/game/Types'
import { type Equipment } from '../../services/game/Types'
import {
  RESOURCE_ICON_SCALE,
  RESOURCE_ICON_SCALE_SMALL,
  RESOURCE_ICON_WIDTH,
  getResourceMapping,
} from '../GameUtils'
import { type Scene } from '../scenes/Scene'
import { ImageCropper } from '../tools/ImageCropper'
import {
  OutcomingCoopMessageType,
  sendCoopMessage,
} from '../webSocketMessage/chat/CoopMessageHandler'
import {
  OutcomingTradeMessageType,
  sendTradeMessage,
} from '../webSocketMessage/chat/TradeMessageHandler'

export class StatusAndCoopView {
  public static readonly statusButtonID = 'statusButton'
  public static readonly statusButtonWrapperID = 'statusButtonWrapper'
  public static readonly coopButtonID = 'coopButton'
  public static readonly coopButtonWrapperID = 'coopButtonWrapper'
  public static readonly statusAndCoopConatinerID = 'statusAndCoopContainer'
  public static readonly advertisementContainerID = 'advertisementContainer'
  public static readonly coopContainerID = 'coopContainer'

  private readonly scene: Scene
  private readonly cropper: ImageCropper
  private readonly url: string
  private readonly resRepresentation: ClassResourceRepresentation[]

  private readonly statusButton: HTMLDivElement
  private readonly statusButtonWrapper: HTMLDivElement
  private readonly coopButton: HTMLDivElement
  private readonly coopButtonWrapper: HTMLDivElement
  private readonly container: HTMLDivElement
  private readonly advertisementContainer: HTMLDivElement
  private readonly coopContainer: HTMLDivElement

  constructor(
    equipment: Equipment,
    url: string,
    resRepresentation: ClassResourceRepresentation[],
    scene: Scene,
  ) {
    this.cropper = new ImageCropper()
    this.url = url
    this.resRepresentation = resRepresentation

    this.scene = scene
    this.advertisementContainer = document.createElement('div')
    this.advertisementContainer.id = StatusAndCoopView.advertisementContainerID
    equipment.resources.forEach((element) => {
      const row = document.createElement('div')
      row.className = 'advertisementContainerRow'
      const buttonGiveWrapper = document.createElement('div')
      buttonGiveWrapper.id = 'adButtonWrapper'
      const buttonGive = document.createElement('div')
      buttonGive.className = 'adGive'
      buttonGive.id = 'adButton'
      const giveImage = document.createElement('img')
      giveImage.src = '/assets/giveCustomIcon.png'
      giveImage.style.width = '30px'
      buttonGive.appendChild(giveImage)
      const resourceGiveImg = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE_SMALL,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(element.key),
        false,
      )
      buttonGive.appendChild(resourceGiveImg)

      const giveImageAdvertisement = document.createElement('img')
      giveImageAdvertisement.src = '/assets/giveCustomIcon.png'
      const resourceGiveImgAdvertisement = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(element.key),
        false,
      )
      buttonGive.addEventListener('click', () => {
        document.querySelectorAll('.adGive').forEach((el) => {
          if (el !== buttonGive) el.id = 'adButton'
          if (el.parentElement !== buttonGiveWrapper) el.parentElement!.id = 'adButtonWrapper'
        })
        buttonGive.id = buttonGive.id === 'adButtonActive' ? 'adButton' : 'adButtonActive'
        buttonGiveWrapper.id =
          buttonGiveWrapper.id === 'adButtonWrapperActive'
            ? 'adButtonWrapper'
            : 'adButtonWrapperActive'

        scene.advertisementInfoBuilder.cleanBubblesForPlayer(scene.playerId, false)
        if (buttonGive.id === 'adButtonActive') {
          const bubble = document.createElement('div')
          bubble.appendChild(giveImageAdvertisement)
          bubble.appendChild(resourceGiveImgAdvertisement)
          bubble.classList.add('bubbleGive')
          scene.advertisementInfoBuilder.addBubble(bubble, scene.playerId)

          sendTradeMessage(scene.chatWs, {
            type: OutcomingTradeMessageType.TradeSell,
            gameResourceName: element.key,
          })
        } else {
          sendTradeMessage(scene.chatWs, {
            type: OutcomingTradeMessageType.TradeSell,
            gameResourceName: '',
          })
        }
        scene.advertisementInfoBuilder.setMarginAndVisibility(scene.playerId)
      })
      buttonGiveWrapper.appendChild(buttonGive)
      const buttonReceiveWrapper = document.createElement('div')
      buttonReceiveWrapper.id = 'adButtonWrapper'
      const buttonReceive = document.createElement('div')
      buttonReceive.className = 'adReceive'
      buttonReceive.id = 'adButton'
      const receiveImage = document.createElement('img')
      receiveImage.src = '/assets/receiveCustomIcon.png'
      receiveImage.style.width = '30px'
      buttonReceive.appendChild(receiveImage)
      const resourceReceiveImg = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE_SMALL,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(element.key),
        false,
      )
      buttonReceive.appendChild(resourceReceiveImg)

      const receiveImageAdvertisement = document.createElement('img')
      receiveImageAdvertisement.src = '/assets/receiveCustomIcon.png'
      const resourceReceiveImgAdvertisement = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(element.key),
        false,
      )
      buttonReceive.addEventListener('click', () => {
        document.querySelectorAll('.adReceive').forEach((el) => {
          if (el !== buttonReceive) el.id = 'adButton'
          if (el.parentElement !== buttonReceiveWrapper) el.parentElement!.id = 'adButtonWrapper'
        })
        buttonReceive.id = buttonReceive.id === 'adButtonActive' ? 'adButton' : 'adButtonActive'
        buttonReceiveWrapper.id =
          buttonReceiveWrapper.id === 'adButtonWrapperActive'
            ? 'adButtonWrapper'
            : 'adButtonWrapperActive'

        scene.advertisementInfoBuilder.cleanBubblesForPlayer(scene.playerId, true)
        if (buttonReceive.id === 'adButtonActive') {
          const bubble = document.createElement('div')
          bubble.appendChild(receiveImageAdvertisement)
          bubble.appendChild(resourceReceiveImgAdvertisement)
          bubble.classList.add('bubbleReceive')
          scene.advertisementInfoBuilder.addBubble(bubble, scene.playerId)

          sendTradeMessage(scene.chatWs, {
            type: OutcomingTradeMessageType.TradeBuy,
            gameResourceName: element.key,
          })
        } else {
          sendTradeMessage(scene.chatWs, {
            type: OutcomingTradeMessageType.TradeBuy,
            gameResourceName: '',
          })
        }
        scene.advertisementInfoBuilder.setMarginAndVisibility(scene.playerId)
      })
      buttonReceiveWrapper.appendChild(buttonReceive)
      row.appendChild(buttonGiveWrapper)
      row.appendChild(buttonReceiveWrapper)
      this.advertisementContainer.appendChild(row)
    })
    this.advertisementContainer.style.display = 'none'

    this.statusButton = document.createElement('div')
    this.statusButton.addEventListener('click', () => {
      this.statusButton.id =
        this.statusButton.id === 'statusButtonActive' ? 'statusButton' : 'statusButtonActive'
      this.statusButtonWrapper.id =
        this.statusButtonWrapper.id === 'statusButtonWrapperActive'
          ? 'statusButtonWrapper'
          : 'statusButtonWrapperActive'

      if (this.statusButton.id === 'statusButtonActive') {
        this.coopButton.id = 'coopButton'
        this.coopButtonWrapper.id = 'coopButtonWrapper'
      }
    })
    this.statusButton.id = StatusAndCoopView.statusButtonID
    const spanStatus = document.createElement('span')
    spanStatus.textContent = 'Status'
    const iconStatus = document.createElement('i')
    iconStatus.className = 'fa fa-caret-down'
    iconStatus.ariaHidden = 'true'
    this.statusButton.addEventListener('click', () => {
      iconStatus.className =
        iconStatus.className === 'fa fa-caret-up' ? 'fa fa-caret-down' : 'fa fa-caret-up'
      this.advertisementContainer.style.display =
        this.advertisementContainer.style.display === 'none' ? 'block' : 'none'

      if (iconStatus.className === 'fa fa-caret-up') {
        iconCoop.className = 'fa fa-caret-down'
        this.coopContainer.style.display = 'none'
      }
    })
    this.statusButton.appendChild(spanStatus)
    this.statusButton.appendChild(iconStatus)

    this.statusButtonWrapper = document.createElement('div')
    this.statusButtonWrapper.id = StatusAndCoopView.statusButtonWrapperID

    this.coopContainer = document.createElement('div')
    this.coopContainer.id = StatusAndCoopView.coopContainerID
    this.coopContainer.style.display = 'none'

    this.coopButton = document.createElement('div')
    this.coopButton.addEventListener('click', () => {
      this.coopButton.id =
        this.coopButton.id === 'coopButtonActive' ? 'coopButton' : 'coopButtonActive'
      this.coopButtonWrapper.id =
        this.coopButtonWrapper.id === 'coopButtonWrapperActive'
          ? 'coopButtonWrapper'
          : 'coopButtonWrapperActive'

      if (this.coopButton.id === 'coopButtonActive') {
        this.statusButton.id = 'statusButton'
        this.statusButtonWrapper.id = 'statusButtonWrapper'
      }
    })
    this.coopButton.id = StatusAndCoopView.coopButtonID
    const spanCoop = document.createElement('span')
    spanCoop.textContent = 'Wyprawa'
    const iconCoop = document.createElement('i')
    iconCoop.className = 'fa fa-caret-down'
    iconCoop.ariaHidden = 'true'
    this.coopButton.addEventListener('click', () => {
      iconCoop.className =
        iconCoop.className === 'fa fa-caret-up' ? 'fa fa-caret-down' : 'fa fa-caret-up'

      this.coopContainer.style.display =
        this.coopContainer.style.display === 'none' ? 'block' : 'none'

      if (iconCoop.className === 'fa fa-caret-up') {
        iconStatus.className = 'fa fa-caret-down'
        this.advertisementContainer.style.display = 'none'
      }
    })
    this.coopButton.appendChild(spanCoop)
    this.coopButton.appendChild(iconCoop)

    this.coopButtonWrapper = document.createElement('div')
    this.coopButtonWrapper.id = StatusAndCoopView.coopButtonWrapperID

    this.container = document.createElement('div')
    this.container.id = StatusAndCoopView.statusAndCoopConatinerID

    this.statusButtonWrapper.appendChild(this.statusButton)
    this.coopButtonWrapper.appendChild(this.coopButton)
    this.container.appendChild(this.statusButtonWrapper)
    this.container.appendChild(this.advertisementContainer)
    this.container.appendChild(this.coopButtonWrapper)
    this.container.appendChild(this.coopContainer)
  }

  public showCoopView(): void {
    if (this.coopButton.id !== 'coopButtonActive') {
      this.coopButton.click()
    }
  }

  public hideCoopView(): void {
    if (this.coopButton.id === 'coopButtonActive') {
      this.coopButton.click()
    }
  }

  public updateCoopView(): void {
    while (this.coopContainer.firstChild) {
      this.coopContainer.removeChild(this.coopContainer.firstChild)
    }

    if (!this.scene.plannedTravel) return

    if (this.scene.plannedTravel.isSingle) {
      this.fillCoopViewSingleTravel()
    } else {
      this.fillCoopViewMultiTravel()
    }
  }

  private fillCoopViewSingleTravel(): void {
    if (!this.scene.plannedTravel) return

    const coopDialogExtraWrapper = document.createElement('div')
    coopDialogExtraWrapper.className = 'coopDialogExtraWrapper'
    const coopDialogWrapper = document.createElement('div')
    coopDialogWrapper.className = 'coopDialogWrapper'
    const coopDialog = document.createElement('div')
    coopDialog.className = 'coopDialog singleCoopDialog'

    // Header
    const coopDialogHeader = document.createElement('div')
    coopDialogHeader.id = 'singleCoopDialogHeader'

    const coopDialogTownName = document.createElement('span')
    coopDialogTownName.innerText = this.scene.plannedTravel.travel.value.name
    const successIcon = document.createElement('img')
    successIcon.id = 'coopDialogSuccessIcon'
    successIcon.src = '/assets/successCustomIcon.png'
    successIcon.style.width = '15px'

    coopDialogHeader.appendChild(coopDialogTownName)
    coopDialogHeader.appendChild(successIcon)

    coopDialog.appendChild(coopDialogHeader)
    coopDialog.appendChild(document.createElement('hr'))

    // Resources
    const coopDialogResources = document.createElement('div')
    coopDialogResources.id = 'singleCoopDialogResources'
    let hasAllResources = true
    this.scene.plannedTravel.playerRequiredResources.resources.forEach((resource) => {
      if (resource.value === 0) return

      const coopDialogResourcesItem = document.createElement('div')

      const itemImage = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE_SMALL,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(resource.key),
        false,
      )

      const playerResourceValue = this.scene.plannedTravel!.playerResources.resources.find(
        (r) => r.key === resource.key,
      )!.value
      const playerRequiredValue = resource.value

      if (playerResourceValue < playerRequiredValue) hasAllResources = false

      const itemValueWrapper = document.createElement('div')
      const itemValue = document.createElement('h4')
      itemValue.innerText = `${Math.min(playerResourceValue, playerRequiredValue)}/${
        resource.value
      }`

      itemValueWrapper.appendChild(itemValue)

      coopDialogResourcesItem.appendChild(itemImage)
      coopDialogResourcesItem.appendChild(itemValueWrapper)

      coopDialogResources.appendChild(coopDialogResourcesItem)
    })
    if (hasAllResources) {
      successIcon.style.visibility = 'visible'
    } else {
      successIcon.style.visibility = 'hidden'
      this.scene.shownGatheredResourcesMessage = false
    }

    const coopDialogResourcesTimes = document.createElement('div')
    if (this.scene.plannedTravel.playerRequiredResources.time <= 2) {
      for (let i = 0; i < this.scene.plannedTravel.playerRequiredResources.time; i++) {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        timeIconWrapper.appendChild(timeIcon)
        timeIconExtraWrapper.appendChild(timeIconWrapper)
        coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
      }
    } else {
      const timeIconExtraWrapper = document.createElement('div')
      const timeIconWrapper = document.createElement('div')
      const timeIcon = document.createElement('img')
      timeIcon.src = '/assets/timeCustomIcon.png'
      timeIcon.style.width = '20px'
      timeIcon.style.height = '20px'
      const timeValue = document.createElement('h4')
      timeValue.innerText = `${this.scene.plannedTravel.playerRequiredResources.time}`
      timeIconWrapper.appendChild(timeIcon)
      timeIconWrapper.appendChild(timeValue)
      timeIconExtraWrapper.appendChild(timeIconWrapper)

      coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
    }
    coopDialogResources.appendChild(coopDialogResourcesTimes)

    coopDialog.appendChild(coopDialogResources)
    coopDialog.appendChild(document.createElement('hr'))

    // Buttons
    const coopDialogButtons = document.createElement('div')
    coopDialogButtons.id = 'singleCoopDialogButtons'

    // Buttons - Resign
    const coopDialogButtonsResignExtraWrapper = document.createElement('div')
    coopDialogButtonsResignExtraWrapper.id = 'coopDialogButtonsResignExtraWrapper'
    coopDialogButtonsResignExtraWrapper.className = 'coopDialogButtonsResignExtraWrapperEnabled'

    const coopDialogButtonsResignWrapper = document.createElement('div')
    coopDialogButtonsResignWrapper.id = 'coopDialogButtonsResignWrapper'
    coopDialogButtonsResignWrapper.className = 'coopDialogButtonsResignWrapperEnabled'

    const coopDialogButtonsResign = document.createElement('button')
    coopDialogButtonsResign.id = 'coopDialogButtonsResign'
    coopDialogButtonsResign.className = 'coopDialogButtonsResignEnabled'
    coopDialogButtonsResign.innerText = 'Zrezygnuj'
    coopDialogButtonsResign.addEventListener('click', () => {
      coopDialogButtonsResign.disabled = true

      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.CancelPlanning,
      })
      this.scene.advertisementInfoBuilder.addBubbleForCoop('', this.scene.playerId)

      coopDialogButtonsResignExtraWrapper.className =
        coopDialogButtonsResignExtraWrapper.className ===
        'coopDialogButtonsResignExtraWrapperEnabledActive'
          ? 'coopDialogButtonsResignExtraWrapperEnabled'
          : 'coopDialogButtonsResignExtraWrapperEnabledActive'
      coopDialogButtonsResignWrapper.className =
        coopDialogButtonsResignWrapper.className === 'coopDialogButtonsResignWrapperEnabledActive'
          ? 'coopDialogButtonsResignWrapperEnabled'
          : 'coopDialogButtonsResignWrapperEnabledActive'
      coopDialogButtonsResign.className =
        coopDialogButtonsResign.className === 'coopDialogButtonsResignEnabledActive'
          ? 'coopDialogButtonsResignEnabled'
          : 'coopDialogButtonsResignEnabledActive'
    })

    coopDialogButtonsResignWrapper.appendChild(coopDialogButtonsResign)
    coopDialogButtonsResignExtraWrapper.appendChild(coopDialogButtonsResignWrapper)

    coopDialogButtons.appendChild(coopDialogButtonsResignExtraWrapper)

    // Buttons - Cooperate
    const coopDialogButtonsCooperateExtraWrapper = document.createElement('div')
    coopDialogButtonsCooperateExtraWrapper.id = 'coopDialogButtonsCooperateExtraWrapper'
    coopDialogButtonsCooperateExtraWrapper.className =
      !this.scene.plannedTravel.wantToCooperate
        ? 'coopDialogButtonsCooperateExtraWrapperEnabled'
        : 'coopDialogButtonsCooperateExtraWrapperEnabledActive'

    const coopDialogButtonsCooperateWrapper = document.createElement('div')
    coopDialogButtonsCooperateWrapper.id = 'coopDialogButtonsCooperateWrapper'
    coopDialogButtonsCooperateWrapper.className =
      !this.scene.plannedTravel.wantToCooperate
        ? 'coopDialogButtonsCooperateWrapperEnabled'
        : 'coopDialogButtonsCooperateWrapperEnabledActive'

    const coopDialogButtonsCooperate = document.createElement('button')
    coopDialogButtonsCooperate.id = 'coopDialogButtonsCooperate'
    coopDialogButtonsCooperate.className =
      !this.scene.plannedTravel.wantToCooperate
        ? 'coopDialogButtonsCooperateEnabled'
        : 'coopDialogButtonsCooperateEnabledActive'
    
    const cooperateIcon = document.createElement('img')
    cooperateIcon.src = '/assets/coopCustomIcon.png'
    cooperateIcon.style.width = '25px'
    coopDialogButtonsCooperate.appendChild(cooperateIcon)
    coopDialogButtonsCooperate.addEventListener('click', () => {
      this.scene.plannedTravel!.wantToCooperate = !this.scene.plannedTravel!.wantToCooperate

      if (this.scene.plannedTravel!.wantToCooperate) {
        sendCoopMessage(this.scene.chatWs, {
          type: OutcomingCoopMessageType.AdvertisePlanningStart,
          travelName: this.scene.plannedTravel!.travel.value.name,
        })
        this.scene.advertisementInfoBuilder.addBubbleForCoop(
          this.scene.plannedTravel!.travel.value.name,
          this.scene.playerId,
        )
        this.scene.advertisementInfoBuilder.setMarginAndVisibility(this.scene.playerId)
        this.scene.playerAdvertisedTravel[this.scene.playerId] =
          this.scene.plannedTravel!.travel.value.name
      } else {
        sendCoopMessage(this.scene.chatWs, {
          type: OutcomingCoopMessageType.AdvertisePlanningStop,
        })
        this.scene.advertisementInfoBuilder.addBubbleForCoop('', this.scene.playerId)
        this.scene.advertisementInfoBuilder.setMarginAndVisibility(this.scene.playerId)
        delete this.scene.playerAdvertisedTravel[this.scene.playerId]
      }

      coopDialogButtonsCooperateExtraWrapper.className =
        coopDialogButtonsCooperateExtraWrapper.className ===
        'coopDialogButtonsCooperateExtraWrapperEnabledActive'
          ? 'coopDialogButtonsCooperateExtraWrapperEnabled'
          : 'coopDialogButtonsCooperateExtraWrapperEnabledActive'
      coopDialogButtonsCooperateWrapper.className =
        coopDialogButtonsCooperateWrapper.className ===
        'coopDialogButtonsCooperateWrapperEnabledActive'
          ? 'coopDialogButtonsCooperateWrapperEnabled'
          : 'coopDialogButtonsCooperateWrapperEnabledActive'
      coopDialogButtonsCooperate.className =
        coopDialogButtonsCooperate.className === 'coopDialogButtonsCooperateEnabledActive'
          ? 'coopDialogButtonsCooperateEnabled'
          : 'coopDialogButtonsCooperateEnabledActive'
    })

    coopDialogButtonsCooperateWrapper.appendChild(coopDialogButtonsCooperate)
    coopDialogButtonsCooperateExtraWrapper.appendChild(coopDialogButtonsCooperateWrapper)

    coopDialogButtons.appendChild(coopDialogButtonsCooperateExtraWrapper)

    coopDialog.appendChild(coopDialogButtons)

    coopDialogWrapper.appendChild(coopDialog)
    coopDialogExtraWrapper.appendChild(coopDialogWrapper)

    this.coopContainer.appendChild(coopDialogExtraWrapper)
  }

  private fillCoopViewMultiTravel(): void {
    if (!this.scene.plannedTravel) return

    const coopDialogExtraWrapper = document.createElement('div')
    coopDialogExtraWrapper.className = 'coopDialogExtraWrapper'
    const coopDialogWrapper = document.createElement('div')
    coopDialogWrapper.className = 'coopDialogWrapper'
    const coopDialog = document.createElement('div')
    coopDialog.className = 'coopDialog multiCoopDialog'

    // Header
    const coopDialogHeader = document.createElement('div')
    coopDialogHeader.id = 'multiCoopDialogHeader'

    const coopDialogHeaderLeft = document.createElement('div')
    const coopDialogTownName = document.createElement('span')
    coopDialogTownName.innerText = this.scene.plannedTravel.travel.value.name
    const successIcon = document.createElement('img')
    successIcon.id = 'coopDialogSuccessIcon'
    successIcon.src = '/assets/successCustomIcon.png'
    successIcon.style.width = '15px'
    coopDialogHeaderLeft.appendChild(coopDialogTownName)
    coopDialogHeaderLeft.appendChild(successIcon)

    const coopDialogHeaderRight = document.createElement('div')
    const cooperateHeaderIcon = document.createElement('img')
    cooperateHeaderIcon.src = '/assets/coopCustomIcon.png'
    cooperateHeaderIcon.style.width = '20px'
    const partnerName = document.createElement('span')
    partnerName.innerText = this.scene.plannedTravel.partner!

    coopDialogHeaderRight.appendChild(cooperateHeaderIcon)
    coopDialogHeaderRight.appendChild(partnerName)

    coopDialogHeader.appendChild(coopDialogHeaderLeft)
    coopDialogHeader.appendChild(coopDialogHeaderRight)

    coopDialog.appendChild(coopDialogHeader)
    coopDialog.appendChild(document.createElement('hr'))

    // PlayerResources
    const coopDialogPlayerName = document.createElement('span')
    coopDialogPlayerName.className = 'multiCoopDialogPlayerName'
    coopDialogPlayerName.innerText = this.scene.playerId
    coopDialog.appendChild(coopDialogPlayerName)

    const coopDialogPlayerResources = document.createElement('div')
    coopDialogPlayerResources.className = 'multiCoopDialogResources'

    let playerHasAllResources = true
    this.scene.plannedTravel.playerRequiredResources.resources.forEach((resource) => {
      if (resource.value === 0) return

      const coopDialogResourcesItem = document.createElement('div')

      const itemImage = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE_SMALL,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(resource.key),
        false,
      )

      const playerResourceValue = this.scene.plannedTravel!.playerResources.resources.find(
        (r) => r.key === resource.key,
      )!.value
      const playerRequiredValue = resource.value

      if (playerResourceValue < playerRequiredValue) playerHasAllResources = false

      const itemValueWrapper = document.createElement('div')
      const itemValue = document.createElement('h4')
      itemValue.innerText = `${Math.min(playerResourceValue, playerRequiredValue)}/${
        resource.value
      }`

      itemValueWrapper.appendChild(itemValue)

      coopDialogResourcesItem.appendChild(itemImage)
      coopDialogResourcesItem.appendChild(itemValueWrapper)

      coopDialogPlayerResources.appendChild(coopDialogResourcesItem)
    })

    if (this.scene.plannedTravel.playerIsRunning) {
      const coopDialogResourcesTimes = document.createElement('div')
      if (this.scene.plannedTravel.playerRequiredResources.time <= 2) {
        for (let i = 0; i < this.scene.plannedTravel.playerRequiredResources.time; i++) {
          const timeIconExtraWrapper = document.createElement('div')
          const timeIconWrapper = document.createElement('div')
          const timeIcon = document.createElement('img')
          timeIcon.src = '/assets/timeCustomIcon.png'
          timeIcon.style.width = '20px'
          timeIcon.style.height = '20px'
          timeIconWrapper.appendChild(timeIcon)
          timeIconExtraWrapper.appendChild(timeIconWrapper)
          coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
        }
      } else {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        const timeValue = document.createElement('h4')
        timeValue.innerText = `${this.scene.plannedTravel.playerRequiredResources.time}`
        timeIconWrapper.appendChild(timeIcon)
        timeIconWrapper.appendChild(timeValue)
        timeIconExtraWrapper.appendChild(timeIconWrapper)

        coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
      }
      coopDialogPlayerResources.appendChild(coopDialogResourcesTimes)
    }

    coopDialog.appendChild(coopDialogPlayerResources)
    coopDialog.appendChild(document.createElement('hr'))

    // PartnerResources
    const coopDialogPartnerName = document.createElement('span')
    coopDialogPartnerName.className = 'multiCoopDialogPlayerName'
    coopDialogPartnerName.innerText = this.scene.plannedTravel.partner!
    coopDialog.appendChild(coopDialogPartnerName)

    const coopDialogPartnerResources = document.createElement('div')
    coopDialogPartnerResources.className = 'multiCoopDialogResources'

    let partnerHasAllResources = true
    this.scene.plannedTravel.partnerRequiredResources!.resources.forEach((resource) => {
      if (resource.value === 0) return

      const coopDialogResourcesItem = document.createElement('div')

      const itemImage = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE_SMALL,
        this.url,
        this.resRepresentation.length,
        getResourceMapping(this.resRepresentation)(resource.key),
        false,
      )

      const partnerResourceValue = this.scene.plannedTravel!.partnerResources!.resources.find(
        (r) => r.key === resource.key,
      )!.value
      const partnerRequiredValue = resource.value

      if (partnerResourceValue < partnerRequiredValue) partnerHasAllResources = false

      const itemValueWrapper = document.createElement('div')
      const itemValue = document.createElement('h4')
      itemValue.innerText = `${Math.min(partnerResourceValue, partnerRequiredValue)}/${
        resource.value
      }`

      itemValueWrapper.appendChild(itemValue)

      coopDialogResourcesItem.appendChild(itemImage)
      coopDialogResourcesItem.appendChild(itemValueWrapper)

      coopDialogPartnerResources.appendChild(coopDialogResourcesItem)
    })

    if (!this.scene.plannedTravel.playerIsRunning) {
      const coopDialogResourcesTimes = document.createElement('div')
      if (this.scene.plannedTravel.partnerRequiredResources!.time <= 2) {
        for (let i = 0; i < this.scene.plannedTravel.partnerRequiredResources!.time; i++) {
          const timeIconExtraWrapper = document.createElement('div')
          const timeIconWrapper = document.createElement('div')
          const timeIcon = document.createElement('img')
          timeIcon.src = '/assets/timeCustomIcon.png'
          timeIcon.style.width = '20px'
          timeIcon.style.height = '20px'
          timeIconWrapper.appendChild(timeIcon)
          timeIconExtraWrapper.appendChild(timeIconWrapper)
          coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
        }
      } else {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        const timeValue = document.createElement('h4')
        timeValue.innerText = `${this.scene.plannedTravel.partnerRequiredResources!.time}`
        timeIconWrapper.appendChild(timeIcon)
        timeIconWrapper.appendChild(timeValue)
        timeIconExtraWrapper.appendChild(timeIconWrapper)

        coopDialogResourcesTimes.appendChild(timeIconExtraWrapper)
      }
      coopDialogPartnerResources.appendChild(coopDialogResourcesTimes)
    }

    coopDialog.appendChild(coopDialogPartnerResources)
    coopDialog.appendChild(document.createElement('hr'))

    if (playerHasAllResources && partnerHasAllResources) {
      successIcon.style.visibility = 'visible'
    } else {
      successIcon.style.visibility = 'hidden'
      this.scene.shownGatheredResourcesMessage = false
    }

    // Buttons
    const coopDialogButtons = document.createElement('div')
    coopDialogButtons.id = 'multiCoopDialogButtons'

    // Buttons - Break
    const coopDialogButtonsBreakExtraWrapper = document.createElement('div')
    coopDialogButtonsBreakExtraWrapper.id = 'coopDialogButtonsBreakExtraWrapper'
    coopDialogButtonsBreakExtraWrapper.className = 'coopDialogButtonsBreakExtraWrapperEnabled'

    const coopDialogButtonsBreakWrapper = document.createElement('div')
    coopDialogButtonsBreakWrapper.id = 'coopDialogButtonsBreakWrapper'
    coopDialogButtonsBreakWrapper.className = 'coopDialogButtonsBreakWrapperEnabled'

    const coopDialogButtonsBreak = document.createElement('button')
    coopDialogButtonsBreak.id = 'coopDialogButtonsBreak'
    coopDialogButtonsBreak.className = 'coopDialogButtonsBreakEnabled'
    coopDialogButtonsBreak.innerText = 'Zerwij'
    coopDialogButtonsBreak.addEventListener('click', () => {
      coopDialogButtonsBreak.disabled = true

      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.CancelCoop,
      })

      coopDialogButtonsBreakExtraWrapper.className =
        coopDialogButtonsBreakExtraWrapper.className ===
        'coopDialogButtonsBreakExtraWrapperEnabledActive'
          ? 'coopDialogButtonsBreakExtraWrapperEnabled'
          : 'coopDialogButtonsBreakExtraWrapperEnabledActive'
      coopDialogButtonsBreakWrapper.className =
        coopDialogButtonsBreakWrapper.className === 'coopDialogButtonsBreakWrapperEnabledActive'
          ? 'coopDialogButtonsBreakWrapperEnabled'
          : 'coopDialogButtonsBreakWrapperEnabledActive'
      coopDialogButtonsBreak.className =
        coopDialogButtonsBreak.className === 'coopDialogButtonsBreakEnabledActive'
          ? 'coopDialogButtonsBreakEnabled'
          : 'coopDialogButtonsBreakEnabledActive'
    })

    coopDialogButtonsBreakWrapper.appendChild(coopDialogButtonsBreak)
    coopDialogButtonsBreakExtraWrapper.appendChild(coopDialogButtonsBreakWrapper)

    coopDialogButtons.appendChild(coopDialogButtonsBreakExtraWrapper)

    coopDialog.appendChild(coopDialogButtons)

    coopDialogWrapper.appendChild(coopDialog)
    coopDialogExtraWrapper.appendChild(coopDialogWrapper)

    this.coopContainer.appendChild(coopDialogExtraWrapper)
  }

  public updateCoopSuccessIcon(success: boolean): void {
    const icon = document.getElementById('coopDialogSuccessIcon')
    if (!icon) return

    if (success) {
      icon.style.visibility = 'visible'
    } else {
      icon.style.visibility = 'hidden'
    }
  }

  public show(): void {
    window.document.body.appendChild(this.container)
  }

  public close(): void {
    document.getElementById(StatusAndCoopView.statusAndCoopConatinerID)?.remove()
  }
}
