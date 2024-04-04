import { type ClassResourceRepresentation } from '../../apis/game/Types'
import { type TradeEquipment } from '../../services/game/Types'
import { getResourceMapping } from '../GameUtils'
import { ImageCropper } from '../tools/ImageCropper'

export class TradeSuccessView {
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]
  private readonly cropper: ImageCropper
  private readonly onClose: () => void
  private static readonly tradeSuccessBoxID = 'tradeSuccessBox'
  private readonly tradeSuccessBox: HTMLDivElement

  constructor(
    resourceURL: string,
    resourceRepresentation: ClassResourceRepresentation[],
    currPlayerId: string,
    currPlayerOffers: TradeEquipment,
    otherPlayerId: string,
    otherPlayerOffers: TradeEquipment,
    onClose: () => void,
  ) {
    this.resourceURL = resourceURL
    this.resourceRepresentation = resourceRepresentation
    this.cropper = new ImageCropper()
    this.onClose = onClose

    // Container
    this.tradeSuccessBox = document.createElement('div')
    this.tradeSuccessBox.id = TradeSuccessView.tradeSuccessBoxID

    // Header
    const tradeSuccessBoxHeaderWrapper = document.createElement('div')
    tradeSuccessBoxHeaderWrapper.id = 'tradeSuccessBoxHeaderWrapper'

    const tradeSuccessBoxHeader = document.createElement('div')
    tradeSuccessBoxHeader.id = 'tradeSuccessBoxHeader'

    const tradeSucceessBoxHeaderTitle = document.createElement('h1')
    tradeSucceessBoxHeaderTitle.innerText = 'HANDEL'

    const leftArrows = document.createElement('div')
    const leftArrowsLeftArrowIcon = document.createElement('img')
    leftArrowsLeftArrowIcon.src = '/assets/leftArrowCustomIcon.png'
    leftArrowsLeftArrowIcon.style.width = '54px'
    const leftArrowsRightArrowIcon = document.createElement('img')
    leftArrowsRightArrowIcon.src = '/assets/rightArrowCustomIcon.png'
    leftArrowsRightArrowIcon.style.width = '54px'
    leftArrows.appendChild(leftArrowsLeftArrowIcon)
    leftArrows.appendChild(leftArrowsRightArrowIcon)

    const rightArrows = document.createElement('div')
    const rightArrowsLeftArrowIcon = document.createElement('img')
    rightArrowsLeftArrowIcon.src = '/assets/leftArrowCustomIcon.png'
    rightArrowsLeftArrowIcon.style.width = '54px'
    const rightArrowsRightArrowIcon = document.createElement('img')
    rightArrowsRightArrowIcon.src = '/assets/rightArrowCustomIcon.png'
    rightArrowsRightArrowIcon.style.width = '54px'
    rightArrows.appendChild(rightArrowsLeftArrowIcon)
    rightArrows.appendChild(rightArrowsRightArrowIcon)

    tradeSuccessBoxHeader.appendChild(leftArrows)
    tradeSuccessBoxHeader.appendChild(tradeSucceessBoxHeaderTitle)
    tradeSuccessBoxHeader.appendChild(rightArrows)
    tradeSuccessBoxHeaderWrapper.appendChild(tradeSuccessBoxHeader)

    // Success information
    const tradeSuccessBoxInformationBoxWrapper = document.createElement('div')
    tradeSuccessBoxInformationBoxWrapper.id = 'tradeSuccessBoxInformationBoxWrapper'
    const tradeSuccessBoxInformationBox = document.createElement('div')
    tradeSuccessBoxInformationBox.id = 'tradeSuccessBoxInformationBox'
    const tradeSuccessBoxInformationBoxText = document.createElement('h1')
    tradeSuccessBoxInformationBoxText.innerText = 'Wymiana zakończona sukcesem!'
    const leftSuccessIcon = document.createElement('img')
    leftSuccessIcon.src = '/assets/successCustomIcon.png'
    leftSuccessIcon.style.width = '20px'
    const rightSuccessIcon = document.createElement('img')
    rightSuccessIcon.src = '/assets/successCustomIcon.png'
    rightSuccessIcon.style.width = '20px'

    tradeSuccessBoxInformationBox.appendChild(leftSuccessIcon)
    tradeSuccessBoxInformationBox.appendChild(tradeSuccessBoxInformationBoxText)
    tradeSuccessBoxInformationBox.appendChild(rightSuccessIcon)

    tradeSuccessBoxInformationBoxWrapper.appendChild(tradeSuccessBoxInformationBox)

    // Content
    const tradeSuccessBoxContentBoxExtraWrapper = document.createElement('div')
    tradeSuccessBoxContentBoxExtraWrapper.id = 'tradeSuccessBoxContentBoxExtraWrapper'
    const tradeSuccessBoxContentBoxWrapper = document.createElement('div')
    tradeSuccessBoxContentBoxWrapper.id = 'tradeSuccessBoxContentBoxWrapper'
    const tradeSuccessBoxContentBox = document.createElement('div')
    tradeSuccessBoxContentBox.id = 'tradeSuccessBoxContentBox'

    const currentUserId = document.createElement('h2')
    currentUserId.innerText = currPlayerId
    const otherUserId = document.createElement('h2')
    otherUserId.innerText = otherPlayerId

    const resourcesBox = document.createElement('div')
    resourcesBox.id = 'tradeSuccessBoxContentBoxResourcesBox'

    const currPlayerResourcesBox = document.createElement('div')
    const currPlayerResourcesBoxResources = document.createElement('div')
    currPlayerResourcesBoxResources.id = 'tradeSuccessBoxContentBoxResourcesCurrPlayer'
    if (otherPlayerOffers.money > 0) {
      const moneyContainer = document.createElement('div')

      const moneyIconWrapper = document.createElement('div')
      const moneyIcon = document.createElement('img')
      moneyIcon.src = '/assets/coinCustomIcon.png'
      moneyIcon.style.width = '25px'
      moneyIconWrapper.appendChild(moneyIcon)
      moneyContainer.appendChild(moneyIconWrapper)

      const moneyValueWrapper = document.createElement('div')
      const moneyValue = document.createElement('h4')
      moneyValue.innerText = `${otherPlayerOffers.money}`
      moneyValueWrapper.appendChild(moneyValue)
      moneyContainer.appendChild(moneyValueWrapper)

      currPlayerResourcesBoxResources.appendChild(moneyContainer)
    }
    for (const resource of otherPlayerOffers.resources) {
      if (resource.value > 0) {
        const itemContainer = document.createElement('div')

        const itemIconWrapper = document.createElement('div')
        const itemIcon = this.cropper.crop(
          25,
          25,
          1,
          this.resourceURL,
          resourceRepresentation.length,
          getResourceMapping(this.resourceRepresentation)(resource.key),
          false,
        )
        itemIconWrapper.appendChild(itemIcon)
        itemContainer.appendChild(itemIconWrapper)

        const itemValueWrapper = document.createElement('div')
        const itemValue = document.createElement('h4')
        itemValue.innerText = `${resource.value}`
        itemValueWrapper.appendChild(itemValue)
        itemContainer.appendChild(itemValueWrapper)

        currPlayerResourcesBoxResources.appendChild(itemContainer)
      }
    }
    const leftTransferIcon = document.createElement('img')
    leftTransferIcon.src = '/assets/tradeLeftArrowCustomIcon.png'
    leftTransferIcon.style.width = '400px'
    currPlayerResourcesBox.appendChild(currPlayerResourcesBoxResources)
    currPlayerResourcesBox.appendChild(leftTransferIcon)

    const otherPlayerResourcesBox = document.createElement('div')
    const otherPlayerResourcesBoxResources = document.createElement('div')
    otherPlayerResourcesBoxResources.id = 'tradeSuccessBoxContentBoxResourcesOtherPlayer'
    if (currPlayerOffers.money > 0) {
      const moneyContainer = document.createElement('div')

      const moneyIconWrapper = document.createElement('div')
      const moneyIcon = document.createElement('img')
      moneyIcon.src = '/assets/coinCustomIcon.png'
      moneyIcon.style.width = '25px'
      moneyIconWrapper.appendChild(moneyIcon)
      moneyContainer.appendChild(moneyIconWrapper)

      const moneyValueWrapper = document.createElement('div')
      const moneyValue = document.createElement('h4')
      moneyValue.innerText = `${currPlayerOffers.money}`
      moneyValueWrapper.appendChild(moneyValue)
      moneyContainer.appendChild(moneyValueWrapper)

      otherPlayerResourcesBoxResources.appendChild(moneyContainer)
    }
    for (const resource of currPlayerOffers.resources) {
      if (resource.value > 0) {
        const itemContainer = document.createElement('div')

        const itemIconWrapper = document.createElement('div')
        const itemIcon = this.cropper.crop(
          25,
          25,
          1,
          this.resourceURL,
          resourceRepresentation.length,
          getResourceMapping(this.resourceRepresentation)(resource.key),
          false,
        )
        itemIconWrapper.appendChild(itemIcon)
        itemContainer.appendChild(itemIconWrapper)

        const itemValueWrapper = document.createElement('div')
        const itemValue = document.createElement('h4')
        itemValue.innerText = `${resource.value}`
        itemValueWrapper.appendChild(itemValue)
        itemContainer.appendChild(itemValueWrapper)

        otherPlayerResourcesBoxResources.appendChild(itemContainer)
      }
    }
    const rightTransferIcon = document.createElement('img')
    rightTransferIcon.src = '/assets/tradeRightArrowCustomIcon.png'
    rightTransferIcon.style.width = '400px'
    otherPlayerResourcesBox.appendChild(otherPlayerResourcesBoxResources)
    otherPlayerResourcesBox.appendChild(rightTransferIcon)

    resourcesBox.appendChild(currPlayerResourcesBox)
    resourcesBox.appendChild(otherPlayerResourcesBox)

    tradeSuccessBoxContentBox.appendChild(currentUserId)
    tradeSuccessBoxContentBox.appendChild(resourcesBox)
    tradeSuccessBoxContentBox.appendChild(otherUserId)

    tradeSuccessBoxContentBoxWrapper.appendChild(tradeSuccessBoxContentBox)
    tradeSuccessBoxContentBoxExtraWrapper.appendChild(tradeSuccessBoxContentBoxWrapper)

    // Ok button
    const tradeSuccessBoxOkButtonExtraWrapper = document.createElement('div')
    tradeSuccessBoxOkButtonExtraWrapper.id = 'tradeSuccessBoxOkButtonExtraWrapper'
    const tradeSuccessBoxOkButtonWrapper = document.createElement('div')
    tradeSuccessBoxOkButtonWrapper.id = 'tradeSuccessBoxOkButtonWrapper'
    const tradeSuccessBoxOkButton = document.createElement('button')
    tradeSuccessBoxOkButton.id = 'tradeSuccessBoxOkButton'
    tradeSuccessBoxOkButton.innerText = 'OK'
    tradeSuccessBoxOkButton.addEventListener('click', () => {
      tradeSuccessBoxOkButtonExtraWrapper.id =
        tradeSuccessBoxOkButtonExtraWrapper.id === 'tradeSuccessBoxOkButtonExtraWrapperActive'
          ? 'tradeSuccessBoxOkButtonExtraWrapper'
          : 'tradeSuccessBoxOkButtonExtraWrapperActive'
      tradeSuccessBoxOkButtonWrapper.id =
        tradeSuccessBoxOkButtonWrapper.id === 'tradeSuccessBoxOkButtonWrapperActive'
          ? 'tradeSuccessBoxOkButtonWrapper'
          : 'tradeSuccessBoxOkButtonWrapperActive'
      tradeSuccessBoxOkButton.id =
        tradeSuccessBoxOkButton.id === 'tradeSuccessBoxOkButtonActive'
          ? 'tradeSuccessBoxOkButton'
          : 'tradeSuccessBoxOkButtonActive'

      this.close()
    })
    tradeSuccessBoxOkButtonWrapper.appendChild(tradeSuccessBoxOkButton)
    tradeSuccessBoxOkButtonExtraWrapper.appendChild(tradeSuccessBoxOkButtonWrapper)

    // Append all
    this.tradeSuccessBox.appendChild(tradeSuccessBoxHeaderWrapper)
    this.tradeSuccessBox.appendChild(tradeSuccessBoxInformationBoxWrapper)
    this.tradeSuccessBox.appendChild(tradeSuccessBoxContentBoxExtraWrapper)
    this.tradeSuccessBox.appendChild(tradeSuccessBoxOkButtonExtraWrapper)
  }

  public show(): void {
    if (!document.getElementById(TradeSuccessView.tradeSuccessBoxID)) {
      window.document.body.appendChild(this.tradeSuccessBox)
    }
  }

  public close(): void {
    document.getElementById(TradeSuccessView.tradeSuccessBoxID)?.remove()
    this.onClose()
  }
}
