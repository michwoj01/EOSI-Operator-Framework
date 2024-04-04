import { type Travel, type ClassResourceRepresentation } from '../../apis/game/Types'
import { SPACE_PRESS_ACTION_PREFIX, getResourceMapping } from '../GameUtils'
import { type Scene } from '../scenes/Scene'
import { CloudType } from '../scenes/Types'
import { ImageCropper } from '../tools/ImageCropper'
import {
  OutcomingCoopMessageType,
  sendCoopMessage,
} from '../webSocketMessage/chat/CoopMessageHandler'
import {
  TravelChoosingMessageType,
  sendTravelChoosingMessage,
} from '../webSocketMessage/chat/TravelChoosingMessage'

export enum TravelType {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class TravelView {
  private readonly scene: Scene
  private readonly travelType: TravelType
  private selectedTravel: Travel | null
  private readonly plannedTravel: Travel | null
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]
  private readonly cropper: ImageCropper

  public static readonly travelBoxWrapperID = 'travelBoxWrapper'

  private static readonly travelBoxHeaderWrapperID = 'travelBoxHeaderWrapper'
  private static readonly travelBoxHeaderID = 'travelBoxHeader'
  private static readonly travelBoxCloseButtonID = 'travelBoxCloseButton'

  private static readonly travelBoxContentExtraWrapperID = 'travelBoxContentExtraWrapper'
  private static readonly travelBoxContentWrapperID = 'travelBoxContentWrapper'
  private static readonly travelBoxContentID = 'travelBoxContent'

  private static readonly travelBoxButtonsContainerID = 'travelBoxButtonsContainer'
  private static readonly travelBoxPlanButtonID = 'travelBoxPlanButton'
  private static readonly travelBoxTravelButtonID = 'travelBoxTravelButton'

  private static readonly travelWarningBoxID = 'travelWarningBox'

  private readonly travelBoxWrapper: HTMLDivElement

  private readonly travelBoxHeaderWrapper: HTMLDivElement
  private readonly travelBoxHeader: HTMLDivElement

  private readonly travelBoxContentExtraWrapper: HTMLDivElement
  private readonly travelBoxContentWrapper: HTMLDivElement
  private readonly travelBoxContent: HTMLDivElement

  private readonly travelBoxButtonsContainer: HTMLDivElement
  private readonly travelBoxPlanButtonExtraWrapper: HTMLDivElement
  private readonly travelBoxPlanButtonWrapper: HTMLDivElement
  private readonly travelBoxPlanButton: HTMLButtonElement
  private readonly travelBoxTravelButtonExtraWrapper: HTMLDivElement
  private readonly travelBoxTravelButtonWrapper: HTMLDivElement
  private readonly travelBoxTravelButton: HTMLButtonElement

