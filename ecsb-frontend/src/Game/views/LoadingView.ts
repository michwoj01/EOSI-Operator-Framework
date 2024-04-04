export class LoadingView {
  public static readonly loadingBoxID = 'loadingBox'
  public static readonly loadingBoxSpinnerContainerID = 'loadingBoxSpinnerContainer'
  public static readonly loadingBoxSpinnerID = 'loadingBoxSpinner'

  private readonly loadingBox: HTMLDivElement

  constructor() {
    this.loadingBox = document.createElement('div')
    this.loadingBox.id = LoadingView.loadingBoxID

    const spinnerContainer = document.createElement('div')
    spinnerContainer.id = LoadingView.loadingBoxSpinnerContainerID

    const spinner = document.createElement('div')
    spinner.id = LoadingView.loadingBoxSpinnerID

    spinnerContainer.appendChild(spinner)
    this.loadingBox.appendChild(spinnerContainer)
  }

  public show(): void {
    if (!document.getElementById(LoadingView.loadingBoxID)) {
      window.document.body.appendChild(this.loadingBox)
    }
  }

  public close(): void {
    document.getElementById(LoadingView.loadingBoxID)?.remove()
  }
}
