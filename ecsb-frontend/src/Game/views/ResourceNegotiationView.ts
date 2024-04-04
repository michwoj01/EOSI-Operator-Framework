import { type Travel, type ClassResourceRepresentation } from '../../apis/game/Types'
import { type GameResourceDto } from '../../services/game/Types'
import { RESOURCE_ICON_SCALE, RESOURCE_ICON_WIDTH, getResourceMapping } from '../GameUtils'
import { type Scene } from '../scenes/Scene'
import { CloudType } from '../scenes/Types'
import { ImageCropper } from '../tools/ImageCropper'
import {
  sendCoopMessage,
  type CoopBid,
  OutcomingCoopMessageType,
} from '../webSocketMessage/chat/CoopMessageHandler'
import { ResourceNegotiationSuccessView } from './ResourceNegotiationSuccessView'

export class ResourceNegotiationView {
  public static readonly resourceNegotiationBoxWrapperID = 'resourceNegotiationBoxWrapper'
  public static readonly resourceNegotiationBoxID = 'resourceNegotiationBox'
  public static readonly resourceNegotiationHeaderBoxExtraWrapperID =
    'resourceNegotiationHeaderBoxExtraWrapper'
  public static readonly resourceNegotiationHeaderBoxWrapperID =
    'resourceNegotiationHeaderBoxWrapper'
  public static readonly resourceNegotiationHeaderBoxID = 'resourceNegotiationHeaderBox'
  public static readonly resourceNegotiationCloseButtonID = 'resourceNegotiationCloseButton'
  public static readonly resourceNegotiationResultBoxID = 'resourceNegotiationResultBox'
  public static readonly resourceNegotiationResultCostBoxWrapperID =
    'resourceNegotiationResultCostBoxWrapper'
  public static readonly resourceNegotiationResultCostBoxID = 'resourceNegotiationResultCostBox'
  public static readonly resourceNegotiationResultProfitBoxWrapperID =
    'resourceNegotiationResultProfitBoxWrapper'
  public static readonly resourceNegotiationResultProfitBoxID = 'resourceNegotiationResultProfitBox'
  public static readonly resourceNegotiationPlayerTurnBoxWrapperID =
    'resourceNegotiationPlayerTurnBoxWrapper'
  public static readonly resourceNegotiationPlayerTurnBoxID = 'resourceNegotiationPlayerTurnBox'
  public static readonly resourceNegotiationContentBoxExtraWrapperID =
    'resourceNegotiationContentBoxExtraWrapper'
  public static readonly resourceNegotiationContentBoxWrapperID =
    'resourceNegotiationContentBoxWrapper'
  public static readonly resourceNegotiationContentBoxID = 'resourceNegotiationContentBox'
  public static readonly resourceNegotiationContentBoxResourcesID =
    'resourceNegotiationContentBoxResources'
  public static readonly resourceNegotiationContentBoxPlayerTimeID =
    'resourceNegotiationContentBoxPlayerTime'
  public static readonly resourceNegotiationContentBoxProfitID =
    'resourceNegotiationContentBoxProfit'
  public static readonly resourceNegotiationPlayerNameWrapperID =
    'resourceNegotiationPlayerNameWrapper'
  public static readonly resourceNegotiationPlayerNameID = 'resourceNegotiationPlayerName'
  public static readonly resourceNegotiationPartnerNameWrapperID =
    'resourceNegotiationPartnerNameWrapper'
  public static readonly resourceNegotiationPartnerNameID = 'resourceNegotiationPartnerName'
  public static readonly resourceNegotiationButtonsID = 'resourceNegotiationButtons'
  public static readonly resourceNegotiationButtonsProposeButtonExtraWrapperID =
    'resourceNegotiationButtonsProposeButtonExtraWrapper'
  public static readonly resourceNegotiationButtonsProposeButtonWrapperID =
    'resourceNegotiationButtonsProposeButtonWrapper'
  public static readonly resourceNegotiationButtonsProposeButtonID =
    'resourceNegotiationButtonsProposeButton'
  public static readonly resourceNegotiationButtonsAcceptButtonExtraWrapperID =
    'resourceNegotiationButtonsAcceptButtonExtraWrapper'
  public static readonly resourceNegotiationButtonsAcceptButtonWrapperID =
    'resourceNegotiationButtonsAcceptButtonWrapper'
  public static readonly resourceNegotiationButtonsAcceptButtonID =
    'resourceNegotiationButtonsAcceptButton'

  // CONTAINER
  private readonly resourceNegotiationBoxWrapper: HTMLDivElement
  private readonly resourceNegotiationBox: HTMLDivElement
  // HEADER
  private readonly resourceNegotiationHeaderBoxExtraWrapper: HTMLDivElement
  private readonly resourceNegotiationHeaderBoxWrapper: HTMLDivElement
  private readonly resourceNegotiationHeaderBox: HTMLDivElement
  private readonly resourceNegotiationCloseButton: HTMLButtonElement
  // RESULT
  private readonly resourceNegotiationResultBox: HTMLDivElement
  private readonly resourceNegotiationResultCostBoxWrapper: HTMLDivElement
  private readonly resourceNegotiationResultCostBox: HTMLDivElement
  private readonly resourceNegotiationResultProfitBoxWrapper: HTMLDivElement
  private readonly resourceNegotiationResultProfitBox: HTMLDivElement
  private readonly resourceNegotiationPlayerTurnBoxWrapper: HTMLHeadingElement
  private readonly resourceNegotiationPlayerTurnBox: HTMLHeadingElement
  // CONTENT
  private readonly resourceNegotiationContentBoxExtraWrapper: HTMLDivElement
  private readonly resourceNegotiationContentBoxWrapper: HTMLDivElement
  private readonly resourceNegotiationContentBox: HTMLDivElement
  // BUTTONS
  private readonly resourceNegotiationButtons: HTMLDivElement
  private readonly resourceNegotiationButtonsProposeButtonExtraWrapper: HTMLDivElement
  private readonly resourceNegotiationButtonsProposeButtonWrapper: HTMLDivElement
  private readonly resourceNegotiationButtonsProposeButton: HTMLButtonElement
  private readonly resourceNegotiationButtonsAcceptButtonExtraWrapper: HTMLDivElement
  private readonly resourceNegotiationButtonsAcceptButtonWrapper: HTMLDivElement
  private readonly resourceNegotiationButtonsAcceptButton: HTMLButtonElement