  constructor(
    scene: Scene,
    travelType: TravelType,
    resourceURL: string,
    resourceRepresentation: ClassResourceRepresentation[],
  ) {
    this.scene = scene
    this.travelType = travelType
    this.selectedTravel = null
    this.plannedTravel = scene.plannedTravel ? scene.plannedTravel.travel : null
    this.resourceURL = resourceURL
    this.resourceRepresentation = resourceRepresentation
    this.cropper = new ImageCropper()

    // Wrapper
    this.travelBoxWrapper = document.createElement('div')
    this.travelBoxWrapper.id = TravelView.travelBoxWrapperID

    // Header
    this.travelBoxHeaderWrapper = document.createElement('div')
    this.travelBoxHeaderWrapper.id = TravelView.travelBoxHeaderWrapperID

    this.travelBoxHeader = document.createElement('div')
    this.travelBoxHeader.id = TravelView.travelBoxHeaderID

    const travelBoxHeaderMainTitle = document.createElement('h1')
    travelBoxHeaderMainTitle.innerText = 'WYPRAWY'

    const timeIcon = document.createElement('img')
    timeIcon.style.transform = 'translateX(-15px)'

    const travelBoxHeaderSideTitle = document.createElement('h2')
    let sideTitle = ''
    switch (travelType) {
      case TravelType.LOW:
        sideTitle = 'BLISKIE'
        timeIcon.style.width = '61px'
        timeIcon.src = '/assets/shortRouteCustomIcon.png'
        break
      case TravelType.MEDIUM:
        sideTitle = 'ŚREDNIE'
        timeIcon.style.width = '61px'
        timeIcon.src = '/assets/mediumRouteCustomIcon.png'
        break
      case TravelType.HIGH:
        sideTitle = 'DALEKIE'
        timeIcon.style.width = '51px'
        timeIcon.src = '/assets/longRouteCustomIcon.png'
        break
      default:
        sideTitle = 'Travel'
        console.error('TravelType not found')
    }
    travelBoxHeaderSideTitle.innerText = sideTitle

    const trainIcon = document.createElement('img')
    trainIcon.src = '/assets/trainCustomIcon.png'
    trainIcon.style.width = '56px'

    const titlesWrapper = document.createElement('div')
    titlesWrapper.appendChild(travelBoxHeaderMainTitle)
    titlesWrapper.appendChild(travelBoxHeaderSideTitle)

    const closeButton = document.createElement('button')
    closeButton.id = TravelView.travelBoxCloseButtonID
    closeButton.addEventListener('click', () => {
      this.close()
      this.scene.movingEnabled = true
    })
    const XIcon = document.createElement('i')
    XIcon.className = 'fa fa-times'
    XIcon.ariaHidden = 'true'
    XIcon.style.color = 'black'
    closeButton.appendChild(XIcon)

    this.travelBoxHeader.appendChild(trainIcon)
    this.travelBoxHeader.appendChild(titlesWrapper)
    this.travelBoxHeader.appendChild(timeIcon)

    this.travelBoxHeaderWrapper.appendChild(this.travelBoxHeader)
    this.travelBoxHeaderWrapper.appendChild(closeButton)

    // Content
    this.travelBoxContentExtraWrapper = document.createElement('div')
    this.travelBoxContentExtraWrapper.id = TravelView.travelBoxContentExtraWrapperID

    this.travelBoxContentWrapper = document.createElement('div')
    this.travelBoxContentWrapper.id = TravelView.travelBoxContentWrapperID

    this.travelBoxContent = document.createElement('div')
    this.travelBoxContent.id = TravelView.travelBoxContentID

    let correctGate = false
    this.scene.settings.travels.forEach((travel) => {
      if (travel.key === this.travelType) {
        travel.value.forEach((travelItem) => {
          if (travelItem.value.name === this.plannedTravel?.value.name) {
            correctGate = true
          }

          // Item
          const travelItemContainerWrapper = document.createElement('div')
          travelItemContainerWrapper.className = 'travelBoxContentItemWrapper'
          const travelItemContainer = document.createElement('div')
          travelItemContainer.className = 'travelBoxContentItem'

          // Item - Header
          const travelItemHeader = document.createElement('div')
          travelItemHeader.className = 'travelBoxContentItemHeader'

          const travelItemTitle = document.createElement('h2')
          travelItemTitle.innerText = travelItem.value.name

          const travelItemCheckbox = document.createElement('input')
          travelItemCheckbox.type = 'radio'
          travelItemCheckbox.name = 'travel-option'
          travelItemCheckbox.value = travelItem.value.name
          travelItemCheckbox.addEventListener('change', () => {
            this.selectedTravel = travelItem
            sendTravelChoosingMessage(this.scene.chatWs, {
              type: TravelChoosingMessageType.TravelChange,
              travelName: this.selectedTravel.value.name,
            })
            if (
              !(
                travelItem.value.resources.some((resource) => {
                  if (
                    resource.value >
                    this.scene.equipment!.resources.find((res) => res.key === resource.key)!.value
                  )
                    return true
                  return false
                }) || travelItem.value.time! > this.scene.timeView!.getAvailableTokens()
              )
            ) {
              this.enableTravelButton()
            }
            this.enablePlanButton()
          })
          travelItemHeader.appendChild(travelItemCheckbox)
          travelItemHeader.appendChild(travelItemTitle)

          travelItemContainer.appendChild(travelItemHeader)

          // Item - Line
          travelItemContainer.appendChild(document.createElement('hr'))

          // Item - Content
          const travelItemContent = document.createElement('div')
          travelItemContent.className = 'travelBoxContentItemContent'

          // Item - Content Left
          const travelItemContentLeft = document.createElement('div')
          travelItemContentLeft.className = 'travelBoxContentItemContentLeft'

          const travelItemContentLeftHeader = document.createElement('h3')
          travelItemContentLeftHeader.innerText = 'Koszt:'
          travelItemContentLeft.appendChild(travelItemContentLeftHeader)

          const travelItemContentTimes = document.createElement('div')
          travelItemContentTimes.className = 'travelBoxContentItemContentLeftTimes'
          for (let i = 0; i < travelItem.value.time!; i++) {
            const timeIconExtraWrapper = document.createElement('div')
            const timeIconWrapper = document.createElement('div')
            const timeIcon = document.createElement('img')
            timeIcon.src = '/assets/timeCustomIcon.png'
            timeIcon.style.width = '25px'
            timeIcon.style.height = '25px'
            timeIconWrapper.appendChild(timeIcon)
            timeIconExtraWrapper.appendChild(timeIconWrapper)
            travelItemContentTimes.appendChild(timeIconExtraWrapper)

            if (
              this.plannedTravel &&
              (this.plannedTravel?.value.name !== travelItem.value.name ||
                !this.isPlannedTravelReady())
            ) {
              timeIconWrapper.style.backgroundColor = 'rgba(246, 220, 184, 0.4)'
              timeIcon.style.opacity = '0.4'
            }
          }
          travelItemContentLeft.appendChild(travelItemContentTimes)

          const travelItemContentResources = document.createElement('div')
          travelItemContentResources.className = 'travelBoxContentItemContentLeftResources'
          travelItem.value.resources.forEach((resource) => {
            if (resource.value !== 0) {
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

              travelItemContentResources.appendChild(itemContainer)

              if (
                this.plannedTravel &&
                (this.plannedTravel?.value.name !== travelItem.value.name ||
                  !this.isPlannedTravelReady())
              ) {
                itemValue.style.backgroundColor = 'rgba(246, 220, 184, 0.4)'
                itemValue.style.color = 'rgba(0, 0, 0, 0.7)'
                itemIcon.style.opacity = '0.4'
              }
            }
          })
          travelItemContentLeft.appendChild(travelItemContentResources)

          // Item - Content Right
          const travelItemContentRight = document.createElement('div')
          travelItemContentRight.className = 'travelBoxContentItemContentRight'

          const travelItemContentRightHeader = document.createElement('h3')
          travelItemContentRightHeader.innerText = 'Zysk:'
          travelItemContentRight.appendChild(travelItemContentRightHeader)

          const travelItemContentRightResult = document.createElement('div')

          const moneyIconWrapper = document.createElement('div')
          const moneyIcon = document.createElement('img')
          moneyIcon.src = '/assets/coinCustomIcon.png'
          moneyIcon.style.width = '25px'
          moneyIcon.style.height = '25px'
          moneyIconWrapper.appendChild(moneyIcon)

          const resultWrapper = document.createElement('div')
          const result = document.createElement('h4')
          result.innerText = `${travelItem.value.moneyRange.from} - ${travelItem.value.moneyRange.to}`
          resultWrapper.appendChild(result)

          travelItemContentRightResult.appendChild(moneyIconWrapper)
          travelItemContentRightResult.appendChild(resultWrapper)
          travelItemContentRight.appendChild(travelItemContentRightResult)

          travelItemContent.appendChild(travelItemContentLeft)
          travelItemContent.appendChild(travelItemContentRight)
          travelItemContainer.appendChild(travelItemContent)

          travelItemContainerWrapper.appendChild(travelItemContainer)

          this.travelBoxContent.appendChild(travelItemContainerWrapper)

          if (
            this.plannedTravel &&
            (this.plannedTravel?.value.name !== travelItem.value.name ||
              !this.isPlannedTravelReady())
          ) {
            travelItemCheckbox.disabled = true
            travelItemCheckbox.style.cursor = 'auto'
            travelItemCheckbox.style.backgroundColor = 'rgba(246, 220, 184, 0.4)'
            travelItemCheckbox.style.borderColor = 'rgba(246, 220, 184, 0.4)'
            travelItemContainer.style.backgroundColor = 'rgba(176, 156, 95, 0.40)'

            travelItemTitle.style.color = 'rgba(0, 0, 0, 0.7)'

            travelItemContentLeftHeader.style.color = 'rgba(0, 0, 0, 0.7)'

            result.style.backgroundColor = 'rgba(246, 220, 184, 0.4)'
            result.style.color = 'rgba(0, 0, 0, 0.7)'
            moneyIcon.style.opacity = '0.4'
            travelItemContentRightHeader.style.color = 'rgba(0, 0, 0, 0.7)'
          }

          if (this.plannedTravel && this.plannedTravel?.value.name === travelItem.value.name) {
            travelItemCheckbox.style.display = 'none'
            this.selectedTravel = travelItem
          }
        })
      }
    })

    this.travelBoxContentWrapper.appendChild(this.travelBoxContent)
    this.travelBoxContentExtraWrapper.appendChild(this.travelBoxContentWrapper)

    // Buttons
    this.travelBoxButtonsContainer = document.createElement('div')
    this.travelBoxButtonsContainer.id = TravelView.travelBoxButtonsContainerID

    this.travelBoxPlanButtonExtraWrapper = document.createElement('div')
    this.travelBoxPlanButtonWrapper = document.createElement('div')
    this.travelBoxPlanButton = document.createElement('button')
    this.travelBoxPlanButton.id = TravelView.travelBoxPlanButtonID
    this.travelBoxPlanButton.innerText = 'ZAPLANUJ'
    this.travelBoxPlanButton.addEventListener('click', () => {
      this.travelBoxPlanButtonExtraWrapper.className =
        this.travelBoxPlanButtonExtraWrapper.className ===
        'travelBoxButtonsContainerButtonExtraWrapperEnabledActive'
          ? 'travelBoxButtonsContainerButtonExtraWrapperEnabled'
          : 'travelBoxButtonsContainerButtonExtraWrapperEnabledActive'

      this.travelBoxPlanButtonWrapper.className =
        this.travelBoxPlanButtonWrapper.className ===
        'travelBoxButtonsContainerButtonWrapperEnabledActive'
          ? 'travelBoxButtonsContainerButtonWrapperEnabled'
          : 'travelBoxButtonsContainerButtonWrapperEnabledActive'

      this.travelBoxPlanButton.className =
        this.travelBoxPlanButton.className === 'travelBoxButtonsContainerButtonEnabledActive'
          ? 'travelBoxButtonsContainerButtonEnabled'
          : 'travelBoxButtonsContainerButtonEnabledActive'

      sendCoopMessage(this.scene.chatWs, {
        type: OutcomingCoopMessageType.StartPlanning,
        travelName: this.selectedTravel!.value.name,
      })
      this.close()
      this.scene.movingEnabled = true
    })
    this.travelBoxPlanButtonWrapper.appendChild(this.travelBoxPlanButton)
    this.travelBoxPlanButtonExtraWrapper.appendChild(this.travelBoxPlanButtonWrapper)

    this.travelBoxTravelButtonExtraWrapper = document.createElement('div')
    this.travelBoxTravelButtonWrapper = document.createElement('div')
    this.travelBoxTravelButton = document.createElement('button')
    this.travelBoxTravelButton.id = TravelView.travelBoxTravelButtonID
    this.travelBoxTravelButton.innerText = 'JEDŹ'
    this.travelBoxTravelButton.addEventListener('click', () => {
      this.disableTravelButton()

      this.scene.loadingView.show()

      this.travelBoxTravelButtonExtraWrapper.className =
        this.travelBoxTravelButtonExtraWrapper.className ===
        'travelBoxButtonsContainerButtonExtraWrapperEnabledActive'
          ? 'travelBoxButtonsContainerButtonExtraWrapperEnabled'
          : 'travelBoxButtonsContainerButtonExtraWrapperEnabledActive'

      this.travelBoxTravelButtonWrapper.className =
        this.travelBoxTravelButtonWrapper.className ===
        'travelBoxButtonsContainerButtonWrapperEnabledActive'
          ? 'travelBoxButtonsContainerButtonWrapperEnabled'
          : 'travelBoxButtonsContainerButtonWrapperEnabledActive'

      this.travelBoxTravelButton.className =
        this.travelBoxTravelButton.className === 'travelBoxButtonsContainerButtonEnabledActive'
          ? 'travelBoxButtonsContainerButtonEnabled'
          : 'travelBoxButtonsContainerButtonEnabledActive'

      if (this.plannedTravel && correctGate && this.isPlannedTravelReady()) {
        sendCoopMessage(scene.chatWs, {
          type: OutcomingCoopMessageType.StartPlannedTravel,
          travelName: this.selectedTravel!.value.name,
        })
        scene.plannedTravel = null
        scene.statusAndCoopView?.updateCoopView()
      } else {
        sendCoopMessage(scene.chatWs, {
          type: OutcomingCoopMessageType.StartSimpleTravel,
          travelName: this.selectedTravel!.value.name,
        })
      }
    })
    this.travelBoxTravelButtonWrapper.appendChild(this.travelBoxTravelButton)
    this.travelBoxTravelButtonExtraWrapper.appendChild(this.travelBoxTravelButtonWrapper)

    this.travelBoxButtonsContainer.appendChild(this.travelBoxPlanButtonExtraWrapper)
    this.travelBoxButtonsContainer.appendChild(this.travelBoxTravelButtonExtraWrapper)

    this.travelBoxWrapper.appendChild(this.travelBoxHeaderWrapper)
    this.travelBoxWrapper.appendChild(this.travelBoxContentExtraWrapper)
    this.travelBoxWrapper.appendChild(this.travelBoxButtonsContainer)

    this.disablePlanButton()
    this.disableTravelButton()

    if (
      this.plannedTravel &&
      this.scene.plannedTravel &&
      this.scene.plannedTravel.playerIsRunning === false
    ) {
      this.setWarning(
        `Zgodnie z wynikiem negocjacji to twój partner powinien odbyć podróż do miasta ${this.plannedTravel.value.name}`,
      )
    } else if (this.plannedTravel && correctGate && this.isPlannedTravelReady()) {
      this.setWarning(
        'Możesz wybrać tylko wyprawę którą zaplanowałeś. Jeżeli chcesz zmienić kierunek, anuluj kartę aktualnej wyprawy i wejdź ponownie.',
      )
      this.enableTravelButton()
    } else if (this.plannedTravel && correctGate) {
      this.setWarning(
        `Jesteś w trakcie planowania podróży do miasta ${this.plannedTravel.value.name}, na którą nie uzbierałeś jeszcze wszystkich zasobów. Jeżeli chcesz pojechać w inną podróż, zrezygnuj z aktualnej.`,
      )
    } else if (this.plannedTravel) {
      this.setWarning(
        `Jesteś w trakcie planowania podróży do miasta ${this.plannedTravel.value.name}. Jeżeli chcesz pojechać w inną podróż, zrezygnuj z aktualnej.`,
      )
    }
  }

