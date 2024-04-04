import { type ClassResourceRepresentation } from '../../apis/game/Types'
import {
  RESOURCE_ICON_SCALE,
  RESOURCE_ICON_WIDTH,
  SPACE_PRESS_ACTION_PREFIX,
  getResourceMapping,
} from '../GameUtils'
import { type Scene } from '../scenes/Scene'
import { CloudType } from '../scenes/Types'
import { ImageCropper } from '../tools/ImageCropper'
import {
  OutcomingWorkshopMessageType,
  sendWorkshopMessage,
} from '../webSocketMessage/chat/WorkshopMessageHandler'

export class WorkshopView {
  public static readonly workshopBoxWrapperID = 'workshopBoxWrapper'
  public static readonly workshopBoxID = 'workshopBox'
  public static readonly workshopBoxHeaderBoxExtraWrapperID = 'workshopBoxHeaderBoxExtraWrapper'
  public static readonly workshopBoxHeaderBoxWrapperID = 'workshopBoxHeaderBoxWrapper'
  public static readonly workshopBoxHeaderBoxID = 'workshopBoxHeaderBox'
  public static readonly workshopBoxMathBoxWrapperID = 'workshopBoxMathBoxWrapper'
  public static readonly workshopBoxMathBoxID = 'workshopBoxMathBox'
  public static readonly workshopBoxContentBoxWrapperID = 'workshopBoxContentBoxWrapper'
  public static readonly workshopBoxContentBoxID = 'workshopBoxContentBox'
  public static readonly workshopBoxContentBoxLeftID = 'workshopBoxContentBoxLeft'
  public static readonly workshopBoxContentBoxRightID = 'workshopBoxContentBoxRight'
  public static readonly workshopBoxContentBoxCostBoxID = 'workshopBoxContentBoxCostBox'
  public static readonly workshopBoxContentBoxResultBoxID = 'workshopBoxContentBoxResultBox'
  public static readonly workshopBoxContentBoxButtonsBoxID = 'workshopBoxContentBoxButtonsBox'
  public static readonly workshopBoxCostBoxID = 'workshopBoxCostBox'
  public static readonly workshopBoxSubmitButtonExtraWrapperID =
    'workshopBoxSubmitButtonExtraWrapper'
  public static readonly workshopBoxSubmitButtonWrapperID = 'workshopBoxSubmitButtonWrapper'
  public static readonly workshopBoxSubmitButtonID = 'workshopBoxSubmitButton'
  public static readonly workshopBoxCloseButtonID = 'workshopBoxCloseButton'

  private readonly workshopBoxWrapper: HTMLDivElement
  private readonly workshopBoxSubmitButtonExtraWrapper: HTMLDivElement
  private readonly workshopBoxSubmitButtonWrapper: HTMLDivElement
  private readonly workshopBoxSubmitButton: HTMLButtonElement
  private readonly workshopBoxPlusButton: HTMLButtonElement
  private readonly workshopBoxMinusButton: HTMLButtonElement

  private readonly pTime: HTMLDivElement

