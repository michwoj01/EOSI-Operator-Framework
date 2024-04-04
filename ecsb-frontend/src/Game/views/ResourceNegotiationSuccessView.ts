import { type Travel, type ClassResourceRepresentation } from '../../apis/game/Types'
import { RESOURCE_ICON_SCALE, RESOURCE_ICON_WIDTH, getResourceMapping } from '../GameUtils'
import { ImageCropper } from '../tools/ImageCropper'
import { type CoopBid } from '../webSocketMessage/chat/CoopMessageHandler'

export class ResourceNegotiationSuccessView {
  private static readonly resourceNegotiationSuccessBoxID = 'resourceNegotiationSuccessBox'
  private static readonly resourceElementWitdh = 105
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]
  private readonly cropper: ImageCropper
  private readonly onClose: () => void
  private readonly resourceNegotiationSuccessBox: HTMLDivElement

  constructor(
    resourceURL: string,
    resourceRepresentation: ClassResourceRepresentation[],
    travel: Travel,
    player: string,
    playerBid: CoopBid,
    partner: string,
    partnerBid: CoopBid,
    onClose: () => void,
  ) {
    this.resourceURL = resourceURL
    this.resourceRepresentation = resourceRepresentation
    this.cropper = new ImageCropper()
    this.onClose = onClose

    const arrowIconWidth =
      (travel.value.resources.length + 1) * ResourceNegotiationSuccessView.resourceElementWitdh

    // Container
    this.resourceNegotiationSuccessBox = document.createElement('div')
    this.resourceNegotiationSuccessBox.id =
      ResourceNegotiationSuccessView.resourceNegotiationSuccessBoxID

    // Header
    const resourceNegotiationSuccessHeaderWrapper = document.createElement('div')
    resourceNegotiationSuccessHeaderWrapper.id = 'resourceNegotiationSuccessHeaderBoxWrapper'

    const resourceNegotiationSuccessHeader = document.createElement('div')
    resourceNegotiationSuccessHeader.id = 'resourceNegotiationSuccessHeaderBox'

    const tradeSucceessBoxHeaderTitle = document.createElement('h1')
    tradeSucceessBoxHeaderTitle.innerText = 'WYPRAWA'

    resourceNegotiationSuccessHeader.appendChild(tradeSucceessBoxHeaderTitle)
    resourceNegotiationSuccessHeaderWrapper.appendChild(resourceNegotiationSuccessHeader)
    this.resourceNegotiationSuccessBox.appendChild(resourceNegotiationSuccessHeaderWrapper)

    // Success Information
    const resourceNegotiationSuccessInformationBoxWrapper = document.createElement('div')
    resourceNegotiationSuccessInformationBoxWrapper.id =
      'resourceNegotiationSuccessInformationBoxWrapper'
    const resourceNegotiationSuccessInformationBox = document.createElement('div')
    resourceNegotiationSuccessInformationBox.id = 'resourceNegotiationSuccessInformationBox'
    const resourceNegotiationSuccessInformationBoxText = document.createElement('h2')
    resourceNegotiationSuccessInformationBoxText.innerText = 'Podział zakończony sukcesem!'
    const leftSuccessIcon = document.createElement('img')
    leftSuccessIcon.src = '/assets/successCustomIcon.png'
    leftSuccessIcon.style.width = '20px'
    const rightSuccessIcon = document.createElement('img')
    rightSuccessIcon.src = '/assets/successCustomIcon.png'
    rightSuccessIcon.style.width = '20px'

    resourceNegotiationSuccessInformationBox.appendChild(leftSuccessIcon)
    resourceNegotiationSuccessInformationBox.appendChild(
      resourceNegotiationSuccessInformationBoxText,
    )
    resourceNegotiationSuccessInformationBox.appendChild(rightSuccessIcon)

    resourceNegotiationSuccessInformationBoxWrapper.appendChild(
      resourceNegotiationSuccessInformationBox,
    )
    this.resourceNegotiationSuccessBox.appendChild(resourceNegotiationSuccessInformationBoxWrapper)

    // Content
    const resourceNegotiationSuccessContentBoxExtraWrapper = document.createElement('div')
    resourceNegotiationSuccessContentBoxExtraWrapper.id =
      'resourceNegotiationSuccessContentBoxExtraWrapper'
    const resourceNegotiationSuccessContentBoxWrapper = document.createElement('div')
    resourceNegotiationSuccessContentBoxWrapper.id = 'resourceNegotiationSuccessContentBoxWrapper'
    const resourceNegotiationSuccessContentBox = document.createElement('div')
    resourceNegotiationSuccessContentBox.id = 'resourceNegotiationSuccessContentBox'

    // Content - Players' names
    const resourceNegotiationSuccessContentBoxPlayersNames = document.createElement('div')
    resourceNegotiationSuccessContentBoxPlayersNames.id =
      'resourceNegotiationSuccessContentBoxPlayersNames'
    const playerName = document.createElement('h3')
    playerName.innerText = `${player}`
    const partnerName = document.createElement('h3')
    partnerName.innerText = `${partner}`
    resourceNegotiationSuccessContentBoxPlayersNames.appendChild(playerName)
    resourceNegotiationSuccessContentBoxPlayersNames.appendChild(partnerName)
    resourceNegotiationSuccessContentBox.appendChild(
      resourceNegotiationSuccessContentBoxPlayersNames,
    )
    // Content - Players' resources
    const resourceNegotiationSuccessContentBoxPlayersResources = document.createElement('div')
    resourceNegotiationSuccessContentBoxPlayersResources.id =
      'resourceNegotiationSuccessContentBoxPlayersResources'

    const playerResourcesContainer = document.createElement('div')
    const playerResources = document.createElement('div')
    playerResources.className = 'resourceNegotiationSuccessContentBoxResources'
    for (const resource of playerBid.resources) {
      if (resource.value === 0) continue

      const playerResourceItem = document.createElement('div')

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
      playerResourceItem.appendChild(playerResourceIconWrapper)

      const playerResourceValueWrapper = document.createElement('div')
      const playerResourceValue = document.createElement('h5')
      playerResourceValue.innerText = `${resource.value}`
      playerResourceValueWrapper.appendChild(playerResourceValue)
      playerResourceItem.appendChild(playerResourceValueWrapper)

      playerResources.appendChild(playerResourceItem)
    }
    if (playerBid.travelerId !== '') {
      const timeContainer = document.createElement('div')
      if (travel.value.time! > 3) {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        timeIconWrapper.className = 'resourceNegotiationSuccessContentBoxResourcesTime'
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        const timeValue = document.createElement('span')
        timeValue.innerText = `${travel.value.time!}`
        timeValue.style.marginLeft = '5px'
        timeIconWrapper.appendChild(timeIcon)
        timeIconWrapper.appendChild(timeValue)
        timeIconExtraWrapper.appendChild(timeIconWrapper)
        timeContainer.appendChild(timeIconExtraWrapper)
      } else {
        for (let i = 0; i < travel.value.time!; i++) {
          const timeIconExtraWrapper = document.createElement('div')
          const timeIconWrapper = document.createElement('div')
          timeIconWrapper.className = 'resourceNegotiationSuccessContentBoxResourcesTime'
          const timeIcon = document.createElement('img')
          timeIcon.src = '/assets/timeCustomIcon.png'
          timeIcon.style.width = '20px'
          timeIcon.style.height = '20px'
          timeIconWrapper.appendChild(timeIcon)
          timeIconExtraWrapper.appendChild(timeIconWrapper)
          timeContainer.appendChild(timeIconExtraWrapper)
        }
      }
      playerResources.appendChild(timeContainer)
    }
    const playerArrow = document.createElement('img')
    playerArrow.src = '/assets/tradeRightArrowCustomIcon.png'
    playerArrow.style.width = `${arrowIconWidth}px`
    playerResourcesContainer.appendChild(playerResources)
    playerResourcesContainer.appendChild(playerArrow)
    resourceNegotiationSuccessContentBoxPlayersResources.appendChild(playerResourcesContainer)

    const partnerResourcesContainer = document.createElement('div')
    const partnerResources = document.createElement('div')
    partnerResources.className = 'resourceNegotiationSuccessContentBoxResources'
    for (const resource of partnerBid.resources) {
      if (resource.value === 0) continue

      const partnerResourceItem = document.createElement('div')

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
      partnerResourceItem.appendChild(partnerResourceIconWrapper)

      const partnerResourceValueWrapper = document.createElement('div')
      const partnerResourceValue = document.createElement('h5')
      partnerResourceValue.innerText = `${resource.value}`
      partnerResourceValueWrapper.appendChild(partnerResourceValue)
      partnerResourceItem.appendChild(partnerResourceValueWrapper)

      partnerResources.appendChild(partnerResourceItem)
    }
    if (partnerBid.travelerId !== '') {
      const timeContainer = document.createElement('div')
      if (travel.value.time! > 3) {
        const timeIconExtraWrapper = document.createElement('div')
        const timeIconWrapper = document.createElement('div')
        timeIconWrapper.className = 'resourceNegotiationSuccessContentBoxResourcesTime'
        const timeIcon = document.createElement('img')
        timeIcon.src = '/assets/timeCustomIcon.png'
        timeIcon.style.width = '20px'
        timeIcon.style.height = '20px'
        const timeValue = document.createElement('span')
        timeValue.innerText = `${travel.value.time!}`
        timeValue.style.marginLeft = '5px'
        timeIconWrapper.appendChild(timeIcon)
        timeIconWrapper.appendChild(timeValue)
        timeIconExtraWrapper.appendChild(timeIconWrapper)
        timeContainer.appendChild(timeIconExtraWrapper)
      } else {
        for (let i = 0; i < travel.value.time!; i++) {
          const timeIconExtraWrapper = document.createElement('div')
          const timeIconWrapper = document.createElement('div')
          timeIconWrapper.className = 'resourceNegotiationSuccessContentBoxResourcesTime'
          const timeIcon = document.createElement('img')
          timeIcon.src = '/assets/timeCustomIcon.png'
          timeIcon.style.width = '20px'
          timeIcon.style.height = '20px'
          timeIconWrapper.appendChild(timeIcon)
          timeIconExtraWrapper.appendChild(timeIconWrapper)
          timeContainer.appendChild(timeIconExtraWrapper)
        }
      }
      partnerResources.appendChild(timeContainer)
    }
    const partnerArrow = document.createElement('img')
    partnerArrow.src = '/assets/tradeRightArrowCustomIcon.png'
    partnerArrow.style.width = `${arrowIconWidth}px`
    partnerResourcesContainer.appendChild(partnerResources)
    partnerResourcesContainer.appendChild(partnerArrow)
    resourceNegotiationSuccessContentBoxPlayersResources.appendChild(partnerResourcesContainer)

    resourceNegotiationSuccessContentBoxPlayersResources.appendChild(playerResourcesContainer)
    resourceNegotiationSuccessContentBoxPlayersResources.appendChild(partnerResourcesContainer)
    resourceNegotiationSuccessContentBox.appendChild(
      resourceNegotiationSuccessContentBoxPlayersResources,
    )

    // Content Right - Travel destination
    const resourceNegotiationSuccessContentBoxTravelDestination = document.createElement('div')
    resourceNegotiationSuccessContentBoxTravelDestination.id =
      'resourceNegotiationSuccessContentBoxTravelDestination'

    const trainIcon = document.createElement('img')
    trainIcon.src = '/assets/trainCustomIcon.png'
    trainIcon.style.width = '56px'

    const travelName = document.createElement('h3')
    travelName.innerText = `${travel.value.name}`

    resourceNegotiationSuccessContentBoxTravelDestination.appendChild(trainIcon)
    resourceNegotiationSuccessContentBoxTravelDestination.appendChild(travelName)
    resourceNegotiationSuccessContentBox.appendChild(
      resourceNegotiationSuccessContentBoxTravelDestination,
    )

    resourceNegotiationSuccessContentBoxWrapper.appendChild(resourceNegotiationSuccessContentBox)
    resourceNegotiationSuccessContentBoxExtraWrapper.appendChild(
      resourceNegotiationSuccessContentBoxWrapper,
    )
    this.resourceNegotiationSuccessBox.appendChild(resourceNegotiationSuccessContentBoxExtraWrapper)

    // OK Button
    const resourceNegotiationSuccessOkButtonExtraWrapper = document.createElement('div')
    resourceNegotiationSuccessOkButtonExtraWrapper.id =
      'resourceNegotiationSuccessOkButtonExtraWrapper'
    const resourceNegotiationSuccessOkButtonWrapper = document.createElement('div')
    resourceNegotiationSuccessOkButtonWrapper.id = 'resourceNegotiationSuccessOkButtonWrapper'
    const resourceNegotiationSuccessOkButton = document.createElement('button')
    resourceNegotiationSuccessOkButton.id = 'resourceNegotiationSuccessOkButton'
    resourceNegotiationSuccessOkButton.innerText = 'OK'
    resourceNegotiationSuccessOkButton.addEventListener('click', () => {
      resourceNegotiationSuccessOkButtonExtraWrapper.id =
        resourceNegotiationSuccessOkButtonExtraWrapper.id ===
        'resourceNegotiationSuccessOkButtonExtraWrapperActive'
          ? 'resourceNegotiationSuccessOkButtonExtraWrapper'
          : 'resourceNegotiationSuccessOkButtonExtraWrapperActive'
      resourceNegotiationSuccessOkButtonWrapper.id =
        resourceNegotiationSuccessOkButtonWrapper.id ===
        'resourceNegotiationSuccessOkButtonWrapperActive'
          ? 'resourceNegotiationSuccessOkButtonWrapper'
          : 'resourceNegotiationSuccessOkButtonWrapperActive'
      resourceNegotiationSuccessOkButton.id =
        resourceNegotiationSuccessOkButton.id === 'resourceNegotiationSuccessOkButtonActive'
          ? 'resourceNegotiationSuccessOkButton'
          : 'resourceNegotiationSuccessOkButtonActive'

      this.close()
    })
    resourceNegotiationSuccessOkButtonWrapper.appendChild(resourceNegotiationSuccessOkButton)
    resourceNegotiationSuccessOkButtonExtraWrapper.appendChild(
      resourceNegotiationSuccessOkButtonWrapper,
    )
    this.resourceNegotiationSuccessBox.appendChild(resourceNegotiationSuccessOkButtonExtraWrapper)
  }

  public show(): void {
    if (!document.getElementById(ResourceNegotiationSuccessView.resourceNegotiationSuccessBoxID)) {
      window.document.body.appendChild(this.resourceNegotiationSuccessBox)
    }
  }

  public close(): void {
    document
      .getElementById(ResourceNegotiationSuccessView.resourceNegotiationSuccessBoxID)
      ?.remove()
    this.onClose()
  }
}