  public disableTravelButton(): void {
    this.travelBoxTravelButton.disabled = true
    this.travelBoxTravelButtonExtraWrapper.className =
      'travelBoxButtonsContainerButtonExtraWrapperDisabled'
    this.travelBoxTravelButtonWrapper.className = 'travelBoxButtonsContainerButtonWrapperDisabled'
    this.travelBoxTravelButton.className = 'travelBoxButtonsContainerButtonDisabled'
  }

  public enableTravelButton(): void {
    this.travelBoxTravelButton.disabled = false
    this.travelBoxTravelButtonExtraWrapper.className =
      'travelBoxButtonsContainerButtonExtraWrapperEnabled'
    this.travelBoxTravelButtonWrapper.className = 'travelBoxButtonsContainerButtonWrapperEnabled'
    this.travelBoxTravelButton.className = 'travelBoxButtonsContainerButtonEnabled'
  }

  public disablePlanButton(): void {
    this.travelBoxPlanButton.disabled = true
    this.travelBoxPlanButtonExtraWrapper.className =
      'travelBoxButtonsContainerButtonExtraWrapperDisabled'
    this.travelBoxPlanButtonWrapper.className = 'travelBoxButtonsContainerButtonWrapperDisabled'
    this.travelBoxPlanButton.className = 'travelBoxButtonsContainerButtonDisabled'
  }

