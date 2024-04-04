export class UserDataView {
  public static readonly userDataBoxWrapperID = 'userDataBoxWrapper'
  public static readonly userDataBoxID = 'userDataBox'

  private readonly userDataBox: HTMLDivElement
  private readonly userName: HTMLHeadingElement
  private readonly userClassName: HTMLHeadingElement
  private readonly userDataBoxWrapper: HTMLDivElement

  constructor(userName: string, userClassName: string) {
    this.userDataBox = document.createElement('div')
    this.userDataBox.id = UserDataView.userDataBoxID

    this.userName = document.createElement('h1')
    this.userName.innerText = userName

    this.userClassName = document.createElement('h2')
    this.userClassName.innerText = userClassName

    this.userDataBox.appendChild(this.userName)
    this.userDataBox.appendChild(this.userClassName)

    this.userDataBoxWrapper = document.createElement('div')
    this.userDataBoxWrapper.id = UserDataView.userDataBoxWrapperID
    this.userDataBoxWrapper.appendChild(this.userDataBox)
  }

  public show(): void {
    window.document.body.appendChild(this.userDataBoxWrapper)
  }

  public close(): void {
    document.getElementById(UserDataView.userDataBoxWrapperID)?.remove()
  }
}
