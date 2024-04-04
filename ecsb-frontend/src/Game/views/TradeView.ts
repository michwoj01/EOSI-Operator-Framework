import { type Scene } from '../scenes/Scene'
import { type TradeEquipment } from '../../services/game/Types'
import { CloudType } from '../scenes/Types'
import { type ClassResourceRepresentation } from '../../apis/game/Types'
import { ImageCropper } from '../tools/ImageCropper'
import { getResourceMapping } from '../GameUtils'
import { TradeSuccessView } from './TradeSuccessView'

export class TradeView {
  private static readonly maxPlayerIdLength = 24
  private readonly scene: Scene
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]
  private readonly cropper: ImageCropper
  /* Players data */
  private isCurrPlayerTurn: boolean
  private readonly currPlayerEq: TradeEquipment
  private readonly currPlayerId: string
  private readonly otherPlayerId: string
  private youOffer: TradeEquipment
  private youGet: TradeEquipment
  private youOfferPrevious: TradeEquipment
  private youGetPrevious: TradeEquipment
  private changesDone: number
  private isFirstOffer: boolean
  /* TradeBox */
  public static readonly tradeBoxWrapperID = 'tradeBoxWrapper'
  public static readonly tradeBoxHeaderWrapperID = 'tradeBoxHeaderWrapper'
  public static readonly tradeBoxHeaderID = 'tradeBoxHeader'
  public static readonly tradeBoxCloseButtonID = 'tradeBoxCloseButton'
  /* TradeBox - Content */
  public static readonly tradeBoxContentID = 'tradeBoxContent'
  public static readonly tradeBoxContentLeftWrapperID = 'tradeBoxContentLeftWrapper'
  public static readonly tradeBoxContentLeftWrapperTitleWrapperID =
    'tradeBoxContentLeftWrapperTitleWrapper'
  public static readonly tradeBoxContentLeftWrapperTitleID = 'tradeBoxContentLeftWrapperTitle'
  public static readonly tradeBoxContentMiddleID = 'tradeBoxContentMiddle'
  public static readonly tradeBoxContentRightWrapperID = 'tradeBoxContentRightWrapper'
  public static readonly tradeBoxContentRightWrapperTitleWrapperID =
    'tradeBoxContentRightWrapperTitleWrapper'
  public static readonly tradeBoxContentRightWrapperTitleID = 'tradeBoxContentRightWrapperTitle'
  /* TradeBox - Propose Button */
  public static readonly tradeBoxProposeButtonExtraWrapperID = 'tradeBoxProposeButtonExtraWrapper'
  public static readonly tradeBoxProposeButtonWrapperID = 'tradeBoxProposeButtonWrapper'
  public static readonly tradeBoxProposeButtonID = 'tradeBoxProposeButton'
  /* TradeBox - Accept Button */
  public static readonly tradeBoxAcceptButtonExtraWrapperID = 'tradeBoxAcceptButtonExtraWrapper'
  public static readonly tradeBoxAcceptButtonWrapperID = 'tradeBoxAcceptButtonWrapper'
  public static readonly tradeBoxAcceptButtonID = 'tradeBoxAcceptButton'
  /* HTML Elements */
  private readonly tradeBoxWrapper: HTMLDivElement
  private readonly tradeBoxCurrPlayerTurnHeader: HTMLHeadingElement
  private readonly tradeBoxProposeButtonExtraWrapper: HTMLDivElement
  private readonly tradeBoxProposeButtonWrapper: HTMLDivElement
  private readonly tradeBoxProposeButton: HTMLButtonElement
  private readonly tradeBoxAcceptButtonExtraWrapper: HTMLDivElement
  private readonly tradeBoxAcceptButtonWrapper: HTMLDivElement
  private readonly tradeBoxAcceptButton: HTMLButtonElement
  private readonly resourceButtons: HTMLButtonElement[] = []

  constructor(
    scene: Scene,
    isCurrPlayerTurn: boolean,
    currPlayerId: string,
    currPlayerEq: TradeEquipment,
    otherPlayerId: string,
    resourceURL: string,
    resourceRepresentation: ClassResourceRepresentation[],
  ) {
    this.scene = scene
    this.currPlayerEq = currPlayerEq
    this.currPlayerId = currPlayerId
    this.otherPlayerId = otherPlayerId
    this.isCurrPlayerTurn = isCurrPlayerTurn
    this.resourceURL = resourceURL
    this.resourceRepresentation = resourceRepresentation
    this.cropper = new ImageCropper()
    this.youOffer = {
      money: 0,
      resources: currPlayerEq.resources.map((resource) => ({ key: resource.key, value: 0 })),
    }
    this.youGet = {
      money: 0,
      resources: currPlayerEq.resources.map((resource) => ({ key: resource.key, value: 0 })),
    }
    this.youOfferPrevious = {
      money: 0,
      resources: currPlayerEq.resources.map((resource) => ({ key: resource.key, value: 0 })),
    }
    this.youGetPrevious = {
      money: 0,
      resources: currPlayerEq.resources.map((resource) => ({ key: resource.key, value: 0 })),
    }
    this.changesDone = 0
    this.isFirstOffer = true

    // Wrapper
    this.tradeBoxWrapper = document.createElement('div')
    this.tradeBoxWrapper.id = TradeView.tradeBoxWrapperID

    // Header
    const tradeBoxHeaderWrapper = document.createElement('div')
    tradeBoxHeaderWrapper.id = TradeView.tradeBoxHeaderWrapperID

    const tradeBoxHeader = document.createElement('div')
    tradeBoxHeader.id = TradeView.tradeBoxHeaderID

    const workshopTitleHeader = document.createElement('h1')
    workshopTitleHeader.innerText = 'HANDEL'

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

    tradeBoxHeader.appendChild(leftArrows)
    tradeBoxHeader.appendChild(workshopTitleHeader)
    tradeBoxHeader.appendChild(rightArrows)
    tradeBoxHeaderWrapper.appendChild(tradeBoxHeader)

    const tradeBoxCloseButton = document.createElement('button')
    tradeBoxCloseButton.id = TradeView.tradeBoxCloseButtonID
    tradeBoxCloseButton.addEventListener('click', () => {
      scene.cancelTrade()
      const cloud = document.getElementById(`actionCloud-${this.scene.playerId}`)
      if (cloud) {
        cloud.style.visibility = 'hidden'
      }
      this.close(false)
    })
    const XIcon = document.createElement('i')
    XIcon.className = 'fa fa-times'
    XIcon.ariaHidden = 'true'
    XIcon.style.color = 'black'
    tradeBoxCloseButton.appendChild(XIcon)
    tradeBoxHeaderWrapper.appendChild(tradeBoxCloseButton)

    // Content
    const tradeBoxContent = document.createElement('div')
    tradeBoxContent.id = TradeView.tradeBoxContentID

    // Content left
    const tradeBoxContentLeftExtraWrapper = document.createElement('div')
    tradeBoxContentLeftExtraWrapper.id = 'tradeBoxContentLeftExtraWrapper'

    const tradeBoxContentLeftWrapper = document.createElement('div')
    tradeBoxContentLeftWrapper.id = TradeView.tradeBoxContentLeftWrapperID

    const tradeBoxContentLeftWrapperTitleExtraWrapper = document.createElement('div')
    tradeBoxContentLeftWrapperTitleExtraWrapper.id = 'tradeBoxContentLeftWrapperTitleExtraWrapper'
    const tradeBoxContentLeftWrapperTitleWrapper = document.createElement('div')
    tradeBoxContentLeftWrapperTitleWrapper.id = TradeView.tradeBoxContentLeftWrapperTitleWrapperID
    const tradeBoxContentLeftWrapperTitle = document.createElement('h2')
    tradeBoxContentLeftWrapperTitle.id = TradeView.tradeBoxContentLeftWrapperTitleID
    tradeBoxContentLeftWrapperTitle.innerText = 'Oferujesz'

    tradeBoxContentLeftWrapperTitleWrapper.appendChild(tradeBoxContentLeftWrapperTitle)
    tradeBoxContentLeftWrapperTitleExtraWrapper.appendChild(tradeBoxContentLeftWrapperTitleWrapper)

    const tradeBoxContentLeft = document.createElement('div')
    tradeBoxContentLeft.id = 'tradeBoxContentLeft'
    this.fillCurrentPlayerEq(currPlayerId, tradeBoxContentLeft, this.youOffer, currPlayerEq)

    tradeBoxContentLeftWrapper.appendChild(tradeBoxContentLeft)
    tradeBoxContentLeftExtraWrapper.appendChild(tradeBoxContentLeftWrapper)
    tradeBoxContentLeftExtraWrapper.appendChild(tradeBoxContentLeftWrapperTitleExtraWrapper)

    // Content right
    const tradeBoxContentRightExtraWrapper = document.createElement('div')
    tradeBoxContentRightExtraWrapper.id = 'tradeBoxContentRightExtraWrapper'

    const tradeBoxContentRightWrapper = document.createElement('div')
    tradeBoxContentRightWrapper.id = TradeView.tradeBoxContentRightWrapperID

    const tradeBoxContentRightWrapperTitleExtraWrapper = document.createElement('div')
    tradeBoxContentRightWrapperTitleExtraWrapper.id = 'tradeBoxContentRightWrapperTitleExtraWrapper'
    const tradeBoxContentRightWrapperTitleWrapper = document.createElement('div')
    tradeBoxContentRightWrapperTitleWrapper.id = TradeView.tradeBoxContentRightWrapperTitleWrapperID
    const tradeBoxContentRightWrapperTitle = document.createElement('h2')
    tradeBoxContentRightWrapperTitle.id = TradeView.tradeBoxContentRightWrapperTitleID
    tradeBoxContentRightWrapperTitle.innerText = 'Otrzymujesz'
    tradeBoxContentRightWrapperTitleWrapper.appendChild(tradeBoxContentRightWrapperTitle)
    tradeBoxContentRightWrapperTitleExtraWrapper.appendChild(
      tradeBoxContentRightWrapperTitleWrapper,
    )

    const tradeBoxContentRight = document.createElement('div')
    tradeBoxContentRight.id = 'tradeBoxContentRight'
    this.fillOtherPlayerEq(otherPlayerId, tradeBoxContentRight, this.youGet)

    tradeBoxContentRightWrapper.appendChild(tradeBoxContentRight)
    tradeBoxContentRightExtraWrapper.appendChild(tradeBoxContentRightWrapper)
    tradeBoxContentRightExtraWrapper.appendChild(tradeBoxContentRightWrapperTitleExtraWrapper)

    // Content middle
    const tradeBoxContentMiddle = document.createElement('div')
    tradeBoxContentMiddle.id = TradeView.tradeBoxContentMiddleID

    const userTurnWrapper = document.createElement('div')
    userTurnWrapper.id = 'userTurnWrapper'
    this.tradeBoxCurrPlayerTurnHeader = document.createElement('h2')
    this.updatePlayerTurnElements()
    userTurnWrapper.appendChild(this.tradeBoxCurrPlayerTurnHeader)
    tradeBoxContentMiddle.appendChild(userTurnWrapper)

    const middleArrows = document.createElement('div')
    middleArrows.id = 'middleArrows'
    const middleArrowsLeft = document.createElement('img')
    middleArrowsLeft.src = '/assets/leftArrowCustomIcon.png'
    middleArrowsLeft.style.width = '100px'
    const middleArrowsRight = document.createElement('img')
    middleArrowsRight.src = '/assets/rightArrowCustomIcon.png'
    middleArrowsRight.style.width = '100px'
    middleArrows.appendChild(middleArrowsLeft)
    middleArrows.appendChild(middleArrowsRight)
    tradeBoxContentMiddle.appendChild(middleArrows)

    this.tradeBoxProposeButtonExtraWrapper = document.createElement('div')
    this.tradeBoxProposeButtonExtraWrapper.id = TradeView.tradeBoxProposeButtonExtraWrapperID
    this.tradeBoxProposeButtonWrapper = document.createElement('div')
    this.tradeBoxProposeButtonWrapper.id = TradeView.tradeBoxProposeButtonWrapperID
    this.tradeBoxProposeButton = document.createElement('button')
    this.tradeBoxProposeButton.id = TradeView.tradeBoxProposeButtonID
    this.tradeBoxProposeButton.innerText = 'ZAPROPONUJ'
    this.tradeBoxProposeButton.addEventListener('click', () => {
      if (this.isCurrPlayerTurn) {
        this.tradeBoxProposeButtonExtraWrapper.className =
          this.tradeBoxProposeButtonExtraWrapper.className ===
          'tradeBoxMiddleButtonExtraWrapperEnabledActive'
            ? 'tradeBoxMiddleButtonExtraWrapperEnabled'
            : 'tradeBoxMiddleButtonExtraWrapperEnabledActive'

        this.tradeBoxProposeButtonWrapper.className =
          this.tradeBoxProposeButtonWrapper.className === 'tradeBoxMiddleButtonWrapperEnabledActive'
            ? 'tradeBoxMiddleButtonWrapperEnabled'
            : 'tradeBoxMiddleButtonWrapperEnabledActive'

        this.tradeBoxProposeButton.className =
          this.tradeBoxProposeButton.className === 'tradeBoxMiddleButtonEnabledActive'
            ? 'tradeBoxMiddleButtonEnabled'
            : 'tradeBoxMiddleButtonEnabledActive'

        this.disableProposeButton()

        scene.sendTradeBid(this.youOffer, this.youGet)
        this.isCurrPlayerTurn = false
        this.updatePlayerTurnElements()
        this.youOfferPrevious = JSON.parse(JSON.stringify(this.youOffer))
        this.youGetPrevious = JSON.parse(JSON.stringify(this.youGet))
      }
    })
    this.disableProposeButton()

    this.tradeBoxProposeButtonWrapper.appendChild(this.tradeBoxProposeButton)
    this.tradeBoxProposeButtonExtraWrapper.appendChild(this.tradeBoxProposeButtonWrapper)
    tradeBoxContentMiddle.appendChild(this.tradeBoxProposeButtonExtraWrapper)

    this.tradeBoxAcceptButtonExtraWrapper = document.createElement('div')
    this.tradeBoxAcceptButtonExtraWrapper.id = TradeView.tradeBoxProposeButtonExtraWrapperID
    this.tradeBoxAcceptButtonWrapper = document.createElement('div')
    this.tradeBoxAcceptButtonWrapper.id = TradeView.tradeBoxProposeButtonWrapperID
    this.tradeBoxAcceptButton = document.createElement('button')
    this.tradeBoxAcceptButton.id = TradeView.tradeBoxProposeButtonID
    this.tradeBoxAcceptButton.innerText = 'POTWIERDŹ'
    this.tradeBoxAcceptButton.addEventListener('click', () => {
      if (this.isCurrPlayerTurn) {
        this.tradeBoxAcceptButtonExtraWrapper.className =
          this.tradeBoxAcceptButtonExtraWrapper.className ===
          'tradeBoxMiddleButtonExtraWrapperEnabledActive'
            ? 'tradeBoxMiddleButtonExtraWrapperEnabled'
            : 'tradeBoxMiddleButtonExtraWrapperEnabledActive'

        this.tradeBoxAcceptButtonWrapper.className =
          this.tradeBoxAcceptButtonWrapper.className === 'tradeBoxMiddleButtonWrapperEnabledActive'
            ? 'tradeBoxMiddleButtonWrapperEnabled'
            : 'tradeBoxMiddleButtonWrapperEnabledActive'

        this.tradeBoxAcceptButton.className =
          this.tradeBoxAcceptButton.className === 'tradeBoxMiddleButtonEnabledActive'
            ? 'tradeBoxMiddleButtonEnabled'
            : 'tradeBoxMiddleButtonEnabledActive'

        scene.finishTrade(this.youOffer, this.youGet)
      }
    })
    this.disableAcceptButton()

    this.tradeBoxAcceptButtonWrapper.appendChild(this.tradeBoxAcceptButton)
    this.tradeBoxAcceptButtonExtraWrapper.appendChild(this.tradeBoxAcceptButtonWrapper)
    tradeBoxContentMiddle.appendChild(this.tradeBoxAcceptButtonExtraWrapper)

    tradeBoxContent.appendChild(tradeBoxContentLeftExtraWrapper)
    tradeBoxContent.appendChild(tradeBoxContentMiddle)
    tradeBoxContent.appendChild(tradeBoxContentRightExtraWrapper)
    this.tradeBoxWrapper.appendChild(tradeBoxHeaderWrapper)
    this.tradeBoxWrapper.appendChild(tradeBoxContent)
  }

  public update(youOffer: TradeEquipment, youGet: TradeEquipment): void {
    this.youOffer = youOffer
    this.youGet = youGet
    this.changesDone = 0
    this.isFirstOffer = false

    document.getElementById('tradeBoxContentLeft')?.remove()
    const tradeBoxContentLeft = document.createElement('div')
    tradeBoxContentLeft.id = 'tradeBoxContentLeft'
    this.fillCurrentPlayerEq(
      this.currPlayerId,
      tradeBoxContentLeft,
      this.youOffer,
      this.currPlayerEq,
    )
    document.getElementById('tradeBoxContentLeftWrapper')?.appendChild(tradeBoxContentLeft)

    document.getElementById('tradeBoxContentRight')?.remove()
    const tradeBoxContentRight = document.createElement('div')
    tradeBoxContentRight.id = 'tradeBoxContentRight'
    this.fillOtherPlayerEq(this.otherPlayerId, tradeBoxContentRight, this.youGet)
    document.getElementById('tradeBoxContentRightWrapper')?.appendChild(tradeBoxContentRight)

    if (
      this.youOffer.money <= this.currPlayerEq.money &&
      this.youOffer.resources.every(
        (resource) =>
          resource.value <= this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
      )
    ) {
      this.enableAcceptButton()
    } else {
      this.disableAcceptButton()
    }

    this.disableProposeButton()
  }

  private fillCurrentPlayerEq(
    playerId: string,
    container: HTMLDivElement,
    currentState: TradeEquipment,
    limitedState: TradeEquipment,
  ): void {
    const bid = JSON.parse(JSON.stringify(currentState))

    const userName = document.createElement('h3')
    userName.innerText =
      playerId.length > TradeView.maxPlayerIdLength
        ? playerId.slice(0, TradeView.maxPlayerIdLength) + '...'
        : playerId
    container.appendChild(userName)

    const lineSeparator = document.createElement('hr')
    container.appendChild(lineSeparator)

    const resourcesWrapper = document.createElement('div')
    resourcesWrapper.id = 'tradeBoxContentLeftResources'
    for (const resource of currentState.resources) {
      const upperBoundary = limitedState.resources.find((item) => item.key === resource.key)!.value

      const resourceContainer = document.createElement('div')

      const resourceIconWrapper = document.createElement('div')
      const resourceIcon = this.cropper.crop(
        25,
        25,
        1,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      resourceIconWrapper.appendChild(resourceIcon)
      resourceContainer.appendChild(resourceIconWrapper)

      const resourceValueWrapper = document.createElement('div')
      const valueWrapper = document.createElement('div')
      const value = document.createElement('h4')
      value.innerText = `${resource.value}`
      value.style.color = resource.value > upperBoundary ? 'red' : 'black'
      valueWrapper.appendChild(value)

      const tradeBoxPlayerOfferEqItemBtnUp = document.createElement('button')
      const plus = document.createElement('i')
      plus.className = 'fa fa-plus'
      plus.ariaHidden = 'true'
      tradeBoxPlayerOfferEqItemBtnUp.appendChild(plus)
      tradeBoxPlayerOfferEqItemBtnUp.addEventListener('click', () => {
        if (this.isCurrPlayerTurn && upperBoundary > resource.value) {
          value.innerText = `${parseInt(value.innerText) + 1}`
          resource.value += 1
          value.style.color = resource.value > upperBoundary ? 'red' : 'black'

          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value + 1
          ) {
            this.changesDone += 1
          }
          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value
          ) {
            this.changesDone -= 1
          }

          if (
            this.changesDone !== 0 &&
            (this.youGet.resources.some((resource) => resource.value > 0) ||
              this.youOffer.resources.some((resource) => resource.value > 0) ||
              this.youGet.money > 0 ||
              this.youOffer.money > 0)
          ) {
            if (
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableProposeButton()
            }
            if (!this.isFirstOffer) {
              this.disableAcceptButton()
            }
          } else if (this.changesDone !== 0) {
            this.disableProposeButton()
            this.disableAcceptButton()
          } else {
            this.disableProposeButton()
            if (
              !this.isFirstOffer &&
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableAcceptButton()
            }
          }

          if (resource.value === 0) {
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}`)!.style.display =
              'none'
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}-value`)!.innerText =
              '0'
          } else {
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}`)!.style.display =
              'flex'
            document.getElementById(
              `tradeBoxContentLeftResult-${resource.key}-value`,
            )!.innerText = `${resource.value}`
          }

          this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
        }
      })
      this.resourceButtons.push(tradeBoxPlayerOfferEqItemBtnUp)

      const tradeBoxPlayerOfferEqItemBtnDown = document.createElement('button')
      const minus = document.createElement('i')
      minus.className = 'fa fa-minus'
      minus.ariaHidden = 'true'
      tradeBoxPlayerOfferEqItemBtnDown.appendChild(minus)
      tradeBoxPlayerOfferEqItemBtnDown.addEventListener('click', () => {
        if (this.isCurrPlayerTurn && resource.value > 0) {
          value.innerText = `${parseInt(value.innerText) - 1}`
          resource.value -= 1
          value.style.color = resource.value > upperBoundary ? 'red' : 'black'

          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value - 1
          ) {
            this.changesDone += 1
          }
          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value
          ) {
            this.changesDone -= 1
          }

          if (
            this.changesDone !== 0 &&
            (this.youGet.resources.some((resource) => resource.value > 0) ||
              this.youOffer.resources.some((resource) => resource.value > 0) ||
              this.youGet.money > 0 ||
              this.youOffer.money > 0)
          ) {
            if (
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableProposeButton()
            }
            if (!this.isFirstOffer) {
              this.disableAcceptButton()
            }
          } else if (this.changesDone !== 0) {
            this.disableProposeButton()
            this.disableAcceptButton()
          } else {
            this.disableProposeButton()
            if (
              !this.isFirstOffer &&
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableAcceptButton()
            }
          }

          if (resource.value === 0) {
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}`)!.style.display =
              'none'
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}-value`)!.innerText =
              '0'
          } else {
            document.getElementById(`tradeBoxContentLeftResult-${resource.key}`)!.style.display =
              'flex'
            document.getElementById(
              `tradeBoxContentLeftResult-${resource.key}-value`,
            )!.innerText = `${resource.value}`
          }

          this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
        }
      })
      this.resourceButtons.push(tradeBoxPlayerOfferEqItemBtnDown)

      resourceValueWrapper.appendChild(tradeBoxPlayerOfferEqItemBtnDown)
      resourceValueWrapper.appendChild(valueWrapper)
      resourceValueWrapper.appendChild(tradeBoxPlayerOfferEqItemBtnUp)
      resourceContainer.appendChild(resourceValueWrapper)

      resourcesWrapper.appendChild(resourceContainer)
    }

    const moneyContainer = document.createElement('div')

    const moneyIconWrapper = document.createElement('div')
    const moneyIcon = document.createElement('img')
    moneyIcon.src = '/assets/coinCustomIcon.png'
    moneyIcon.style.width = '25px'
    moneyIconWrapper.appendChild(moneyIcon)
    moneyContainer.appendChild(moneyIconWrapper)

    const moneyValueWrapper = document.createElement('div')
    const valueWrapper = document.createElement('div')
    const value = document.createElement('h4')
    value.innerText = `${currentState.money}`
    value.style.color = currentState.money > this.currPlayerEq.money ? 'red' : 'black'
    valueWrapper.appendChild(value)

    const tradeBoxPlayerOfferEqMoneyBtnUp = document.createElement('button')
    const plus = document.createElement('i')
    plus.className = 'fa fa-plus'
    plus.ariaHidden = 'true'
    tradeBoxPlayerOfferEqMoneyBtnUp.appendChild(plus)
    tradeBoxPlayerOfferEqMoneyBtnUp.addEventListener('click', () => {
      if (this.isCurrPlayerTurn && this.currPlayerEq.money > currentState.money) {
        value.innerText = `${parseInt(value.innerText) + 1}`
        currentState.money += 1
        value.style.color = currentState.money > this.currPlayerEq.money ? 'red' : 'black'

        if (currentState.money === bid.money + 1) {
          this.changesDone += 1
        }
        if (currentState.money === bid.money) {
          this.changesDone -= 1
        }
        if (
          this.changesDone !== 0 &&
          (this.youGet.resources.some((resource) => resource.value > 0) ||
            this.youOffer.resources.some((resource) => resource.value > 0) ||
            this.youGet.money > 0 ||
            this.youOffer.money > 0)
        ) {
          if (
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableProposeButton()
          }
          if (!this.isFirstOffer) {
            this.disableAcceptButton()
          }
        } else if (this.changesDone !== 0) {
          this.disableProposeButton()
          this.disableAcceptButton()
        } else {
          this.disableProposeButton()
          if (
            !this.isFirstOffer &&
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableAcceptButton()
          }
        }

        if (currentState.money === 0) {
          document.getElementById('tradeBoxContentLeftResult-money')!.style.display = 'none'
          document.getElementById('tradeBoxContentLeftResult-money-value')!.innerText = '0'
        } else {
          document.getElementById('tradeBoxContentLeftResult-money')!.style.display = 'flex'
          document.getElementById(
            'tradeBoxContentLeftResult-money-value',
          )!.innerText = `${currentState.money}`
        }

        this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
      }
    })
    this.resourceButtons.push(tradeBoxPlayerOfferEqMoneyBtnUp)

    const tradeBoxPlayerOfferEqMoneyBtnDown = document.createElement('button')
    const minus = document.createElement('i')
    minus.className = 'fa fa-minus'
    minus.ariaHidden = 'true'
    tradeBoxPlayerOfferEqMoneyBtnDown.appendChild(minus)
    tradeBoxPlayerOfferEqMoneyBtnDown.addEventListener('click', () => {
      if (this.isCurrPlayerTurn && currentState.money > 0) {
        value.innerText = `${parseInt(value.innerText) - 1}`
        currentState.money -= 1
        value.style.color = currentState.money > this.currPlayerEq.money ? 'red' : 'black'

        if (currentState.money === bid.money - 1) {
          this.changesDone += 1
        }
        if (currentState.money === bid.money) {
          this.changesDone -= 1
        }
        if (
          this.changesDone !== 0 &&
          (this.youGet.resources.some((resource) => resource.value > 0) ||
            this.youOffer.resources.some((resource) => resource.value > 0) ||
            this.youGet.money > 0 ||
            this.youOffer.money > 0)
        ) {
          if (
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableProposeButton()
          }
          if (!this.isFirstOffer) {
            this.disableAcceptButton()
          }
        } else if (this.changesDone !== 0) {
          this.disableProposeButton()
          this.disableAcceptButton()
        } else {
          this.disableProposeButton()
          if (
            !this.isFirstOffer &&
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableAcceptButton()
          }
        }

        if (currentState.money === 0) {
          document.getElementById('tradeBoxContentLeftResult-money')!.style.display = 'none'
          document.getElementById('tradeBoxContentLeftResult-money-value')!.innerText = '0'
        } else {
          document.getElementById('tradeBoxContentLeftResult-money')!.style.display = 'flex'
          document.getElementById(
            'tradeBoxContentLeftResult-money-value',
          )!.innerText = `${currentState.money}`
        }

        this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
      }
    })
    this.resourceButtons.push(tradeBoxPlayerOfferEqMoneyBtnDown)

    moneyValueWrapper.appendChild(tradeBoxPlayerOfferEqMoneyBtnDown)
    moneyValueWrapper.appendChild(valueWrapper)
    moneyValueWrapper.appendChild(tradeBoxPlayerOfferEqMoneyBtnUp)
    moneyContainer.appendChild(moneyValueWrapper)

    resourcesWrapper.appendChild(moneyContainer)

    container.appendChild(resourcesWrapper)

    const resultExtraWrapper = document.createElement('div')
    resultExtraWrapper.id = 'tradeBoxContentLeftResultExtraWrapper'
    const resultWrapper = document.createElement('div')
    resultWrapper.id = 'tradeBoxContentLeftResultWrapper'
    const result = document.createElement('div')
    result.id = 'tradeBoxContentLeftResult'

    for (const resource of currentState.resources) {
      const resultResourceContainer = document.createElement('div')
      resultResourceContainer.id = `tradeBoxContentLeftResult-${resource.key}`

      const resultResourceIconWrapper = document.createElement('div')
      const resultResourceIcon = this.cropper.crop(
        25,
        25,
        1,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      resultResourceIconWrapper.appendChild(resultResourceIcon)
      resultResourceContainer.appendChild(resultResourceIconWrapper)

      const valueWrapper = document.createElement('div')
      const value = document.createElement('h4')
      value.id = `tradeBoxContentLeftResult-${resource.key}-value`
      value.innerText = `${resource.value}`
      valueWrapper.appendChild(value)
      resultResourceContainer.appendChild(valueWrapper)

      const exclamationMark = document.createElement('h4')
      exclamationMark.innerText = '!'
      exclamationMark.id = `tradeBoxContentLeftResult-${resource.key}-exclamationMark`
      exclamationMark.className = 'tradeBoxContentResultExclamationMark'
      resultResourceContainer.appendChild(exclamationMark)
      if (
        !this.isFirstOffer &&
        resource.value !==
          this.youOfferPrevious.resources.find((r) => r.key === resource.key)!.value
      ) {
        exclamationMark.style.display = 'block'
      } else {
        exclamationMark.style.display = 'none'
      }

      result.appendChild(resultResourceContainer)

      if (resource.value > 0) {
        resultResourceContainer.style.display = 'flex'
      } else {
        resultResourceContainer.style.display = 'none'
      }
    }

    const resultResourceContainer = document.createElement('div')
    resultResourceContainer.id = `tradeBoxContentLeftResult-money`

    const resultMoneyIconWrapper = document.createElement('div')
    const resultMoneyIcon = document.createElement('img')
    resultMoneyIcon.src = '/assets/coinCustomIcon.png'
    resultMoneyIcon.style.width = '25px'
    resultMoneyIconWrapper.appendChild(resultMoneyIcon)
    resultResourceContainer.appendChild(resultMoneyIconWrapper)

    const resultValueWrapper = document.createElement('div')
    const resultValue = document.createElement('h4')
    resultValue.id = `tradeBoxContentLeftResult-money-value`
    resultValue.innerText = `${currentState.money}`
    resultValueWrapper.appendChild(resultValue)
    resultResourceContainer.appendChild(resultValueWrapper)

    const exclamationMark = document.createElement('h4')
    exclamationMark.innerText = '!'
    exclamationMark.id = 'tradeBoxContentLeftResult-money-exclamationMark'
    exclamationMark.className = 'tradeBoxContentResultExclamationMark'
    resultResourceContainer.appendChild(exclamationMark)
    if (!this.isFirstOffer && currentState.money !== this.youOfferPrevious.money) {
      exclamationMark.style.display = 'block'
    } else {
      exclamationMark.style.display = 'none'
    }

    result.appendChild(resultResourceContainer)
    if (currentState.money > 0) {
      resultResourceContainer.style.display = 'flex'
    } else {
      resultResourceContainer.style.display = 'none'
    }

    resultWrapper.appendChild(result)

    if (this.isCurrPlayerTurn) {
      result.style.display = 'flex'
    } else {
      result.style.display = 'none'
    }

    resultExtraWrapper.appendChild(resultWrapper)
    container.appendChild(resultExtraWrapper)
  }

  private fillOtherPlayerEq(
    playerId: string,
    container: HTMLDivElement,
    currentState: TradeEquipment,
  ): void {
    const bid = JSON.parse(JSON.stringify(currentState))

    const userName = document.createElement('h3')
    userName.innerText =
      playerId.length > TradeView.maxPlayerIdLength
        ? playerId.slice(0, TradeView.maxPlayerIdLength) + '...'
        : playerId
    container.appendChild(userName)

    const lineSeparator = document.createElement('hr')
    container.appendChild(lineSeparator)

    const resourcesWrapper = document.createElement('div')
    resourcesWrapper.id = 'tradeBoxContentRightResources'

    for (const resource of currentState.resources) {
      const resourceContainer = document.createElement('div')

      const resourceIconWrapper = document.createElement('div')
      const resourceIcon = this.cropper.crop(
        25,
        25,
        1,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      resourceIconWrapper.appendChild(resourceIcon)
      resourceContainer.appendChild(resourceIconWrapper)

      const resourceValueWrapper = document.createElement('div')
      const valueWrapper = document.createElement('div')
      const value = document.createElement('h4')
      value.innerText = `${resource.value}`
      valueWrapper.appendChild(value)

      const tradeBoxPlayerOfferEqItemBtnUp = document.createElement('button')
      const plus = document.createElement('i')
      plus.className = 'fa fa-plus'
      plus.ariaHidden = 'true'
      tradeBoxPlayerOfferEqItemBtnUp.appendChild(plus)
      tradeBoxPlayerOfferEqItemBtnUp.addEventListener('click', () => {
        if (this.isCurrPlayerTurn) {
          value.innerText = `${parseInt(value.innerText) + 1}`
          resource.value += 1

          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value + 1
          ) {
            this.changesDone += 1
          }
          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value
          ) {
            this.changesDone -= 1
          }

          if (
            this.changesDone !== 0 &&
            (this.youGet.resources.some((resource) => resource.value > 0) ||
              this.youOffer.resources.some((resource) => resource.value > 0) ||
              this.youGet.money > 0 ||
              this.youOffer.money > 0)
          ) {
            if (
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableProposeButton()
            }
            if (!this.isFirstOffer) {
              this.disableAcceptButton()
            }
          } else if (this.changesDone !== 0) {
            this.disableProposeButton()
            this.disableAcceptButton()
          } else {
            this.disableProposeButton()
            if (
              !this.isFirstOffer &&
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableAcceptButton()
            }
          }

          if (resource.value === 0) {
            document.getElementById(`tradeBoxContentRightResult-${resource.key}`)!.style.display =
              'none'
            document.getElementById(`tradeBoxContentRightResult-${resource.key}-value`)!.innerText =
              '0'
          } else {
            document.getElementById(`tradeBoxContentRightResult-${resource.key}`)!.style.display =
              'flex'
            document.getElementById(
              `tradeBoxContentRightResult-${resource.key}-value`,
            )!.innerText = `${resource.value}`
          }

          this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
        }
      })
      this.resourceButtons.push(tradeBoxPlayerOfferEqItemBtnUp)

      const tradeBoxPlayerOfferEqItemBtnDown = document.createElement('button')
      const minus = document.createElement('i')
      minus.className = 'fa fa-minus'
      minus.ariaHidden = 'true'
      tradeBoxPlayerOfferEqItemBtnDown.appendChild(minus)
      tradeBoxPlayerOfferEqItemBtnDown.addEventListener('click', () => {
        if (this.isCurrPlayerTurn && resource.value > 0) {
          value.innerText = `${parseInt(value.innerText) - 1}`
          resource.value -= 1

          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value - 1
          ) {
            this.changesDone += 1
          }
          if (
            resource.value ===
            bid.resources.find((item: { key: string }) => item.key === resource.key)!.value
          ) {
            this.changesDone -= 1
          }

          if (
            this.changesDone !== 0 &&
            (this.youGet.resources.some((resource) => resource.value > 0) ||
              this.youOffer.resources.some((resource) => resource.value > 0) ||
              this.youGet.money > 0 ||
              this.youOffer.money > 0)
          ) {
            if (
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableProposeButton()
            }
            if (!this.isFirstOffer) {
              this.disableAcceptButton()
            }
          } else if (this.changesDone !== 0) {
            this.disableProposeButton()
            this.disableAcceptButton()
          } else {
            this.disableProposeButton()
            if (
              !this.isFirstOffer &&
              this.youOffer.money <= this.currPlayerEq.money &&
              this.youOffer.resources.every(
                (resource) =>
                  resource.value <=
                  this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
              )
            ) {
              this.enableAcceptButton()
            }
          }

          if (resource.value === 0) {
            document.getElementById(`tradeBoxContentRightResult-${resource.key}`)!.style.display =
              'none'
            document.getElementById(`tradeBoxContentRightResult-${resource.key}-value`)!.innerText =
              '0'
          } else {
            document.getElementById(`tradeBoxContentRightResult-${resource.key}`)!.style.display =
              'flex'
            document.getElementById(
              `tradeBoxContentRightResult-${resource.key}-value`,
            )!.innerText = `${resource.value}`
          }

          this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
        }
      })
      this.resourceButtons.push(tradeBoxPlayerOfferEqItemBtnDown)

      resourceValueWrapper.appendChild(tradeBoxPlayerOfferEqItemBtnDown)
      resourceValueWrapper.appendChild(valueWrapper)
      resourceValueWrapper.appendChild(tradeBoxPlayerOfferEqItemBtnUp)
      resourceContainer.appendChild(resourceValueWrapper)

      resourcesWrapper.appendChild(resourceContainer)
    }

    const moneyContainer = document.createElement('div')

    const moneyIconWrapper = document.createElement('div')
    const moneyIcon = document.createElement('img')
    moneyIcon.src = '/assets/coinCustomIcon.png'
    moneyIcon.style.width = '25px'
    moneyIconWrapper.appendChild(moneyIcon)
    moneyContainer.appendChild(moneyIconWrapper)

    const moneyValueWrapper = document.createElement('div')
    const valueWrapper = document.createElement('div')
    const value = document.createElement('h4')
    value.innerText = `${currentState.money}`
    valueWrapper.appendChild(value)

    const tradeBoxPlayerOfferEqMoneyBtnUp = document.createElement('button')
    const plus = document.createElement('i')
    plus.className = 'fa fa-plus'
    plus.ariaHidden = 'true'
    tradeBoxPlayerOfferEqMoneyBtnUp.appendChild(plus)
    tradeBoxPlayerOfferEqMoneyBtnUp.addEventListener('click', () => {
      if (this.isCurrPlayerTurn) {
        value.innerText = `${parseInt(value.innerText) + 1}`
        currentState.money += 1

        if (currentState.money === bid.money + 1) {
          this.changesDone += 1
        }
        if (currentState.money === bid.money) {
          this.changesDone -= 1
        }

        if (
          this.changesDone !== 0 &&
          (this.youGet.resources.some((resource) => resource.value > 0) ||
            this.youOffer.resources.some((resource) => resource.value > 0) ||
            this.youGet.money > 0 ||
            this.youOffer.money > 0)
        ) {
          if (
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableProposeButton()
          }
          if (!this.isFirstOffer) {
            this.disableAcceptButton()
          }
        } else if (this.changesDone !== 0) {
          this.disableProposeButton()
          this.disableAcceptButton()
        } else {
          this.disableProposeButton()
          if (
            !this.isFirstOffer &&
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableAcceptButton()
          }
        }

        if (currentState.money === 0) {
          document.getElementById('tradeBoxContentRightResult-money')!.style.display = 'none'
          document.getElementById('tradeBoxContentRightResult-money-value')!.innerText = '0'
        } else {
          document.getElementById('tradeBoxContentRightResult-money')!.style.display = 'flex'
          document.getElementById(
            'tradeBoxContentRightResult-money-value',
          )!.innerText = `${currentState.money}`
        }

        this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
      }
    })
    this.resourceButtons.push(tradeBoxPlayerOfferEqMoneyBtnUp)

    const tradeBoxPlayerOfferEqMoneyBtnDown = document.createElement('button')
    const minus = document.createElement('i')
    minus.className = 'fa fa-minus'
    minus.ariaHidden = 'true'
    tradeBoxPlayerOfferEqMoneyBtnDown.appendChild(minus)
    tradeBoxPlayerOfferEqMoneyBtnDown.addEventListener('click', () => {
      if (this.isCurrPlayerTurn && currentState.money > 0) {
        value.innerText = `${parseInt(value.innerText) - 1}`
        currentState.money -= 1

        if (currentState.money === bid.money - 1) {
          this.changesDone += 1
        }
        if (currentState.money === bid.money) {
          this.changesDone -= 1
        }

        if (
          this.changesDone !== 0 &&
          (this.youGet.resources.some((resource) => resource.value > 0) ||
            this.youOffer.resources.some((resource) => resource.value > 0) ||
            this.youGet.money > 0 ||
            this.youOffer.money > 0)
        ) {
          if (
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableProposeButton()
          }
          if (!this.isFirstOffer) {
            this.disableAcceptButton()
          }
        } else if (this.changesDone !== 0) {
          this.disableProposeButton()
          this.disableAcceptButton()
        } else {
          this.disableProposeButton()
          if (
            !this.isFirstOffer &&
            this.youOffer.money <= this.currPlayerEq.money &&
            this.youOffer.resources.every(
              (resource) =>
                resource.value <=
                this.currPlayerEq.resources.find((r) => r.key === resource.key)!.value,
            )
          ) {
            this.enableAcceptButton()
          }
        }

        if (currentState.money === 0) {
          document.getElementById('tradeBoxContentRightResult-money')!.style.display = 'none'
          document.getElementById('tradeBoxContentRightResult-money-value')!.innerText = '0'
        } else {
          document.getElementById('tradeBoxContentRightResult-money')!.style.display = 'flex'
          document.getElementById(
            'tradeBoxContentRightResult-money-value',
          )!.innerText = `${currentState.money}`
        }

        this.scene.sendTradeMinorChange(this.youOffer, this.youGet)
      }
    })
    this.resourceButtons.push(tradeBoxPlayerOfferEqMoneyBtnDown)

    moneyValueWrapper.appendChild(tradeBoxPlayerOfferEqMoneyBtnDown)
    moneyValueWrapper.appendChild(valueWrapper)
    moneyValueWrapper.appendChild(tradeBoxPlayerOfferEqMoneyBtnUp)
    moneyContainer.appendChild(moneyValueWrapper)

    resourcesWrapper.appendChild(moneyContainer)
    container.appendChild(resourcesWrapper)

    const resultExtraWrapper = document.createElement('div')
    resultExtraWrapper.id = 'tradeBoxContentRightResultExtraWrapper'
    const resultWrapper = document.createElement('div')
    resultWrapper.id = 'tradeBoxContentRightResultWrapper'
    const result = document.createElement('div')
    result.id = 'tradeBoxContentRightResult'

    for (const resource of currentState.resources) {
      const resultResourceContainer = document.createElement('div')
      resultResourceContainer.id = `tradeBoxContentRightResult-${resource.key}`

      const resultResourceIconWrapper = document.createElement('div')
      const resultResourceIcon = this.cropper.crop(
        25,
        25,
        1,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(resource.key),
        false,
      )
      resultResourceIconWrapper.appendChild(resultResourceIcon)
      resultResourceContainer.appendChild(resultResourceIconWrapper)

      const valueWrapper = document.createElement('div')
      const value = document.createElement('h4')
      value.id = `tradeBoxContentRightResult-${resource.key}-value`
      value.innerText = `${resource.value}`
      valueWrapper.appendChild(value)
      resultResourceContainer.appendChild(valueWrapper)

      const exclamationMark = document.createElement('h4')
      exclamationMark.innerText = '!'
      exclamationMark.id = `tradeBoxContentLeftResult-${resource.key}-exclamationMark`
      exclamationMark.className = 'tradeBoxContentResultExclamationMark'
      resultResourceContainer.appendChild(exclamationMark)
      if (
        !this.isFirstOffer &&
        resource.value !== this.youGetPrevious.resources.find((r) => r.key === resource.key)!.value
      ) {
        exclamationMark.style.display = 'block'
      } else {
        exclamationMark.style.display = 'none'
      }

      result.appendChild(resultResourceContainer)

      if (resource.value > 0) {
        resultResourceContainer.style.display = 'flex'
      } else {
        resultResourceContainer.style.display = 'none'
      }
    }

    const resultResourceContainer = document.createElement('div')
    resultResourceContainer.id = `tradeBoxContentRightResult-money`

    const resultMoneyIconWrapper = document.createElement('div')
    const resultMoneyIcon = document.createElement('img')
    resultMoneyIcon.src = '/assets/coinCustomIcon.png'
    resultMoneyIcon.style.width = '25px'
    resultMoneyIconWrapper.appendChild(resultMoneyIcon)
    resultResourceContainer.appendChild(resultMoneyIconWrapper)

    const resultValueWrapper = document.createElement('div')
    const resultValue = document.createElement('h4')
    resultValue.id = `tradeBoxContentRightResult-money-value`
    resultValue.innerText = `${currentState.money}`
    resultValueWrapper.appendChild(resultValue)
    resultResourceContainer.appendChild(resultValueWrapper)

    const exclamationMark = document.createElement('h4')
    exclamationMark.innerText = '!'
    exclamationMark.id = 'tradeBoxContentLeftResult-money-exclamationMark'
    exclamationMark.className = 'tradeBoxContentResultExclamationMark'
    resultResourceContainer.appendChild(exclamationMark)
    if (!this.isFirstOffer && currentState.money !== this.youGetPrevious.money) {
      exclamationMark.style.display = 'block'
    } else {
      exclamationMark.style.display = 'none'
    }

    result.appendChild(resultResourceContainer)
    if (currentState.money > 0) {
      resultResourceContainer.style.display = 'flex'
    } else {
      resultResourceContainer.style.display = 'none'
    }

    resultWrapper.appendChild(result)

    if (this.isCurrPlayerTurn) {
      result.style.display = 'flex'
    } else {
      result.style.display = 'none'
    }
    resultExtraWrapper.appendChild(resultWrapper)
    container.appendChild(resultExtraWrapper)
  }

  public setCurrPlayerTurn(currPlayerTurn: boolean): void {
    this.isCurrPlayerTurn = currPlayerTurn
  }

  public updatePlayerTurnElements(): void {
    if (this.isCurrPlayerTurn) {
      this.tradeBoxCurrPlayerTurnHeader.innerText = 'Twoja kolej!'
      this.tradeBoxCurrPlayerTurnHeader.id = 'userTurnUserTurn'
      for (const button of this.resourceButtons) {
        this.enableResourceButton(button)
      }
    } else {
      this.tradeBoxCurrPlayerTurnHeader.innerText = 'Poczekaj!'
      this.tradeBoxCurrPlayerTurnHeader.id = 'userTurnNotUserTurn'
      for (const button of this.resourceButtons) {
        this.disableResourceButton(button)
      }

      document
        .querySelectorAll('.tradeBoxContentResultExclamationMark')
        .forEach((exclamationMark) => {
          ;(exclamationMark as HTMLElement).style.display = 'none'
        })
    }
  }

  public enableResourceButton(button: HTMLButtonElement): void {
    button.disabled = false
    button.className = 'tradeBoxResourceButtonEnabled'
  }

  public disableResourceButton(button: HTMLButtonElement): void {
    button.disabled = true
    button.className = 'tradeBoxResourceButtonDisabled'
  }

  public disableAcceptButton(): void {
    this.tradeBoxAcceptButton.disabled = true

    this.tradeBoxAcceptButtonExtraWrapper.style.visibility = 'hidden'
    this.tradeBoxAcceptButtonExtraWrapper.className = 'tradeBoxMiddlleButtonExtraWrapperDisabled'
    this.tradeBoxAcceptButtonWrapper.className = 'tradeBoxMiddleButtonWrapperDisabled'
    this.tradeBoxAcceptButton.className = 'tradeBoxProposeButtonDisabled'
  }

  public enableAcceptButton(): void {
    this.tradeBoxAcceptButton.disabled = false

    this.tradeBoxAcceptButtonExtraWrapper.style.visibility = 'visible'
    this.tradeBoxAcceptButtonExtraWrapper.className = 'tradeBoxMiddleButtonExtraWrapperEnabled'
    this.tradeBoxAcceptButtonWrapper.className = 'tradeBoxMiddleButtonWrapperEnabled'
    this.tradeBoxAcceptButton.className = 'tradeBoxMiddleButtonEnabled'
  }

  public disableProposeButton(): void {
    this.tradeBoxProposeButton.disabled = true

    this.tradeBoxProposeButtonExtraWrapper.style.visibility = 'hidden'
    this.tradeBoxProposeButtonExtraWrapper.className = 'tradeBoxMiddlleButtonExtraWrapperDisabled'
    this.tradeBoxProposeButtonWrapper.className = 'tradeBoxMiddleButtonWrapperDisabled'
    this.tradeBoxProposeButton.className = 'tradeBoxProposeButtonDisabled'
  }

  public enableProposeButton(): void {
    this.tradeBoxProposeButton.disabled = false

    this.tradeBoxProposeButtonExtraWrapper.style.visibility = 'visible'
    this.tradeBoxProposeButtonExtraWrapper.className = 'tradeBoxMiddleButtonExtraWrapperEnabled'
    this.tradeBoxProposeButtonWrapper.className = 'tradeBoxMiddleButtonWrapperEnabled'
    this.tradeBoxProposeButton.className = 'tradeBoxMiddleButtonEnabled'
  }

  public show(): void {
    this.scene.interactionCloudBuiler.showInteractionCloud(this.scene.playerId, CloudType.TALK)
    window.document.body.appendChild(this.tradeBoxWrapper)
    this.scene.movingEnabled = false
  }

  public close(success: boolean): void {
    document.getElementById(TradeView.tradeBoxWrapperID)?.remove()

    if (success) {
      const succesView = new TradeSuccessView(
        this.resourceURL,
        this.resourceRepresentation,
        this.scene.playerId,
        this.youOffer,
        this.otherPlayerId,
        this.youGet,
        () => {
          this.scene.interactionCloudBuiler.hideInteractionCloud(
            this.scene.playerId,
            CloudType.TALK,
          )
          this.scene.tradeWindow = null
          this.scene.movingEnabled = true
          this.scene.otherPlayerId = undefined
        },
      )
      succesView.show()
    } else {
      this.scene.interactionCloudBuiler.hideInteractionCloud(this.scene.playerId, CloudType.TALK)
      this.scene.tradeWindow = null
      this.scene.movingEnabled = true
      this.scene.otherPlayerId = undefined
    }
  }
}