  public enablePlanButton(): void {
    this.travelBoxPlanButton.disabled = false
    this.travelBoxPlanButtonExtraWrapper.className =
      'travelBoxButtonsContainerButtonExtraWrapperEnabled'
    this.travelBoxPlanButtonWrapper.className = 'travelBoxButtonsContainerButtonWrapperEnabled'
    this.travelBoxPlanButton.className = 'travelBoxButtonsContainerButtonEnabled'
  }

  public show(): void {
    sendTravelChoosingMessage(this.scene.chatWs, {
      type: TravelChoosingMessageType.TravelStart,
    })
    this.scene.interactionCloudBuiler.showInteractionCloud(this.scene.playerId, CloudType.TRAVEL)
    window.document.body.appendChild(this.travelBoxWrapper)
    this.scene.travelView = this
    this.scene.movingEnabled = false
  }

  public close(): void {
    sendTravelChoosingMessage(this.scene.chatWs, {
      type: TravelChoosingMessageType.TravelStop,
    })
    this.scene.interactionCloudBuiler.hideInteractionCloud(this.scene.playerId, CloudType.TRAVEL)
    document.getElementById(TravelView.travelBoxWrapperID)?.remove()
    this.scene.travelView = null

    switch (this.travelType) {
      case TravelType.LOW:
        this.scene.informationActionPopup.setText(
          `${SPACE_PRESS_ACTION_PREFIX} odbyć krótką podróż...`,
        )
        break
      case TravelType.MEDIUM:
        this.scene.informationActionPopup.setText(
          `${SPACE_PRESS_ACTION_PREFIX} odbyć średnią podróż...`,
        )
        break
      case TravelType.HIGH:
        this.scene.informationActionPopup.setText(
          `${SPACE_PRESS_ACTION_PREFIX} odbyć długą podróż...`,
        )
        break
    }

    this.scene.informationActionPopup.show()
  }

