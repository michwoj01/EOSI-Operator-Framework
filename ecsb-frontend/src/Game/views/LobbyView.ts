export class LobbyView {
  public static readonly lobbyID = 'lobby'
  public static readonly lobbyLogoID = 'lobbyLogo'
  public static readonly lobbyLogoWrapperID = 'lobbyLogoWrapper'
  public static readonly lobbyInfoID = 'lobbyInfo'
  public static readonly lobbyInfoWrapperID = 'lobbyInfoWrapper'
  public static readonly lobbyInfoLabelID = 'lobbyInfoLabel'
  public static readonly lobbyInfoCounterID = 'lobbyInfoConter'
  public static readonly lobbyGameStateID = 'lobbyGameState'
  public static readonly lobbyGameStateWrapperID = 'lobbyGameStateWrapper'

  private readonly lobby: HTMLDivElement
  private readonly lobbyInfoCounter: HTMLHeadingElement
  private readonly lobbyMessage: HTMLHeadingElement

  constructor(amount: number, total: number) {
    this.lobby = document.createElement('div')
    this.lobby.id = LobbyView.lobbyID

    const lobbyLogoImg = document.createElement('img')
    lobbyLogoImg.src = '/assets/logo.png'
    lobbyLogoImg.style.width = '180px'

    const lobbyLogo = document.createElement('div')
    lobbyLogo.id = LobbyView.lobbyLogoID
    lobbyLogo.appendChild(lobbyLogoImg)

    const lobbyLogoWrapper = document.createElement('div')
    lobbyLogoWrapper.id = LobbyView.lobbyLogoWrapperID
    lobbyLogoWrapper.appendChild(lobbyLogo)

    const lobbyInfoLabel = document.createElement('h2')
    lobbyInfoLabel.id = LobbyView.lobbyInfoLabelID
    lobbyInfoLabel.innerText = 'Ilość graczy:'

    this.lobbyInfoCounter = document.createElement('h1')
    this.lobbyInfoCounter.id = LobbyView.lobbyInfoCounterID
    this.lobbyInfoCounter.innerText = `${amount}/${total}`

    const lobbyInfo = document.createElement('div')
    lobbyInfo.id = LobbyView.lobbyInfoID
    lobbyInfo.appendChild(lobbyInfoLabel)
    lobbyInfo.appendChild(this.lobbyInfoCounter)

    const lobbyInfoWrapper = document.createElement('div')
    lobbyInfoWrapper.id = LobbyView.lobbyInfoWrapperID
    lobbyInfoWrapper.appendChild(lobbyInfo)

    this.lobbyMessage = document.createElement('h2')
    this.lobbyMessage.innerText =
      amount >= total
        ? 'Gra rozpocznie się za kilka sekund.'
        : 'Gra rozpocznie się po dołączeniu wszystkich graczy.'
    this.lobbyMessage.style.color = amount >= total ? '#677818' : '#000000'

    const lobbyGameState = document.createElement('div')
    lobbyGameState.id = LobbyView.lobbyGameStateID
    lobbyGameState.appendChild(this.lobbyMessage)

    const lobbyGameStateWrapper = document.createElement('div')
    lobbyGameStateWrapper.id = LobbyView.lobbyGameStateWrapperID
    lobbyGameStateWrapper.appendChild(lobbyGameState)

    this.lobby.appendChild(lobbyLogoWrapper)
    this.lobby.appendChild(lobbyInfoWrapper)
    this.lobby.appendChild(lobbyGameStateWrapper)
  }

  public update(amount: number, total: number): void {
    this.lobbyInfoCounter.innerText = `${amount}/${total}`

    this.lobbyMessage.innerText =
      amount >= total
        ? 'Gra rozpocznie się za kilka sekund.'
        : 'Gra rozpocznie się po dołączeniu wszystkich graczy.'
    this.lobbyMessage.style.color = amount >= total ? '#677818' : '#000000'
  }

  public show(): void {
    if (!document.getElementById(LobbyView.lobbyID)) {
      window.document.body.appendChild(this.lobby)
    }
  }

  public close(): void {
    document.getElementById(LobbyView.lobbyID)?.remove()
  }
}
