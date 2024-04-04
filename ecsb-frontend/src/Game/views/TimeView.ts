import { ONE_SECOND } from '../GameUtils'

export class TimeView {
  public static readonly timeTokenBoxID = 'timeTokenBox'
  public static readonly timeTokenBoxWrapperID = 'timeTokenBoxWrapper'
  public static readonly timerBoxID = 'timerBox'
  public static readonly timerBoxWrapperID = 'timerBoxWrapper'

  timeTokenBox: HTMLDivElement
  timeTokenBoxWrapper: HTMLDivElement
  timerBox: HTMLDivElement
  timerBoxWrapper: HTMLDivElement
  clock: HTMLDivElement
  time: HTMLSpanElement
  remaining: number
  total: number
  tokens: boolean[]

  constructor(columns: number, remaining: number, total: number) {
    this.remaining = remaining
    this.total = total
    this.tokens = []
    for (let i = 0; i < columns * 2; i++) {
      this.tokens.push(true)
    }

    this.timeTokenBox = document.createElement('div')
    this.timeTokenBox.id = TimeView.timeTokenBoxID

    this.timeTokenBoxWrapper = document.createElement('div')
    this.timeTokenBoxWrapper.id = TimeView.timeTokenBoxWrapperID

    for (let i = 1; i <= columns; i++) {
      const col = document.createElement('div')

      const token1 = document.createElement('div')
      token1.id = `timeToken-${i}-1`
      const token1Wrapper = document.createElement('div')
      token1Wrapper.appendChild(token1)

      const token2 = document.createElement('div')
      token2.id = `timeToken-${i}-2`
      const token2Wrapper = document.createElement('div')
      token2Wrapper.appendChild(token2)

      const tokenClockFace1 = document.createElement('div')
      tokenClockFace1.appendChild(document.createElement('span'))
      tokenClockFace1.appendChild(document.createElement('span'))
      tokenClockFace1.appendChild(document.createElement('span'))
      const tokenClockFace2 = document.createElement('div')
      tokenClockFace2.appendChild(document.createElement('span'))
      tokenClockFace2.appendChild(document.createElement('span'))
      tokenClockFace2.appendChild(document.createElement('span'))

      token1.appendChild(tokenClockFace1)
      token2.appendChild(tokenClockFace2)
      col.appendChild(token1Wrapper)
      col.appendChild(token2Wrapper)
      this.timeTokenBox.appendChild(col)
    }

    this.timerBox = document.createElement('div')
    this.timerBox.id = TimeView.timerBoxID

    this.timerBoxWrapper = document.createElement('div')
    this.timerBoxWrapper.id = TimeView.timerBoxWrapperID

    this.clock = document.createElement('div')
    this.clock.id = 'clock'
    const clockFace = document.createElement('div')
    this.time = document.createElement('span')
    clockFace.appendChild(this.time)
    this.clock.appendChild(clockFace)

    this.timeTokenBoxWrapper.appendChild(this.timeTokenBox)
    this.timerBoxWrapper.appendChild(this.timerBox)
  }

  show(): void {
    window.document.body.appendChild(this.timeTokenBoxWrapper)
    window.document.body.appendChild(this.timerBoxWrapper)
  }

  close(): void {
    document.getElementById(TimeView.timeTokenBoxWrapperID)?.remove()
    document.getElementById(TimeView.timerBoxWrapperID)?.remove()
  }

  startTimer(): void {
    this.timerBox.appendChild(this.clock)
    this.evaluateTimer()
  }

  private evaluateTimer(): void {
    const clock = document.getElementById('clock')
    if (clock) {
      clock.style.backgroundImage = `conic-gradient(#EDB872 ${
        ((this.total - this.remaining) * 100) / this.total
      }%, 0, #677818)`
    }
    const remainingMinutes = Math.floor(this.remaining / 60)
    let remainingMinutesString = remainingMinutes.toString()
    if (remainingMinutes < 10) {
      remainingMinutesString = '0' + remainingMinutesString
    }
    const remainingSeconds = this.remaining % 60
    let remainingSecondsString = remainingSeconds.toString()
    if (remainingSeconds < 10) {
      remainingSecondsString = '0' + remainingSecondsString
    }
    this.time.textContent = `${remainingMinutesString}:${remainingSecondsString}`
    if (this.remaining <= 0) {
      return
    }
    this.remaining = this.remaining - 1

    setTimeout(() => {
      this.evaluateTimer()
    }, ONE_SECOND)
  }

  endTimer(): void {
    this.remaining = 0
  }

  setTimerWithTotal(remaining: number, total: number): void {
    this.remaining = remaining
    this.total = total
  }

  setTimer(remaining: number): void {
    this.remaining = remaining
  }

  setTimeToken(tokenID: number, actual: number, max: number): void {
    this.tokens[tokenID] = actual === max

    const row = Math.floor(tokenID / Math.floor(this.tokens.length / 2)) + 1
    const column = (tokenID % Math.floor(this.tokens.length / 2)) + 1

    const token = document.getElementById(`timeToken-${column}-${row}`)
    if (token?.getElementsByTagName('div')) {
      token.getElementsByTagName('div')[0].style.backgroundImage = `conic-gradient(#ffffff ${
        (actual * 100) / max
      }%, 0, #E49045)`
    }
  }

  getAvailableTokens(): number {
    let available = 0
    this.tokens.forEach((el) => {
      if (el) {
        available = available + 1
      }
    })
    return available
  }
}