  private isPlannedTravelReady(): boolean {
    if (this.scene.plannedTravel) {
      for (const resource of this.scene.plannedTravel.playerRequiredResources.resources) {
        const currResource = this.scene.plannedTravel.playerResources.resources.find(
          (currentResource) => currentResource.key === resource.key,
        )!
        if (resource.value > currResource.value) {
          return false
        }
      }
      if (!this.scene.plannedTravel.isSingle) {
        for (const resource of this.scene.plannedTravel.partnerRequiredResources!.resources) {
          const currResource = this.scene.plannedTravel.partnerResources!.resources.find(
            (currentResource) => currentResource.key === resource.key,
          )!
          if (resource.value > currResource.value) {
            return false
          }
        }
      }
      if (
        this.scene.plannedTravel.playerRequiredResources.time >
        this.scene.plannedTravel.playerResources.time
      ) {
        return false
      }
      if (!this.scene.plannedTravel.isSingle) {
        if (
          this.scene.plannedTravel.partnerRequiredResources!.time >
          this.scene.plannedTravel.partnerResources!.time
        ) {
          return false
        }
      }
      return true
    }
    return false
  }

  private setWarning(text: string): void {
    const warningBox = document.createElement('div')
    const warningText = document.createElement('h5')
    warningText.innerHTML = text
    const icon = document.createElement('i')
    icon.className = 'fa fa-question-circle'
    icon.ariaHidden = 'true'
    icon.style.color = '#835211'
    warningBox.appendChild(icon)
    warningBox.appendChild(warningText)
    warningBox.id = TravelView.travelWarningBoxID
    const travels = this.travelBoxContent.childNodes.length
    if (travels === 1) {
      warningBox.style.maxWidth = '410px'
    } else if (travels === 2) {
      warningBox.style.maxWidth = '820px'
    }
    this.travelBoxContentWrapper.appendChild(document.createElement('hr'))
    this.travelBoxContentWrapper.appendChild(warningBox)
  }
}