  private isPlayerTurn: boolean
  private isFirstTurn: boolean

  private currPlayerBid: CoopBid
  private newPlayerBid: CoopBid
  private currPartnerBid: CoopBid
  private newPartnerBid: CoopBid

  private readonly scene: Scene
  public readonly travel: Travel
  public readonly partner: string
  private readonly cropper: ImageCropper
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]

  constructor(
    scene: Scene,
    travel: Travel,
    partner: string,
    resourceURL: string,
    resRepresentation: ClassResourceRepresentation[],
    isPlayerTurn: boolean,
  ) {
    this.scene = scene
    this.travel = travel
    this.partner = partner
    this.resourceURL = resourceURL
    this.resourceRepresentation = resRepresentation
    this.cropper = new ImageCropper()
    this.isPlayerTurn = isPlayerTurn
    this.isFirstTurn = true

    const currPlayerBidResources: GameResourceDto[] = []
    const newPlayerBidResources: GameResourceDto[] = []
    const currPartnerBidResources: GameResourceDto[] = []
    const newPartnerBidResources: GameResourceDto[] = []
    for (const resource of this.travel.value.resources) {
      currPlayerBidResources.push({
        key: resource.key,
        value: 0,
      })
      newPlayerBidResources.push({
        key: resource.key,
        value: 0,
      })

      currPartnerBidResources.push({
        key: resource.key,
        value: resource.value,
      })
      newPartnerBidResources.push({
        key: resource.key,
        value: resource.value,
      })
    }
    this.currPlayerBid = {
      travelerId: '',
      moneyRatio: 0,
      resources: currPlayerBidResources,
    }
    this.newPlayerBid = {
      travelerId: '',
      moneyRatio: 0,
      resources: newPlayerBidResources,
    }
    this.currPartnerBid = {
      travelerId: this.partner,
      moneyRatio: 100,
      resources: newPartnerBidResources,
    }
    this.newPartnerBid = {
      travelerId: this.partner,
      moneyRatio: 100,
      resources: currPartnerBidResources,
    }

    // Wrapper
    this.resourceNegotiationBoxWrapper = document.createElement('div')
    this.resourceNegotiationBoxWrapper.id = ResourceNegotiationView.resourceNegotiationBoxWrapperID
    // Container
    this.resourceNegotiationBox = document.createElement('div')
    this.resourceNegotiationBox.id = ResourceNegotiationView.resourceNegotiationBoxID
    // Header
    this.resourceNegotiationHeaderBoxExtraWrapper = document.createElement('div')
    this.resourceNegotiationHeaderBoxExtraWrapper.id =
      ResourceNegotiationView.resourceNegotiationHeaderBoxExtraWrapperID
    this.resourceNegotiationHeaderBoxWrapper = document.createElement('div')
    this.resourceNegotiationHeaderBoxWrapper.id =
      ResourceNegotiationView.resourceNegotiationHeaderBoxWrapperID
    this.resourceNegotiationHeaderBox = document.createElement('div')
    this.resourceNegotiationHeaderBox.id = ResourceNegotiationView.resourceNegotiationHeaderBoxID

    const resourceNegotiationHeaderTitle = document.createElement('h1')
    resourceNegotiationHeaderTitle.innerText = 'WYPRAWA'
    const resourceNegotiationHeaderSubtitle = document.createElement('h2')
    resourceNegotiationHeaderSubtitle.innerText = 'PODZIAŁ WKŁADU i ZYSKU'

    this.resourceNegotiationCloseButton = document.createElement('button')
    this.resourceNegotiationCloseButton.id =
      ResourceNegotiationView.resourceNegotiationCloseButtonID
    this.resourceNegotiationCloseButton.addEventListener('click', () => {
      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.CancelNegotiation,
      })
      this.close(false)
    })
    const XIcon = document.createElement('i')
    XIcon.className = 'fa fa-times'
    XIcon.ariaHidden = 'true'
    XIcon.style.color = 'black'
    this.resourceNegotiationCloseButton.appendChild(XIcon)

    this.resourceNegotiationHeaderBox.appendChild(resourceNegotiationHeaderTitle)
    this.resourceNegotiationHeaderBox.appendChild(resourceNegotiationHeaderSubtitle)

    this.resourceNegotiationHeaderBoxWrapper.appendChild(this.resourceNegotiationHeaderBox)
    this.resourceNegotiationHeaderBoxWrapper.appendChild(this.resourceNegotiationCloseButton)
    this.resourceNegotiationHeaderBoxExtraWrapper.appendChild(
      this.resourceNegotiationHeaderBoxWrapper,
    )

    this.resourceNegotiationBox.append(this.resourceNegotiationHeaderBoxExtraWrapper)
    // Result
    this.resourceNegotiationResultBox = document.createElement('div')
    this.resourceNegotiationResultBox.id = ResourceNegotiationView.resourceNegotiationResultBoxID
    // Result - cost
    this.resourceNegotiationResultCostBoxWrapper = document.createElement('div')
    this.resourceNegotiationResultCostBoxWrapper.id =
      ResourceNegotiationView.resourceNegotiationResultCostBoxWrapperID
    this.resourceNegotiationResultCostBox = document.createElement('div')
    this.resourceNegotiationResultCostBox.id =
      ResourceNegotiationView.resourceNegotiationResultCostBoxID

    const resourceNegotiationResultCostBoxCostSpan = document.createElement('span')
    resourceNegotiationResultCostBoxCostSpan.innerText = 'Koszt wyprawy:'
    this.resourceNegotiationResultCostBox.appendChild(resourceNegotiationResultCostBoxCostSpan)

    for (const resource of this.travel.value.resources) {
      const resourceContainer = document.createElement('div')
      const resourceValue = document.createElement('span')
      resourceValue.innerText = `${resource.value}`
      const resourceIcon = this.cropper.crop(
        20,
        20,
        1,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      resourceContainer.appendChild(resourceValue)
      resourceContainer.appendChild(resourceIcon)
      this.resourceNegotiationResultCostBox.appendChild(resourceContainer)
      const plusIcon = document.createElement('span')
      plusIcon.innerText = ' + '
      this.resourceNegotiationResultCostBox.appendChild(plusIcon)
    }

    const timeContainer = document.createElement('div')
    if (this.travel.value.time! > 3) {
      const timeValue = document.createElement('span')
      timeValue.innerText = `${this.travel.value.time!}`
      const timeIcon = document.createElement('img')
      timeIcon.src = '/assets/timeCustomIcon.png'
      timeIcon.style.width = '20px'
      timeIcon.style.height = '20px'
      timeContainer.appendChild(timeValue)
      timeContainer.appendChild(timeIcon)
    } else {
      for (let i = 0; i < this.travel.value.time!; i++) {
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        timeContainer.appendChild(timeIcon)
      }
    }

    this.resourceNegotiationResultCostBox.appendChild(timeContainer)

    this.resourceNegotiationResultCostBoxWrapper.appendChild(this.resourceNegotiationResultCostBox)
    // Result - profit
    this.resourceNegotiationResultProfitBoxWrapper = document.createElement('div')
    this.resourceNegotiationResultProfitBoxWrapper.id =
      ResourceNegotiationView.resourceNegotiationResultProfitBoxWrapperID
    this.resourceNegotiationResultProfitBox = document.createElement('div')
    this.resourceNegotiationResultProfitBox.id =
      ResourceNegotiationView.resourceNegotiationResultProfitBoxID

    const resourceNegotiationResultProfitBoxProfitSpan = document.createElement('span')
    resourceNegotiationResultProfitBoxProfitSpan.innerText = `Zysk:`
    this.resourceNegotiationResultProfitBox.appendChild(
      resourceNegotiationResultProfitBoxProfitSpan,
    )

    const moneyContainer = document.createElement('div')
    const moneyValue = document.createElement('span')
    moneyValue.innerText = `${this.travel.value.moneyRange.from}-${this.travel.value.moneyRange.to}`
    const moneyIcon = document.createElement('img')
    moneyIcon.src = '/assets/coinCustomIcon.png'
    moneyIcon.style.width = '20px'
    moneyIcon.style.height = '20px'
    moneyContainer.appendChild(moneyValue)
    moneyContainer.appendChild(moneyIcon)
    this.resourceNegotiationResultProfitBox.appendChild(moneyContainer)

    this.resourceNegotiationResultProfitBoxWrapper.appendChild(
      this.resourceNegotiationResultProfitBox,
    )
    // Result - player turn
    this.resourceNegotiationPlayerTurnBoxWrapper = document.createElement('div')
    this.resourceNegotiationPlayerTurnBoxWrapper.id =
      ResourceNegotiationView.resourceNegotiationPlayerTurnBoxWrapperID
    this.resourceNegotiationPlayerTurnBox = document.createElement('h3')
    this.resourceNegotiationPlayerTurnBox.id =
      ResourceNegotiationView.resourceNegotiationPlayerTurnBoxID

    this.resourceNegotiationPlayerTurnBoxWrapper.appendChild(this.resourceNegotiationPlayerTurnBox)

    this.resourceNegotiationResultBox.appendChild(this.resourceNegotiationResultCostBoxWrapper)
    this.resourceNegotiationResultBox.appendChild(this.resourceNegotiationResultProfitBoxWrapper)
    this.resourceNegotiationResultBox.appendChild(this.resourceNegotiationPlayerTurnBoxWrapper)

    this.resourceNegotiationBox.append(this.resourceNegotiationResultBox)
    // Content
    this.resourceNegotiationContentBoxExtraWrapper = document.createElement('div')
    this.resourceNegotiationContentBoxExtraWrapper.id =
      ResourceNegotiationView.resourceNegotiationContentBoxExtraWrapperID
    this.resourceNegotiationContentBoxWrapper = document.createElement('div')
    this.resourceNegotiationContentBoxWrapper.id =
      ResourceNegotiationView.resourceNegotiationContentBoxWrapperID
    this.resourceNegotiationContentBox = document.createElement('div')
    this.resourceNegotiationContentBox.id = ResourceNegotiationView.resourceNegotiationContentBoxID
    // Content - Player names
    const resourceNegotiationPlayerNameWrapper = document.createElement('div')
    resourceNegotiationPlayerNameWrapper.id =
      ResourceNegotiationView.resourceNegotiationPlayerNameWrapperID
    const resourceNegotiationPlayerName = document.createElement('h3')
    resourceNegotiationPlayerName.id = ResourceNegotiationView.resourceNegotiationPlayerNameID
    resourceNegotiationPlayerName.innerText = `${this.scene.playerId}`
    resourceNegotiationPlayerNameWrapper.appendChild(resourceNegotiationPlayerName)
    const resourceNegotiationPartnerNameWrapper = document.createElement('div')
    resourceNegotiationPartnerNameWrapper.id =
      ResourceNegotiationView.resourceNegotiationPartnerNameWrapperID
    const resourceNegotiationPartnerName = document.createElement('h3')
    resourceNegotiationPartnerName.id = ResourceNegotiationView.resourceNegotiationPartnerNameID
    resourceNegotiationPartnerName.innerText = `${this.partner}`
    resourceNegotiationPartnerNameWrapper.appendChild(resourceNegotiationPartnerName)

    this.resourceNegotiationContentBoxWrapper.appendChild(this.resourceNegotiationContentBox)
    this.resourceNegotiationContentBoxExtraWrapper.appendChild(
      this.resourceNegotiationContentBoxWrapper,
    )
    this.resourceNegotiationContentBoxExtraWrapper.appendChild(resourceNegotiationPlayerNameWrapper)
    this.resourceNegotiationContentBoxExtraWrapper.appendChild(
      resourceNegotiationPartnerNameWrapper,
    )

    this.resourceNegotiationBox.append(this.resourceNegotiationContentBoxExtraWrapper)

    // Buttons
    this.resourceNegotiationButtons = document.createElement('div')
    this.resourceNegotiationButtons.id = ResourceNegotiationView.resourceNegotiationButtonsID

    // Buttons - propose
    this.resourceNegotiationButtonsProposeButtonExtraWrapper = document.createElement('div')
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.id =
      ResourceNegotiationView.resourceNegotiationButtonsProposeButtonExtraWrapperID
    this.resourceNegotiationButtonsProposeButtonWrapper = document.createElement('div')
    this.resourceNegotiationButtonsProposeButtonWrapper.id =
      ResourceNegotiationView.resourceNegotiationButtonsProposeButtonWrapperID
    this.resourceNegotiationButtonsProposeButton = document.createElement('button')
    this.resourceNegotiationButtonsProposeButton.id =
      ResourceNegotiationView.resourceNegotiationButtonsProposeButtonID
    this.resourceNegotiationButtonsProposeButton.innerText = 'ZAPROPONUJ'
    this.resourceNegotiationButtonsProposeButton.addEventListener('click', () => {
      this.disableAcceptBtn()
      this.disableProposeButton()

      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.ResourceDecide,
        yourBid: {
          travelerId:
            this.newPlayerBid.travelerId !== ''
              ? this.newPlayerBid.travelerId
              : this.newPartnerBid.travelerId,
          moneyRatio: this.newPlayerBid.moneyRatio,
          resources: this.newPlayerBid.resources,
        },
      })

      this.resourceNegotiationButtonsProposeButtonExtraWrapper.className =
        this.resourceNegotiationButtonsProposeButtonExtraWrapper.className ===
        'resourceNegotiationButtonsProposeButtonExtraWrapperEnabledActive'
          ? 'resourceNegotiationButtonsProposeButtonExtraWrapperEnabled'
          : 'resourceNegotiationButtonsProposeButtonExtraWrapperEnabledActive'
      this.resourceNegotiationButtonsProposeButtonWrapper.className =
        this.resourceNegotiationButtonsProposeButtonWrapper.className ===
        'resourceNegotiationButtonsProposeButtonWrapperEnabledActive'
          ? 'resourceNegotiationButtonsProposeButtonWrapperEnabled'
          : 'resourceNegotiationButtonsProposeButtonWrapperEnabledActive'
      this.resourceNegotiationButtonsProposeButton.className =
        this.resourceNegotiationButtonsProposeButton.className ===
        'resourceNegotiationButtonsProposeButtonEnabledActive'
          ? 'resourceNegotiationButtonsProposeButtonEnabled'
          : 'resourceNegotiationButtonsProposeButtonEnabledActive'

      this.update(false, this.newPlayerBid)
    })

    this.resourceNegotiationButtonsProposeButtonWrapper.appendChild(
      this.resourceNegotiationButtonsProposeButton,
    )
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.appendChild(
      this.resourceNegotiationButtonsProposeButtonWrapper,
    )
    this.resourceNegotiationButtons.appendChild(
      this.resourceNegotiationButtonsProposeButtonExtraWrapper,
    )
    // Buttons - accept
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper = document.createElement('div')
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.id =
      ResourceNegotiationView.resourceNegotiationButtonsAcceptButtonExtraWrapperID
    this.resourceNegotiationButtonsAcceptButtonWrapper = document.createElement('div')
    this.resourceNegotiationButtonsAcceptButtonWrapper.id =
      ResourceNegotiationView.resourceNegotiationButtonsAcceptButtonWrapperID
    this.resourceNegotiationButtonsAcceptButton = document.createElement('button')
    this.resourceNegotiationButtonsAcceptButton.id =
      ResourceNegotiationView.resourceNegotiationButtonsAcceptButtonID
    this.resourceNegotiationButtonsAcceptButton.innerText = 'POTWIERDŹ'
    this.resourceNegotiationButtonsAcceptButton.addEventListener('click', () => {
      this.disableAcceptBtn()
      this.disableProposeButton()

      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.ResourceDecideAck,
        yourBid: {
          travelerId:
            this.newPlayerBid.travelerId !== ''
              ? this.newPlayerBid.travelerId
              : this.newPartnerBid.travelerId,
          moneyRatio: this.newPlayerBid.moneyRatio,
          resources: this.newPlayerBid.resources,
        },
      })

      this.scene.loadingView.show()

      this.resourceNegotiationButtonsAcceptButtonExtraWrapper.className =
        this.resourceNegotiationButtonsAcceptButtonExtraWrapper.className ===
        'resourceNegotiationButtonsAcceptButtonExtraWrapperEnabledActive'
          ? 'resourceNegotiationButtonsAcceptButtonExtraWrapperEnabled'
          : 'resourceNegotiationButtonsAcceptButtonExtraWrapperEnabledActive'
      this.resourceNegotiationButtonsAcceptButtonWrapper.className =
        this.resourceNegotiationButtonsAcceptButtonWrapper.className ===
        'resourceNegotiationButtonsAcceptButtonWrapperEnabledActive'
          ? 'resourceNegotiationButtonsAcceptButtonWrapperEnabled'
          : 'resourceNegotiationButtonsAcceptButtonWrapperEnabledActive'
      this.resourceNegotiationButtonsAcceptButton.className =
        this.resourceNegotiationButtonsAcceptButton.className ===
        'resourceNegotiationButtonsAcceptButtonEnabledActive'
          ? 'resourceNegotiationButtonsAcceptButtonEnabled'
          : 'resourceNegotiationButtonsAcceptButtonEnabledActive'
    })

    this.resourceNegotiationButtonsAcceptButtonWrapper.appendChild(
      this.resourceNegotiationButtonsAcceptButton,
    )
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.appendChild(
      this.resourceNegotiationButtonsAcceptButtonWrapper,
    )
    this.resourceNegotiationButtons.appendChild(
      this.resourceNegotiationButtonsAcceptButtonExtraWrapper,
    )

    this.resourceNegotiationBox.append(this.resourceNegotiationButtons)

    this.resourceNegotiationBoxWrapper.appendChild(this.resourceNegotiationBox)

    // Content - Negotiation
    this.setPlayerTurn(isPlayerTurn)
    this.updateContent()
  }

  public update(isPlayerTurn: boolean, playerBid: CoopBid): void {
    this.isFirstTurn = false
    this.setPlayerTurn(isPlayerTurn)

    if (isPlayerTurn) {
      const currPlayerBidResources: GameResourceDto[] = []
      const newPlayerBidResources: GameResourceDto[] = []
      const currPartnerBidResources: GameResourceDto[] = []
      const newPartnerBidResources: GameResourceDto[] = []
      for (const resource of playerBid.resources) {
        const resourceValue = resource.value
        const travelRequiredResourceValue = this.travel.value.resources.find(
          (r) => r.key === resource.key,
        )!.value
        currPlayerBidResources.push({
          key: resource.key,
          value: resourceValue,
        })
        newPlayerBidResources.push({
          key: resource.key,
          value: resourceValue,
        })

        currPartnerBidResources.push({
          key: resource.key,
          value: travelRequiredResourceValue - resourceValue,
        })
        newPartnerBidResources.push({
          key: resource.key,
          value: travelRequiredResourceValue - resourceValue,
        })
      }
      this.currPlayerBid = {
        travelerId: playerBid.travelerId === this.scene.playerId ? this.scene.playerId : '',
        moneyRatio: playerBid.moneyRatio,
        resources: currPlayerBidResources,
      }
      this.newPlayerBid = {
        travelerId: playerBid.travelerId === this.scene.playerId ? this.scene.playerId : '',
        moneyRatio: playerBid.moneyRatio,
        resources: newPlayerBidResources,
      }
      this.currPartnerBid = {
        travelerId: playerBid.travelerId === this.partner ? this.partner : '',
        moneyRatio: 100 - playerBid.moneyRatio,
        resources: newPartnerBidResources,
      }
      this.newPartnerBid = {
        travelerId: playerBid.travelerId === this.partner ? this.partner : '',
        moneyRatio: 100 - playerBid.moneyRatio,
        resources: currPartnerBidResources,
      }
    }
    this.updateContent()
  }

  private updateContent(): void {
    this.clearContent()
    // Content - Negotiation - Resources
    const resourceNegotiationContentBoxResources = document.createElement('div')
    resourceNegotiationContentBoxResources.id =
      ResourceNegotiationView.resourceNegotiationContentBoxResourcesID

    const resourceNegotiationContentBoxResourcesHeader = document.createElement('h5')
    resourceNegotiationContentBoxResourcesHeader.innerText = 'Podział kosztów'
    resourceNegotiationContentBoxResources.appendChild(resourceNegotiationContentBoxResourcesHeader)

    const resourceNegotiationContentBoxResourcesContent = document.createElement('div')
    resourceNegotiationContentBoxResourcesContent.id =
      'resourceNegotiationContentBoxResourcesContent'
    for (const resource of this.travel.value.resources) {
      const resourceNegotiationContentBoxResourcesContentItem = document.createElement('div')
      // Player
      const playerResourceContainer = document.createElement('div')

      const playerResourceIconWrapper = document.createElement('div')
      const playerResourceIcon = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      playerResourceIconWrapper.appendChild(playerResourceIcon)
      playerResourceContainer.appendChild(playerResourceIconWrapper)

      const playerResourceValueWrapper = document.createElement('div')
      const playerResourceValue = document.createElement('h5')
      playerResourceValue.id = `coop-playerBid-${resource.key}`
      playerResourceValue.innerText = `${
        this.newPlayerBid.resources.find((r) => r.key === resource.key)!.value
      }`
      playerResourceValueWrapper.appendChild(playerResourceValue)
      playerResourceContainer.appendChild(playerResourceValueWrapper)
      // Partner
      const partnerResourceContainer = document.createElement('div')

      const partnerResourceIconWrapper = document.createElement('div')
      const partnerResourceIcon = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      partnerResourceIconWrapper.appendChild(partnerResourceIcon)
      partnerResourceContainer.appendChild(partnerResourceIconWrapper)

      const partnerResourceValueWrapper = document.createElement('div')
      const partnerResourceValue = document.createElement('h5')
      partnerResourceValue.id = `coop-partnerBid-${resource.key}`
      partnerResourceValue.innerText = `${
        this.newPartnerBid.resources.find((r) => r.key === resource.key)!.value
      }`
      partnerResourceValueWrapper.appendChild(partnerResourceValue)
      partnerResourceContainer.appendChild(partnerResourceValueWrapper)

      const resourceRangeSliderContainer = document.createElement('div')
      resourceRangeSliderContainer.className = 'negotiationRangeSliderContainer'

      const resourceInputRangeBack = document.createElement('input')
      resourceInputRangeBack.className = 'negotiationRangeSliderBack'
      resourceInputRangeBack.type = 'range'
      resourceInputRangeBack.min = '0'
      resourceInputRangeBack.max = `${resource.value}`
      resourceInputRangeBack.value = `${
        this.newPlayerBid.resources.find((r) => r.key === resource.key)!.value
      }`
      resourceInputRangeBack.disabled = true
      if (!this.isPlayerTurn) {
        resourceInputRangeBack.style.cursor = 'auto'
        resourceInputRangeBack.classList.add('negotiationRangeSliderBackCursor')
      }
      resourceRangeSliderContainer.appendChild(resourceInputRangeBack)

      if (this.isPlayerTurn) {
        const resourceInputRangeFront = document.createElement('input')
        resourceInputRangeFront.className = 'negotiationRangeSliderFront'
        resourceInputRangeFront.type = 'range'
        resourceInputRangeFront.min = '0'
        resourceInputRangeFront.max = `${resource.value}`
        resourceInputRangeFront.step = '1'
        resourceInputRangeFront.value = `${
          this.newPlayerBid.resources.find((r) => r.key === resource.key)!.value
        }`
        resourceInputRangeFront.addEventListener('change', (event) => {
          const newValue = Number((event.target as HTMLInputElement).value)
          this.updateResourceValue(true, resource.key, newValue)
          this.updateResourceValue(false, resource.key, resource.value - newValue)
          this.newPlayerBid.resources.find((r) => r.key === resource.key)!.value = newValue
          this.newPartnerBid.resources.find((r) => r.key === resource.key)!.value =
            resource.value - newValue

          this.checkBidsChanged()
        })
        resourceInputRangeFront.addEventListener('input', (event) => {
          const newValue = Number((event.target as HTMLInputElement).value)
          this.updateResourceValue(true, resource.key, newValue)
          this.updateResourceValue(false, resource.key, resource.value - newValue)
          this.newPlayerBid.resources.find((r) => r.key === resource.key)!.value = newValue
          this.newPartnerBid.resources.find((r) => r.key === resource.key)!.value =
            resource.value - newValue

          this.checkBidsChanged()
        })
        resourceRangeSliderContainer.appendChild(resourceInputRangeFront)
      }

      resourceNegotiationContentBoxResourcesContentItem.appendChild(playerResourceContainer)
      resourceNegotiationContentBoxResourcesContentItem.appendChild(resourceRangeSliderContainer)
      resourceNegotiationContentBoxResourcesContentItem.appendChild(partnerResourceContainer)
      resourceNegotiationContentBoxResourcesContent.appendChild(
        resourceNegotiationContentBoxResourcesContentItem,
      )
    }
    resourceNegotiationContentBoxResources.appendChild(
      resourceNegotiationContentBoxResourcesContent,
    )

    this.resourceNegotiationContentBox.appendChild(resourceNegotiationContentBoxResources)
    // Content - Negotiation - Player & Time
    const resourceNegotiationContentBoxPlayerTime = document.createElement('div')
    resourceNegotiationContentBoxPlayerTime.id =
      ResourceNegotiationView.resourceNegotiationContentBoxPlayerTimeID

    const resourceNegotiationContentBoxPlayerTimeHeader = document.createElement('h5')
    resourceNegotiationContentBoxPlayerTimeHeader.innerText = 'Wyjazd i wkład czasu'
    resourceNegotiationContentBoxPlayerTime.appendChild(
      resourceNegotiationContentBoxPlayerTimeHeader,
    )

    const resourceNegotiationContentBoxPlayerTimeContent = document.createElement('div')
    resourceNegotiationContentBoxPlayerTimeContent.id =
      'resourceNegotiationContentBoxPlayerTimeContent'

    const playerMovesCheckbox = document.createElement('input')
    playerMovesCheckbox.id = 'playerRunsCheckbox'
    playerMovesCheckbox.className = 'runsCheckbox'
    playerMovesCheckbox.type = 'radio'
    playerMovesCheckbox.name = 'player-moves-option'
    if (this.isPlayerTurn) {
      playerMovesCheckbox.addEventListener('change', () => {
        this.newPlayerBid.travelerId = this.scene.playerId
        this.newPartnerBid.travelerId = ''
        this.checkBidsChanged()
      })
      playerMovesCheckbox.classList.add('runsCheckboxEnabled')
    } else {
      playerMovesCheckbox.disabled = true
      playerMovesCheckbox.addEventListener('mouseover', () => {
        playerMovesCheckbox.style.cursor = 'auto'
      })
      playerMovesCheckbox.classList.add('runsCheckboxDisabled')
    }
    if (this.newPlayerBid.travelerId === this.scene.playerId) {
      if (this.isPlayerTurn || (!this.isPlayerTurn && !this.isFirstTurn)) {
        playerMovesCheckbox.checked = true
      }
    }

    resourceNegotiationContentBoxPlayerTimeContent.appendChild(playerMovesCheckbox)
    const timeContainer = document.createElement('div')
    if (this.travel.value.time! > 3) {
      const timeIconExtraWrapper = document.createElement('div')
      const timeIconWrapper = document.createElement('div')
      const timeIcon = document.createElement('img')
      timeIcon.src = '/assets/timeCustomIcon.png'
      timeIcon.style.width = '20px'
      timeIcon.style.height = '20px'
      const timeValue = document.createElement('span')
      timeValue.innerText = `${this.travel.value.time!}`
      timeValue.style.marginLeft = '5px'
      timeIconWrapper.appendChild(timeIcon)
      timeIconWrapper.appendChild(timeValue)
      timeIconExtraWrapper.appendChild(timeIconWrapper)
      timeContainer.appendChild(timeIconExtraWrapper)
    } else {
      for (let i = 0; i < this.travel.value.time!; i++) {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        timeIconWrapper.appendChild(timeIcon)
        timeIconExtraWrapper.appendChild(timeIconWrapper)
        timeContainer.appendChild(timeIconExtraWrapper)
      }
    }
    resourceNegotiationContentBoxPlayerTimeContent.appendChild(timeContainer)

    const partnerMovesCheckbox = document.createElement('input')
    partnerMovesCheckbox.id = 'partnerRunsCheckbox'
    partnerMovesCheckbox.className = 'runsCheckbox'
    partnerMovesCheckbox.type = 'radio'
    partnerMovesCheckbox.name = 'player-moves-option'
    if (this.isPlayerTurn) {
      partnerMovesCheckbox.addEventListener('change', () => {
        this.newPlayerBid.travelerId = ''
        this.newPartnerBid.travelerId = this.partner
        this.checkBidsChanged()
      })
      partnerMovesCheckbox.classList.add('runsCheckboxEnabled')
    } else {
      partnerMovesCheckbox.disabled = true
      partnerMovesCheckbox.addEventListener('mouseover', () => {
        partnerMovesCheckbox.style.cursor = 'auto'
      })
      partnerMovesCheckbox.classList.add('runsCheckboxDisabled')
    }
    if (this.newPartnerBid.travelerId === this.partner) {
      if (this.isPlayerTurn || (!this.isPlayerTurn && !this.isFirstTurn)) {
        partnerMovesCheckbox.checked = true
      }
    }

    resourceNegotiationContentBoxPlayerTimeContent.appendChild(partnerMovesCheckbox)

    resourceNegotiationContentBoxPlayerTime.appendChild(
      resourceNegotiationContentBoxPlayerTimeContent,
    )

    this.resourceNegotiationContentBox.appendChild(resourceNegotiationContentBoxPlayerTime)
    // Content - Negotiation - Separator
    this.resourceNegotiationContentBox.appendChild(document.createElement('hr'))
    // Content - Negotiation - Profit
    const resourceNegotiationContentBoxProfit = document.createElement('div')
    resourceNegotiationContentBoxProfit.id =
      ResourceNegotiationView.resourceNegotiationContentBoxProfitID

    const resourceNegotiationContentBoxProfitHeader = document.createElement('h5')
    resourceNegotiationContentBoxProfitHeader.innerText = 'Podział zysków'
    resourceNegotiationContentBoxProfit.appendChild(resourceNegotiationContentBoxProfitHeader)

    const resourceNegotiationContentBoxProfitContent = document.createElement('div')
    resourceNegotiationContentBoxProfitContent.id = 'resourceNegotiationContentBoxProfitContent'

    const playerProfit = document.createElement('div')
    const playerMoneyIconWrapper = document.createElement('div')
    const playerMoneyIcon = document.createElement('img')
    playerMoneyIcon.src = '/assets/coinCustomIcon.png'
    playerMoneyIcon.style.width = '38px'
    playerMoneyIconWrapper.appendChild(playerMoneyIcon)
    playerProfit.appendChild(playerMoneyIconWrapper)

    const playerMoneyValueContainer = document.createElement('div')
    const playerMoneyValuePercentageWrapper = document.createElement('div')
    const playerMoneyValuePercentage = document.createElement('h5')
    playerMoneyValuePercentage.innerText = `${this.newPlayerBid.moneyRatio}%`
    playerMoneyValuePercentage.id = `coop-playerBid-money-percentage`
    playerMoneyValuePercentageWrapper.appendChild(playerMoneyValuePercentage)
    const playerMoneyValueValueWrapper = document.createElement('div')
    const playerMoneyValueValue = document.createElement('h5')
    playerMoneyValueValue.innerText = `(${Math.floor(
      this.travel.value.moneyRange.from * (this.newPlayerBid.moneyRatio / 100),
    )}-${Math.ceil(this.travel.value.moneyRange.to * (this.newPlayerBid.moneyRatio / 100))})`
    playerMoneyValueValue.id = `coop-playerBid-money-value`
    playerMoneyValueValueWrapper.appendChild(playerMoneyValueValue)

    playerMoneyValueContainer.appendChild(playerMoneyValuePercentageWrapper)
    playerMoneyValueContainer.appendChild(playerMoneyValueValueWrapper)
    playerProfit.appendChild(playerMoneyValueContainer)
    resourceNegotiationContentBoxProfitContent.appendChild(playerProfit)

    const profitRangeSliderContainer = document.createElement('div')
    profitRangeSliderContainer.className = 'negotiationRangeSliderContainer'

    const resourceRangeSliderContainer = document.createElement('div')
    resourceRangeSliderContainer.className = 'negotiationRangeSliderContainer'

    const profitInputRangeBack = document.createElement('input')
    profitInputRangeBack.className = 'negotiationRangeSliderBack'
    profitInputRangeBack.type = 'range'
    profitInputRangeBack.min = '0'
    profitInputRangeBack.max = '100'
    profitInputRangeBack.value = `${this.newPlayerBid.moneyRatio}`
    profitInputRangeBack.disabled = true
    if (!this.isPlayerTurn) {
      profitInputRangeBack.style.cursor = 'auto'
      profitInputRangeBack.classList.add('negotiationRangeSliderBackCursor')
    }
    profitRangeSliderContainer.appendChild(profitInputRangeBack)

    if (this.isPlayerTurn) {
      const profitInputRangeFront = document.createElement('input')
      profitInputRangeFront.className = 'negotiationRangeSliderFront'
      profitInputRangeFront.type = 'range'
      profitInputRangeFront.min = '0'
      profitInputRangeFront.max = '100'
      profitInputRangeFront.step = '1'
      profitInputRangeFront.value = `${this.newPlayerBid.moneyRatio}`
      profitInputRangeFront.addEventListener('change', (event) => {
        const newValue = Number((event.target as HTMLInputElement).value)
        this.updateMoneyValue(true, newValue)
        this.updateMoneyValue(false, 100 - newValue)
        this.newPlayerBid.moneyRatio = newValue
        this.newPartnerBid.moneyRatio = 100 - newValue

        this.checkBidsChanged()
      })
      profitInputRangeFront.addEventListener('input', (event) => {
        const newValue = Number((event.target as HTMLInputElement).value)
        this.updateMoneyValue(true, newValue)
        this.updateMoneyValue(false, 100 - newValue)
        this.newPlayerBid.moneyRatio = newValue
        this.newPartnerBid.moneyRatio = 100 - newValue

        this.checkBidsChanged()
      })
      profitRangeSliderContainer.appendChild(profitInputRangeFront)
    }

    resourceNegotiationContentBoxProfitContent.appendChild(profitRangeSliderContainer)

    const partnerProfit = document.createElement('div')
    const partnerMoneyIconWrapper = document.createElement('div')
    const partnerMoneyIcon = document.createElement('img')
    partnerMoneyIcon.src = '/assets/coinCustomIcon.png'
    partnerMoneyIcon.style.width = '38px'
    partnerMoneyIconWrapper.appendChild(partnerMoneyIcon)
    partnerProfit.appendChild(partnerMoneyIconWrapper)

    const partnerMoneyValueContainer = document.createElement('div')
    const partnerMoneyValuePercentageWrapper = document.createElement('div')
    const partnerMoneyValuePercentage = document.createElement('h5')
    partnerMoneyValuePercentage.innerText = `${this.newPartnerBid.moneyRatio}%`
    partnerMoneyValuePercentage.id = `coop-partnerBid-money-percentage`
    partnerMoneyValuePercentageWrapper.appendChild(partnerMoneyValuePercentage)
    const partnerMoneyValueValueWrapper = document.createElement('div')
    const partnerMoneyValueValue = document.createElement('h5')
    partnerMoneyValueValue.innerText = `(${Math.floor(
      this.travel.value.moneyRange.from * (this.newPartnerBid.moneyRatio / 100),
    )}-${Math.ceil(this.travel.value.moneyRange.to * (this.newPartnerBid.moneyRatio / 100))})`
    partnerMoneyValueValue.id = `coop-partnerBid-money-value`
    partnerMoneyValueValueWrapper.appendChild(partnerMoneyValueValue)

    partnerMoneyValueContainer.appendChild(partnerMoneyValuePercentageWrapper)
    partnerMoneyValueContainer.appendChild(partnerMoneyValueValueWrapper)
    partnerProfit.appendChild(partnerMoneyValueContainer)
    resourceNegotiationContentBoxProfitContent.appendChild(partnerProfit)

    resourceNegotiationContentBoxProfit.appendChild(resourceNegotiationContentBoxProfitContent)

    this.resourceNegotiationContentBox.appendChild(resourceNegotiationContentBoxProfit)

    if (this.isPlayerTurn) {
      if (this.isFirstTurn) {
        this.enableProposeButton()
        this.disableAcceptBtn()
      } else {
        this.disableProposeButton()
        this.enableAcceptButton()
      }
    } else {
      this.disableProposeButton()
      this.disableAcceptBtn()
    }
  }

  private checkBidsChanged(): void {
    if (this.isPlayerTurn && !this.isFirstTurn) {
      let changed = false
      for (const newResource of this.newPlayerBid.resources) {
        if (
          this.currPlayerBid.resources.find((r) => r.key === newResource.key)!.value !==
          newResource.value
        ) {
          changed = true
        }
      }
      if (this.currPlayerBid.moneyRatio !== this.newPlayerBid.moneyRatio) {
        changed = true
      }

      if (
        this.currPlayerBid.travelerId !== this.newPlayerBid.travelerId ||
        this.currPartnerBid.travelerId !== this.newPartnerBid.travelerId
      ) {
        changed = true
      }

      if (changed) {
        this.enableProposeButton()
        this.disableAcceptBtn()
      } else {
        this.enableAcceptButton()
        this.disableProposeButton()
      }
    }
  }

  private updateResourceValue(player: boolean, resourceName: string, value: number): void {
    let resourceElement: HTMLElement | null = null
    if (player) {
      resourceElement = document.getElementById(`coop-playerBid-${resourceName}`)
    } else {
      resourceElement = document.getElementById(`coop-partnerBid-${resourceName}`)
    }
    if (!resourceElement) return

    resourceElement.innerText = `${value}`
  }

  private updateMoneyValue(player: boolean, percentage: number): void {
    let moneyPercentageElement: HTMLElement | null = null
    let moneyValueElement: HTMLElement | null = null
    if (player) {
      moneyPercentageElement = document.getElementById('coop-playerBid-money-percentage')
      moneyValueElement = document.getElementById('coop-playerBid-money-value')
    } else {
      moneyPercentageElement = document.getElementById('coop-partnerBid-money-percentage')
      moneyValueElement = document.getElementById('coop-partnerBid-money-value')
    }
    if (!moneyPercentageElement || !moneyValueElement) return

    moneyPercentageElement.innerText = `${percentage}%`
    moneyValueElement.innerText = `(${Math.floor(
      this.travel.value.moneyRange.from * (percentage / 100),
    )}-${Math.ceil(this.travel.value.moneyRange.to * (percentage / 100))})`
  }

  private clearContent(): void {
    while (this.resourceNegotiationContentBox.firstChild) {
      this.resourceNegotiationContentBox.removeChild(this.resourceNegotiationContentBox.firstChild)
    }
  }

  public setPlayerTurn(isPlayerTurn: boolean): void {
    this.isPlayerTurn = isPlayerTurn
    if (this.isPlayerTurn) {
      this.resourceNegotiationPlayerTurnBox.innerText = 'Twoja kolej!'
      this.resourceNegotiationPlayerTurnBox.className = 'resourceNegotiationPlayerTurn'
    } else {
      this.resourceNegotiationPlayerTurnBox.innerText = 'Poczekaj!'
      this.resourceNegotiationPlayerTurnBox.className = 'resourceNegotiationPartnerTurn'
    }
  }

  private enableProposeButton(): void {
    this.resourceNegotiationButtonsProposeButton.disabled = false
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.style.display = 'block'
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.className =
      'resourceNegotiationButtonsProposeButtonExtraWrapperEnabled'
    this.resourceNegotiationButtonsProposeButtonWrapper.className =
      'resourceNegotiationButtonsProposeButtonWrapperEnabled'
    this.resourceNegotiationButtonsProposeButton.className =
      'resourceNegotiationButtonsProposeButtonEnabled'
  }

  private disableProposeButton(): void {
    this.resourceNegotiationButtonsProposeButton.disabled = true
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.style.display = 'none'
    this.resourceNegotiationButtonsProposeButtonExtraWrapper.className =
      'resourceNegotiationButtonsProposeButtonExtraWrapperDisabled'
    this.resourceNegotiationButtonsProposeButtonWrapper.className =
      'resourceNegotiationButtonsProposeButtonWrapperDisabled'
    this.resourceNegotiationButtonsProposeButton.className =
      'resourceNegotiationButtonsProposeButtonDisabled'
  }

  private enableAcceptButton(): void {
    this.resourceNegotiationButtonsAcceptButton.disabled = false
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.style.display = 'block'
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.className =
      'resourceNegotiationButtonsAcceptButtonExtraWrapperEnabled'
    this.resourceNegotiationButtonsAcceptButtonWrapper.className =
      'resourceNegotiationButtonsAcceptButtonWrapperEnabled'
    this.resourceNegotiationButtonsAcceptButton.className =
      'resourceNegotiationButtonsAcceptButtonEnabled'
  }

  private disableAcceptBtn(): void {
    this.resourceNegotiationButtonsAcceptButton.disabled = true
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.style.display = 'none'
    this.resourceNegotiationButtonsAcceptButtonExtraWrapper.className =
      'resourceNegotiationButtonsAcceptButtonExtraWrapperDisabled'
    this.resourceNegotiationButtonsAcceptButtonWrapper.className =
      'resourceNegotiationButtonsAcceptButtonWrapperDisabled'
    this.resourceNegotiationButtonsAcceptButton.className =
      'resourceNegotiationButtonsAcceptButtonDisabled'
  }

  public show(): void {
    this.scene.interactionCloudBuiler.showInteractionCloud(this.scene.playerId, CloudType.TALK)
    window.document.body.appendChild(this.resourceNegotiationBoxWrapper)
    this.scene.movingEnabled = false
  }

  public close(success: boolean): void {
    document.getElementById(ResourceNegotiationView.resourceNegotiationBoxWrapperID)?.remove()
    this.scene.interactionCloudBuiler.hideInteractionCloud(this.scene.playerId, CloudType.TALK)
    this.scene.resourceNegotiationView = null

    if (success) {
      const succesView = new ResourceNegotiationSuccessView(
        this.resourceURL,
        this.resourceRepresentation,
        this.travel,
        this.scene.playerId,
        this.newPlayerBid,
        this.partner,
        this.newPartnerBid,
        () => {
          this.scene.movingEnabled = true
        },
      )
      succesView.show()
    } else {
      this.scene.movingEnabled = true
    }
  }
}
