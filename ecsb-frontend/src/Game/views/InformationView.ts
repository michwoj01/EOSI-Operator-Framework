export class InformationView {
  public static readonly containerID = 'errorsAndInfo'
  public static readonly informationBoxClassName = 'informationBox'
  public static readonly informationBoxWrapperClassName = 'informationBoxWrapper'

  private readonly informationBox: HTMLDivElement
  private readonly informationBoxWrapper: HTMLDivElement
  private readonly informationBoxText: HTMLParagraphElement

  private isHidden: boolean

  constructor() {
    this.informationBox = document.createElement('div')
    this.informationBox.className = InformationView.informationBoxClassName

    const icon = document.createElement('i')
    icon.className = 'fa fa-question-circle'
    icon.ariaHidden = 'true'
    icon.style.color = '#835211'

    this.informationBoxText = document.createElement('p')

    this.informationBox.appendChild(icon)
    this.informationBox.appendChild(this.informationBoxText)

    this.informationBoxWrapper = document.createElement('div')
    this.informationBoxWrapper.className = InformationView.informationBoxWrapperClassName
    this.informationBoxWrapper.appendChild(this.informationBox)

    this.isHidden = true
  }

  setText(text: string): void {
    this.informationBoxText.innerHTML = text
  }

  show(): void {
    if (!this.isHidden) return

    const container = document.getElementById(InformationView.containerID)
    if (container) {
      container.appendChild(this.informationBoxWrapper)
      this.isHidden = false
    }
  }

  close(): void {
    if (this.isHidden) return

    const container = document.getElementById(InformationView.containerID)
    if (container) {
      container.removeChild(this.informationBoxWrapper)
      this.isHidden = true
    }
  }
}