  private readonly scene: Scene
  private readonly cropper: ImageCropper
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]

  constructor(scene: Scene, resourceURL: string, resRepresentation: ClassResourceRepresentation[]) {
    this.scene = scene
    this.resourceURL = resourceURL
    this.resourceRepresentation = resRepresentation
    this.cropper = new ImageCropper()

    let resourceName = ''
    for (const classResource of this.scene.settings.classResourceRepresentation) {
      if (classResource.key === this.scene.status.className) {
        resourceName = classResource.value.gameResourceName
      }
    }

    const itemIcon = this.cropper.crop(
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_SCALE,
      this.resourceURL,
      this.resourceRepresentation.length,
      getResourceMapping(this.resourceRepresentation)(resourceName),
      false,
    )
    const itemIconReversed = this.cropper.crop(
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_WIDTH,
      RESOURCE_ICON_SCALE,
      this.resourceURL,
      this.resourceRepresentation.length,
      getResourceMapping(this.resourceRepresentation)(resourceName),
      true,
    )

    // Wrapper
    this.workshopBoxWrapper = document.createElement('div')
    this.workshopBoxWrapper.id = WorkshopView.workshopBoxWrapperID

    // Container
    const workshopBox = document.createElement('div')
    workshopBox.id = WorkshopView.workshopBoxID

    // Header
    const workshopBoxHeaderBoxExtraWrapper = document.createElement('div')
    workshopBoxHeaderBoxExtraWrapper.id = WorkshopView.workshopBoxHeaderBoxExtraWrapperID

    const workshopBoxHeaderBoxWrapper = document.createElement('div')
    workshopBoxHeaderBoxWrapper.id = WorkshopView.workshopBoxHeaderBoxWrapperID

    const workshopBoxHeaderBox = document.createElement('div')
    workshopBoxHeaderBox.id = WorkshopView.workshopBoxHeaderBoxID
    const workshopTitleHeader = document.createElement('h1')
    workshopTitleHeader.innerText = 'WARSZTAT'

    const workshopTitleClassWrapper = document.createElement('div')

    const workshopTitleClass = document.createElement('h2')
    workshopTitleClass.innerText = `${this.scene.status.className.toUpperCase()}A`
    const leftIcon = itemIconReversed.cloneNode(true)
    const rightIcon = itemIcon.cloneNode(true)

    workshopTitleClassWrapper.appendChild(leftIcon)
    workshopTitleClassWrapper.appendChild(workshopTitleClass)
    workshopTitleClassWrapper.appendChild(rightIcon)

    workshopBoxHeaderBox.appendChild(workshopTitleHeader)
    workshopBoxHeaderBox.appendChild(workshopTitleClassWrapper)

    // Close button
    const workshopBoxCloseButton = document.createElement('button')
    workshopBoxCloseButton.id = WorkshopView.workshopBoxCloseButtonID
    workshopBoxCloseButton.addEventListener('click', () => {
      this.close()
      this.scene.workshopView = null
      this.scene.movingEnabled = true

      this.scene.informationActionPopup.setText(
        `${SPACE_PRESS_ACTION_PREFIX} rozpocząć wytwarzanie...`,
      )
      this.scene.informationActionPopup.show()
      this.scene.interactionCloudBuiler.hideInteractionCloud(this.scene.playerId, CloudType.WORK)
    })
    const XIcon = document.createElement('i')
    XIcon.className = 'fa fa-times'
    XIcon.ariaHidden = 'true'
    XIcon.style.color = 'black'
    workshopBoxCloseButton.appendChild(XIcon)

    workshopBoxHeaderBoxWrapper.appendChild(workshopBoxCloseButton)
    workshopBoxHeaderBoxWrapper.appendChild(workshopBoxHeaderBox)
    workshopBoxHeaderBoxExtraWrapper.appendChild(workshopBoxHeaderBoxWrapper)

    // Math
    const workshopBoxMathBoxWrapper = document.createElement('div')
    workshopBoxMathBoxWrapper.id = WorkshopView.workshopBoxMathBoxWrapperID

    const workshopBoxMathBox = document.createElement('div')
    workshopBoxMathBox.id = WorkshopView.workshopBoxMathBoxID

    const resourceAmountElement = document.createElement('span')
    resourceAmountElement.innerText = `${this.scene.playerWorkshopMaxProduction}`
    const resourceIconElement = this.cropper.crop(
      20,
      20,
      1,
      this.resourceURL,
      this.resourceRepresentation.length,
      getResourceMapping(this.resourceRepresentation)(resourceName),
      false,
    )
    const equalsElement = document.createElement('span')
    equalsElement.innerText = ' = '

    const moneyIcon = document.createElement('img')
    moneyIcon.src = '/assets/coinCustomIcon.png'
    moneyIcon.style.width = '20px'
    moneyIcon.style.height = '20px'
    const timeIcon = document.createElement('img')
    timeIcon.src = '/assets/timeCustomIcon.png'
    timeIcon.style.width = '20px'
    timeIcon.style.height = '20px'
    const moneySpan = document.createElement('span')
    moneySpan.innerText = `${
      this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction
    }`
    const timeSpan = document.createElement('span')
    timeSpan.innerText = `+ ${1}`

    workshopBoxMathBox.appendChild(resourceAmountElement)
    workshopBoxMathBox.appendChild(resourceIconElement)
    workshopBoxMathBox.appendChild(equalsElement)
    workshopBoxMathBox.appendChild(moneySpan)
    workshopBoxMathBox.appendChild(moneyIcon)
    workshopBoxMathBox.appendChild(timeSpan)
    workshopBoxMathBox.appendChild(timeIcon)

    workshopBoxMathBoxWrapper.appendChild(workshopBoxMathBox)

    // Content
    const workshopBoxContentBoxWrapper = document.createElement('div')
    workshopBoxContentBoxWrapper.id = WorkshopView.workshopBoxContentBoxWrapperID

    const workshopBoxContentBox = document.createElement('div')
    workshopBoxContentBox.id = WorkshopView.workshopBoxContentBoxID

    // Left
    const workshopBoxContentBoxLeft = document.createElement('div')
    workshopBoxContentBoxLeft.id = WorkshopView.workshopBoxContentBoxLeftID

    // Left - CostBox
    const workshopBoxContentBoxCostBox = document.createElement('div')
    workshopBoxContentBoxCostBox.id = WorkshopView.workshopBoxContentBoxCostBoxID

    const pMoneyIconWrapper = document.createElement('div')
    const pMoneyIcon = document.createElement('img')
    pMoneyIcon.src = '/assets/coinCustomIcon.png'
    pMoneyIcon.style.width = '38px'
    pMoneyIcon.style.height = '38px'
    pMoneyIconWrapper.appendChild(pMoneyIcon)

    const pMoneyInputWrapper = document.createElement('div')
    const pMoneyInput = document.createElement('h4')
    pMoneyInput.innerText = '0'
    pMoneyInputWrapper.appendChild(pMoneyInput)
    const pMoney = document.createElement('div')
    pMoney.appendChild(pMoneyInputWrapper)
    pMoney.appendChild(pMoneyIconWrapper)

    this.pTime = document.createElement('div')
    this.pTime.id = 'pTime'

    const costHeader = document.createElement('h2')
    costHeader.innerText = `Koszt`
    const costResources = document.createElement('div')
    costResources.appendChild(pMoney)
    costResources.appendChild(this.pTime)

    workshopBoxContentBoxCostBox.appendChild(costHeader)
    workshopBoxContentBoxCostBox.appendChild(costResources)

    // Left - ResultBox
    const workshopBoxContentBoxResultBox = document.createElement('div')
    workshopBoxContentBoxResultBox.id = WorkshopView.workshopBoxContentBoxResultBoxID

    const pWantLabel = document.createElement('h1')
    pWantLabel.innerText = `Wyprodukujesz`

    const pWantInputWrapper = document.createElement('div')
    const pWantInput = document.createElement('h2')
    pWantInput.innerText = '0'
    pWantInputWrapper.appendChild(pWantInput)

    workshopBoxContentBoxResultBox.appendChild(pWantLabel)

    const inputWrapper = document.createElement('div')
    inputWrapper.appendChild(itemIcon)
    inputWrapper.appendChild(pWantInputWrapper)
    workshopBoxContentBoxResultBox.appendChild(inputWrapper)

    workshopBoxContentBoxLeft.appendChild(workshopBoxContentBoxCostBox)
    workshopBoxContentBoxLeft.appendChild(workshopBoxContentBoxResultBox)

    // Right
    const workshopBoxContentBoxRight = document.createElement('div')
    workshopBoxContentBoxRight.id = WorkshopView.workshopBoxContentBoxRightID

    this.workshopBoxPlusButton = document.createElement('button')
    const iconPlus = document.createElement('i')
    iconPlus.className = 'fa fa-plus'
    iconPlus.ariaHidden = 'true'

    this.workshopBoxPlusButton.addEventListener('click', () => {
      this.enableMinusButton()
      this.enableSubmitBtn()

      const costTime = this.pTime.children.length + 1
      const costMoney =
        costTime * (this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction)
      const resource = costTime * this.scene.playerWorkshopMaxProduction

      pWantInput.innerText = `${resource}`
      pMoneyInput.innerText = `${costMoney}`

      const pTimeIconExtraWrapper = document.createElement('div')
      const pTimeIconWrapper = document.createElement('div')
      const pTimeIcon = document.createElement('img')
      pTimeIcon.src = '/assets/timeCustomIcon.png'
      pTimeIcon.style.width = '25px'
      pTimeIcon.style.height = '25px'
      pTimeIconWrapper.appendChild(pTimeIcon)
      pTimeIconExtraWrapper.appendChild(pTimeIconWrapper)
      this.pTime.appendChild(pTimeIconExtraWrapper)

      sendWorkshopMessage(this.scene.chatWs, {
        type: OutcomingWorkshopMessageType.WorkshopChoosingChange,
        amount: resource,
      })

      const costTimeMore = costTime + 1
      const costMoneyMore =
        costTimeMore * (this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction)
      if (
        costMoneyMore > this.scene.equipment!.money ||
        costTimeMore > this.scene.timeView!.getAvailableTokens() ||
        costTimeMore === 11
      ) {
        this.disablePlusButton()
        return
      }
      this.enablePlusButton()
    })

    this.workshopBoxPlusButton.appendChild(iconPlus)

    this.workshopBoxMinusButton = document.createElement('button')
    const iconMinus = document.createElement('i')
    iconMinus.className = 'fa fa-minus'
    iconMinus.ariaHidden = 'true'

    this.workshopBoxMinusButton.addEventListener('click', () => {
      this.enablePlusButton()

      const costTime = this.pTime.children.length - 1
      const costMoney =
        costTime * (this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction)
      const resource = costTime * this.scene.playerWorkshopMaxProduction

      pWantInput.innerText = `${resource}`
      pMoneyInput.innerText = `${costMoney}`
      if (this.pTime.lastChild) {
        this.pTime.removeChild(this.pTime.lastChild)
      }

      sendWorkshopMessage(this.scene.chatWs, {
        type: OutcomingWorkshopMessageType.WorkshopChoosingChange,
        amount: resource,
      })

      if (costTime === 0) {
        this.disableSubmitBtn()
      }

      if (costTime - 1 < 0) {
        this.disableMinusButton()
      }
    })

    this.workshopBoxMinusButton.appendChild(iconMinus)

    const buttons = document.createElement('div')
    buttons.id = WorkshopView.workshopBoxContentBoxButtonsBoxID
    buttons.appendChild(this.workshopBoxPlusButton)
    buttons.appendChild(this.workshopBoxMinusButton)

    workshopBoxContentBoxRight.appendChild(buttons)

    workshopBoxContentBox.appendChild(workshopBoxContentBoxLeft)
    workshopBoxContentBox.appendChild(document.createElement('hr'))
    workshopBoxContentBox.appendChild(workshopBoxContentBoxRight)

    workshopBoxContentBoxWrapper.appendChild(workshopBoxContentBox)

    // Submit button
    this.workshopBoxSubmitButtonExtraWrapper = document.createElement('div')
    this.workshopBoxSubmitButtonExtraWrapper.id = WorkshopView.workshopBoxSubmitButtonExtraWrapperID

    this.workshopBoxSubmitButtonWrapper = document.createElement('div')
    this.workshopBoxSubmitButtonWrapper.id = WorkshopView.workshopBoxSubmitButtonWrapperID

    this.workshopBoxSubmitButton = document.createElement('button')
    this.workshopBoxSubmitButton.id = WorkshopView.workshopBoxSubmitButtonID
    this.workshopBoxSubmitButton.innerText = 'Produkuj'
    this.workshopBoxSubmitButton.addEventListener('click', () => {
      this.disableSubmitBtn()

      this.workshopBoxSubmitButtonExtraWrapper.className =
        this.workshopBoxSubmitButtonExtraWrapper.className ===
        'workshopBoxSubmitButtonExtraWrapperEnabledActive'
          ? 'workshopBoxSubmitButtonExtraWrapperEnabled'
          : 'workshopBoxSubmitButtonExtraWrapperEnabledActive'
      this.workshopBoxSubmitButtonWrapper.className =
        this.workshopBoxSubmitButtonWrapper.className ===
        'workshopBoxSubmitButtonWrapperEnabledActive'
          ? 'workshopBoxSubmitButtonWrapperEnabled'
          : 'workshopBoxSubmitButtonWrapperEnabledActive'
      this.workshopBoxSubmitButton.className =
        this.workshopBoxSubmitButtonWrapper.className === 'workshopBoxSubmitButtonEnabledActive'
          ? 'workshopBoxSubmitButtonEnabled'
          : 'workshopBoxSubmitButtonEnabledActive'

      sendWorkshopMessage(scene.chatWs, {
        type: OutcomingWorkshopMessageType.WorkshopStart,
        amount: parseInt(pWantInput.innerText),
      })
    })

    this.workshopBoxSubmitButtonWrapper.appendChild(this.workshopBoxSubmitButton)

    this.workshopBoxSubmitButtonExtraWrapper.appendChild(this.workshopBoxSubmitButtonWrapper)

    workshopBox.appendChild(workshopBoxHeaderBoxExtraWrapper)
    workshopBox.appendChild(workshopBoxMathBoxWrapper)
    workshopBox.appendChild(workshopBoxContentBoxWrapper)
    workshopBox.appendChild(this.workshopBoxSubmitButtonExtraWrapper)

    this.workshopBoxWrapper.appendChild(workshopBox)

    const costTime = 1
    const costMoney =
      costTime * (this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction)
    if (
      costMoney > this.scene.equipment!.money ||
      costTime > this.scene.timeView!.getAvailableTokens()
    ) {
      this.disablePlusButton()
    } else {
      this.enablePlusButton()
    }
    this.disableMinusButton()
    this.disableSubmitBtn()
  }

  public onTimeTokensChange(): void {
    const currentCostTime = this.pTime.children.length

    const nextCostTime = currentCostTime + 1
    const nextCostMoney =
      nextCostTime * (this.scene.playerWorkshopUnitPrice * this.scene.playerWorkshopMaxProduction)
    if (
      nextCostMoney > this.scene.equipment!.money ||
      nextCostTime > this.scene.timeView!.getAvailableTokens() ||
      nextCostTime === 11
    ) {
      this.disablePlusButton()
      return
    }
    this.enablePlusButton()

    const prevCostTime = currentCostTime - 1
    if (prevCostTime < 0) {
      this.disableMinusButton()
    }
  }

  private enablePlusButton(): void {
    this.workshopBoxPlusButton.disabled = false
    this.workshopBoxPlusButton.className = 'workshopBoxContentBoxButtonsBoxButtonEnabled'
  }

  private disablePlusButton(): void {
    this.workshopBoxPlusButton.disabled = true
    this.workshopBoxPlusButton.className = 'workshopBoxContentBoxButtonsBoxButtonDisabled'
  }

  private enableMinusButton(): void {
    this.workshopBoxMinusButton.disabled = false
    this.workshopBoxMinusButton.className = 'workshopBoxContentBoxButtonsBoxButtonEnabled'
  }

  private disableMinusButton(): void {
    this.workshopBoxMinusButton.disabled = true
    this.workshopBoxMinusButton.className = 'workshopBoxContentBoxButtonsBoxButtonDisabled'
  }

  private disableSubmitBtn(): void {
    this.workshopBoxSubmitButton.disabled = true
    this.workshopBoxSubmitButtonExtraWrapper.className =
      'workshopBoxSubmitButtonExtraWrapperDisabled'
    this.workshopBoxSubmitButtonWrapper.className = 'workshopBoxSubmitButtonWrapperDisabled'
    this.workshopBoxSubmitButton.className = 'workshopBoxSubmitButtonDisabled'
  }

  private enableSubmitBtn(): void {
    this.workshopBoxSubmitButton.disabled = false
    this.workshopBoxSubmitButtonExtraWrapper.className =
      'workshopBoxSubmitButtonExtraWrapperEnabled'
    this.workshopBoxSubmitButtonWrapper.className = 'workshopBoxSubmitButtonWrapperEnabled'
    this.workshopBoxSubmitButton.className = 'workshopBoxSubmitButtonEnabled'
  }

  public show(): void {
    sendWorkshopMessage(this.scene.chatWs, {
      type: OutcomingWorkshopMessageType.WorkshopChoosingStart,
    })
    this.scene.interactionCloudBuiler.showInteractionCloud(this.scene.playerId, CloudType.WORK)
    window.document.body.appendChild(this.workshopBoxWrapper)
    this.scene.workshopView = this
    this.scene.movingEnabled = false
  }

  public close(): void {
    sendWorkshopMessage(this.scene.chatWs, {
      type: OutcomingWorkshopMessageType.WorkshopChoosingStop,
    })
    document.getElementById(WorkshopView.workshopBoxWrapperID)?.remove()
    this.scene.interactionCloudBuiler.hideInteractionCloud(this.scene.playerId, CloudType.WORK)
    this.scene.workshopView = null
  }
}
