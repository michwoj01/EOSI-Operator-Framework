import { type ClassResourceRepresentation } from '../../apis/game/Types'
import { type Equipment } from '../../services/game/Types'
import { RESOURCE_ICON_SCALE, RESOURCE_ICON_WIDTH, getResourceMapping } from '../GameUtils'
import { ImageCropper } from '../tools/ImageCropper'

export class EquipmentView {
  public static readonly equipmentBoxID = 'equipmentBox'
  public static readonly equipmentBoxContentID = 'equipmentBoxContent'
  public static readonly equipmentHoverBoxID = 'equipmentHoverBox'

  private readonly equipmentBox: HTMLDivElement
  private readonly equipmentHoverBox: HTMLDivElement
  private readonly resourceURL: string
  private readonly resourceRepresentation: ClassResourceRepresentation[]
  private readonly cropper: ImageCropper

  constructor(eq: Equipment, url: string, resRepresentation: ClassResourceRepresentation[]) {
    this.resourceURL = url
    this.resourceRepresentation = resRepresentation
    this.cropper = new ImageCropper()

    this.equipmentBox = document.createElement('div')
    this.equipmentBox.id = EquipmentView.equipmentBoxID

    this.equipmentHoverBox = document.createElement('div')
    this.equipmentHoverBox.id = EquipmentView.equipmentHoverBoxID

    this.fillEq(eq)
  }

  public update(newEq: Equipment): void {
    document.getElementById(EquipmentView.equipmentBoxContentID)?.remove()
    this.fillEq(newEq)
  }

  private fillEq(eq: Equipment): void {
    const equipmentBoxContent = document.createElement('div')
    equipmentBoxContent.id = EquipmentView.equipmentBoxContentID

    eq.resources.forEach((item, idx) => {
      const itemBox = document.createElement('div')

      const itemIcon = this.cropper.crop(
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_WIDTH,
        RESOURCE_ICON_SCALE,
        this.resourceURL,
        this.resourceRepresentation.length,
        getResourceMapping(this.resourceRepresentation)(item.key),
        false,
      )
      const itemValueWrapper = document.createElement('div')
      const itemValue = document.createElement('p')
      itemValue.innerText = item.value.toString()

      itemValueWrapper.appendChild(itemValue)
      itemBox.appendChild(itemIcon)
      itemBox.appendChild(itemValueWrapper)

      const itemHoverWrapper = document.createElement('div')
      itemHoverWrapper.className = 'equipmentResourceHoverBoxWrapper'
      itemHoverWrapper.style.transform = `translateX(${idx * 74}px)`

      itemHoverWrapper.style.visibility = 'hidden'
      const itemHover = document.createElement('div')
      itemHover.className = 'equipmentResourceHoverBox'
      const itemHoverContent = document.createElement('div')
      itemHoverContent.className = 'equipmentResourceHoverBoxContent'

      const itemHoverContentValues = document.createElement('div')
      const itemHoverContentValuesText = document.createElement('p')
      itemHoverContentValuesText.innerText = 'Cena'
      const itemHoverContentValuesValue = document.createElement('p')
      itemHoverContentValuesValue.innerText = `${
        this.resourceRepresentation.find((res) => res.value.gameResourceName === item.key)!.value
          .unitPrice
      }`
      itemHoverContentValues.appendChild(itemHoverContentValuesText)
      itemHoverContentValues.appendChild(itemHoverContentValuesValue)

      const itemHoverContentBuyouts = document.createElement('div')
      const itemHoverContentBuyoutsText = document.createElement('p')
      itemHoverContentBuyoutsText.innerText = 'Wykup'
      const itemHoverContentBuyoutsValue = document.createElement('p')
      itemHoverContentBuyoutsValue.innerText = `${
        this.resourceRepresentation.find((res) => res.value.gameResourceName === item.key)!.value
          .buyoutPrice
      }`
      itemHoverContentBuyouts.appendChild(itemHoverContentBuyoutsText)
      itemHoverContentBuyouts.appendChild(itemHoverContentBuyoutsValue)

      itemHoverContent.appendChild(itemHoverContentValues)
      itemHoverContent.appendChild(itemHoverContentBuyouts)

      itemHover.appendChild(itemHoverContent)
      itemHoverWrapper.appendChild(itemHover)

      itemBox.addEventListener('mouseover', () => {
        itemHoverWrapper.style.visibility = 'visible'
      })

      itemBox.addEventListener('mouseleave', () => {
        itemHoverWrapper.style.visibility = 'hidden'
      })

      this.equipmentHoverBox.appendChild(itemHoverWrapper)

      equipmentBoxContent.appendChild(itemBox)
    })
    const moneyBox = document.createElement('div')

    const moneyBoxicon = document.createElement('img')
    moneyBoxicon.src = '/assets/coinCustomIcon.png'
    moneyBoxicon.style.width = '38px'
    moneyBoxicon.style.height = '38px'
    const moneyValueWrapper = document.createElement('div')
    const moneyBoxValue = document.createElement('p')
    moneyBoxValue.innerText = eq.money.toString()

    moneyValueWrapper.appendChild(moneyBoxValue)
    moneyBox.appendChild(moneyBoxicon)
    moneyBox.appendChild(moneyValueWrapper)

    equipmentBoxContent.appendChild(moneyBox)

    this.equipmentBox.appendChild(equipmentBoxContent)
  }

  public show(): void {
    if (!document.getElementById(EquipmentView.equipmentBoxID)) {
      window.document.body.appendChild(this.equipmentBox)
      window.document.body.appendChild(this.equipmentHoverBox)
    }
  }

  public close(): void {
    document.getElementById(EquipmentView.equipmentBoxID)?.remove()
    document.getElementById(EquipmentView.equipmentHoverBoxID)?.remove()
  }
}
