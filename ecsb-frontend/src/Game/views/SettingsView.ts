export class SettingsView {
  public static readonly settingsID = 'settingsButton'
  public static readonly settingsWrapperID = 'settingsButtonWrapper'
  public static readonly settingsContainerID = 'settingsContainer'
  public static readonly settingsContainerWrapperID = 'settingsContainerWrapper'
  public static readonly settingsContainerControlsID = 'settingsContainerControls'
  public static readonly settingsContainerControlsWrapperID = 'settingsContainerControlsWrapper'
  public static readonly leaveButtonWrapperID = 'leaveButtonWrapper'

  settings: HTMLDivElement
  settingsWrapper: HTMLDivElement
  settingsContainer: HTMLDivElement
  settingsContainerWrapper: HTMLDivElement

  permanentAds: HTMLInputElement

  constructor(destroy: () => void) {
    const image = document.createElement('img')
    image.src = '/assets/settingsCustomIcon.png'

    this.settings = document.createElement('div')
    this.settings.addEventListener('click', () => {
      this.settingsContainerWrapper.style.right =
        this.settingsContainerWrapper.style.right === '10px' ? '-400px' : '10px'
      this.settings.id =
        this.settings.id === 'settingsButtonActive' ? 'settingsButton' : 'settingsButtonActive'
      this.settingsWrapper.id =
        this.settingsWrapper.id === 'settingsButtonWrapperActive'
          ? 'settingsButtonWrapper'
          : 'settingsButtonWrapperActive'
    })
    this.settings.id = SettingsView.settingsID

    this.settingsWrapper = document.createElement('div')
    this.settingsWrapper.id = SettingsView.settingsWrapperID

    this.settings.appendChild(image)
    this.settingsWrapper.appendChild(this.settings)

    this.settingsContainer = document.createElement('div')
    this.settingsContainer.id = SettingsView.settingsContainerID

    this.permanentAds = document.createElement('input')
    this.permanentAds.type = 'checkbox'
    this.permanentAds.checked = true
    const permanentAdsLabel = document.createElement('label')
    permanentAdsLabel.innerText = 'Zawsze widoczne ogłoszenia'
    const settingsRow = document.createElement('div')
    settingsRow.appendChild(this.permanentAds)
    settingsRow.appendChild(permanentAdsLabel)
    this.settingsContainer.appendChild(settingsRow)

    const controlsWrapper = document.createElement('div')
    controlsWrapper.id = SettingsView.settingsContainerControlsWrapperID
    const controlsBox = document.createElement('div')
    controlsBox.id = SettingsView.settingsContainerControlsID
    controlsWrapper.appendChild(controlsBox)
    const controlsLabel = document.createElement('h3')
    controlsLabel.textContent = '- Sterowanie -'
    const divUp = document.createElement('div')
    const descUp = document.createElement('h3')
    const keyUp = document.createElement('h3')
    descUp.textContent = 'Góra'
    keyUp.textContent = 'W'
    divUp.appendChild(descUp)
    divUp.appendChild(keyUp)
    const divDown = document.createElement('div')
    const descDown = document.createElement('h3')
    const keyDown = document.createElement('h3')
    descDown.textContent = 'Dół'
    keyDown.textContent = 'S'
    divDown.appendChild(descDown)
    divDown.appendChild(keyDown)
    const divLeft = document.createElement('div')
    const descLeft = document.createElement('h3')
    const keyLeft = document.createElement('h3')
    descLeft.textContent = 'Lewo'
    keyLeft.textContent = 'A'
    divLeft.appendChild(descLeft)
    divLeft.appendChild(keyLeft)
    const divRight = document.createElement('div')
    const descRight = document.createElement('h3')
    const keyRight = document.createElement('h3')
    descRight.textContent = 'Prawo'
    keyRight.textContent = 'D'
    divRight.appendChild(descRight)
    divRight.appendChild(keyRight)
    const divAction = document.createElement('div')
    const descAction = document.createElement('h3')
    const keyAction = document.createElement('h3')
    descAction.textContent = 'Akcja'
    keyAction.textContent = 'Space'
    divAction.appendChild(descAction)
    divAction.appendChild(keyAction)
    const divFullView = document.createElement('div')
    const descFullView = document.createElement('h3')
    const keyFullView = document.createElement('h3')
    descFullView.textContent = 'Pełny widok'
    keyFullView.textContent = 'Shift'
    divFullView.appendChild(descFullView)
    divFullView.appendChild(keyFullView)
    controlsBox.appendChild(controlsLabel)
    controlsBox.appendChild(divUp)
    controlsBox.appendChild(divDown)
    controlsBox.appendChild(divLeft)
    controlsBox.appendChild(divRight)
    controlsBox.appendChild(divAction)
    controlsBox.appendChild(divFullView)
    this.settingsContainer.appendChild(controlsWrapper)

    const leaveButton = document.createElement('button')
    leaveButton.innerHTML = 'Opuść grę'
    leaveButton.addEventListener('click', () => {
      destroy()
      window.location.href = '/home'
    })
    const leaveButtonWrapper = document.createElement('div')
    leaveButtonWrapper.id = SettingsView.leaveButtonWrapperID
    leaveButtonWrapper.appendChild(leaveButton)
    this.settingsContainer.appendChild(leaveButtonWrapper)

    this.settingsContainerWrapper = document.createElement('div')
    this.settingsContainerWrapper.id = SettingsView.settingsContainerWrapperID

    this.settingsContainerWrapper.appendChild(this.settingsContainer)
  }

  show(): void {
    window.document.body.appendChild(this.settingsWrapper)
    window.document.body.appendChild(this.settingsContainerWrapper)
  }

  close(): void {
    document.getElementById(SettingsView.settingsWrapperID)?.remove()
    document.getElementById(SettingsView.settingsContainerWrapperID)?.remove()
  }

  permanentAdsSetting(): boolean {
    return this.permanentAds.checked
  }
}
