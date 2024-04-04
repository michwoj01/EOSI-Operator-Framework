import { type EndGameStatus } from '../../services/game/Types'

export class LeaderboardView {
  public static readonly leaderboardID = 'leaderboard'
  public static readonly leaderboardTitleBoxWrapperID = 'leaderboardTitleBoxWrapper'
  public static readonly leaderboardTitleBoxID = 'leaderboardTitleBox'
  public static readonly leaderboardHeaderBoxWrapperID = 'leaderboardHeaderBoxWrapper'
  public static readonly leaderboardHeaderBoxID = 'leaderboardHeaderBox'
  public static readonly leaderboardContentBoxID = 'leaderboardContentBox'
  public static readonly leaderboardContentBoxWrapperID = 'leaderboardContentBoxWrapper'
  public static readonly leaderboardButtonID = 'leaderboardButton'
  public static readonly leaderboardButtonWrapperID = 'leaderboardButtonWrapper'
  public static readonly leaderboardButtonGlowID = 'leaderboardButtonGlow'

  private readonly leaderboard: HTMLDivElement

  constructor(status: EndGameStatus, playerId: string, destroy: () => void) {
    this.leaderboard = document.createElement('div')
    this.leaderboard.id = LeaderboardView.leaderboardID

    const leaderboardTitleBoxWrapper = document.createElement('div')
    leaderboardTitleBoxWrapper.id = LeaderboardView.leaderboardTitleBoxWrapperID

    const leaderboardTitleBox = document.createElement('div')
    leaderboardTitleBox.id = LeaderboardView.leaderboardTitleBoxID

    const leaderboardHeaderBoxWrapper = document.createElement('div')
    leaderboardHeaderBoxWrapper.id = LeaderboardView.leaderboardHeaderBoxWrapperID

    const leaderboardHeaderBox = document.createElement('div')
    leaderboardHeaderBox.id = LeaderboardView.leaderboardHeaderBoxID

    const leaderboardContentBox = document.createElement('div')
    leaderboardContentBox.id = LeaderboardView.leaderboardContentBoxID

    const scrollBox = document.createElement('div')

    const leaderboardContentBoxWrapper = document.createElement('div')
    leaderboardContentBoxWrapper.id = LeaderboardView.leaderboardContentBoxWrapperID

    const leaderboardButton = document.createElement('button')
    leaderboardButton.id = LeaderboardView.leaderboardButtonID

    const leaderboardButtonWrapper = document.createElement('div')
    leaderboardButtonWrapper.id = LeaderboardView.leaderboardButtonWrapperID

    const leaderboardButtonGlow = document.createElement('div')
    leaderboardButtonGlow.id = LeaderboardView.leaderboardButtonGlowID

    leaderboardHeaderBoxWrapper.appendChild(leaderboardHeaderBox)
    const title = document.createElement('h2')
    title.innerText = 'KONIEC GRY'
    const subtitle = document.createElement('h4')
    subtitle.innerText = 'WYNIKI'
    leaderboardHeaderBox.appendChild(title)
    leaderboardHeaderBox.appendChild(subtitle)

    leaderboardTitleBoxWrapper.appendChild(leaderboardTitleBox)
    const star1 = document.createElement('img')
    star1.src = '/assets/starCustomIcon.png'
    const star2 = document.createElement('img')
    star2.src = '/assets/starCustomIcon.png'
    leaderboardTitleBox.appendChild(star1)
    leaderboardTitleBox.appendChild(leaderboardHeaderBoxWrapper)
    leaderboardTitleBox.appendChild(star2)

    leaderboardContentBoxWrapper.appendChild(leaderboardContentBox)
    leaderboardContentBox.appendChild(scrollBox)
    let counter = 0
    let toAdd = 1
    let lastMoney = -1
    status.playersLeaderboard.forEach((el) => {
      if (lastMoney !== el.money) {
        counter = counter + toAdd
        toAdd = 1
      } else {
        toAdd = toAdd + 1
      }

      const rowWrapper = document.createElement('div')
      const row = document.createElement('div')
      if (el.playerId === playerId) {
        row.style.backgroundColor = '#D39F59'
      }
      const leftSide = document.createElement('div')
      const rightSide = document.createElement('div')

      if (counter < 4) {
        const position = document.createElement('img')
        position.id = 'playerPositionTOP3'
        if (counter === 1) {
          position.src = '/assets/firstPlaceCustomIcon.png'
        } else if (counter === 2) {
          position.src = '/assets/secondPlaceCustomIcon.png'
        } else {
          position.src = '/assets/thirdPlaceCustomIcon.png'
        }
        leftSide.appendChild(position)
      } else {
        const position = document.createElement('div')
        position.id = 'playerPosition'
        position.innerText = counter.toString()
        leftSide.appendChild(position)
      }
      const name = document.createElement('h6')
      name.innerText = el.playerId
      leftSide.appendChild(name)

      const money = document.createElement('h6')
      money.innerText = el.money.toString()
      const coin = document.createElement('img')
      coin.src = '/assets/coinCustomIcon.png'
      coin.style.width = '30px'
      rightSide.appendChild(coin)
      rightSide.appendChild(money)

      row.appendChild(leftSide)
      row.appendChild(rightSide)
      rowWrapper.appendChild(row)
      scrollBox.appendChild(rowWrapper)

      lastMoney = el.money
    })

    leaderboardButtonGlow.appendChild(leaderboardButtonWrapper)
    leaderboardButtonWrapper.appendChild(leaderboardButton)
    leaderboardButton.innerText = 'Zakończ'
    leaderboardButton.addEventListener('click', () => {
      destroy()
      window.location.href = '/home'
    })

    this.leaderboard.appendChild(leaderboardTitleBoxWrapper)
    this.leaderboard.appendChild(leaderboardContentBoxWrapper)
    this.leaderboard.appendChild(leaderboardButtonGlow)
  }

  public show(): void {
    window.document.body.appendChild(this.leaderboard)
  }

  public close(): void {
    document.getElementById(LeaderboardView.leaderboardID)?.remove()
  }
}
