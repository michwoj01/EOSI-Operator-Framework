import * as Phaser from 'phaser'
import type { GridEngine, Position } from 'grid-engine'
import { Direction } from 'grid-engine'
import type { Websocket } from 'websocket-ts'
import { WebsocketBuilder } from 'websocket-ts'
import type {
  AssetConfig,
  CoopEquipmentDto,
  EndGameStatus,
  Equipment,
  GameResourceDto,
  GameSettings,
  GameStatus,
  TradeEquipment,
} from '../../services/game/Types'
import {
  CloudType,
  type PlannedTravel,
  type Controls,
  type Coordinates,
  type PlayerId,
  type PlayerState,
} from './Types'
import { decodeGameToken } from '../../apis/apis'
import { TradeView } from '../views/TradeView'
import gameService from '../../services/game/GameService'
import { EquipmentView } from '../views/EquipmentView'
import { toast } from 'react-toastify'
import { TradeOfferPopup } from '../components/TradeOfferPopup'
import { WorkshopView } from '../views/WorkshopView'
import { LoadingView } from '../views/LoadingView'
import { type ChatMessage, parseChatMessage } from '../webSocketMessage/chat/MessageParser'
import {
  type MovementMessage,
  MovementMessageType,
  sendMovementMessage,
} from '../webSocketMessage/movement/MovementMessage'
import { parseMovementMessage } from '../webSocketMessage/movement/MessageParser'
import {
  IncomingTradeMessageType,
  OutcomingTradeMessageType,
  sendTradeMessage,
} from '../webSocketMessage/chat/TradeMessageHandler'
import { BackendWarningMessageType } from '../webSocketMessage/chat/BackendWarningMessage'
import {
  NotificationMessageType,
  sendNotificationMessage,
  type tradeSyncValue,
} from '../webSocketMessage/chat/NotificationMessage'
import { InteractionCloudBuilder } from '../tools/InteractionCloudBuilder'
import { ContextMenuBuilder } from '../tools/ContextMenuBuilder'
import { TravelType, TravelView } from '../views/TravelView'
import { ImageCropper } from '../tools/ImageCropper'
import {
  ALL_PLAYERS_DESC_OFFSET_TOP,
  CHARACTER_ASSET_KEY,
  ERROR_TIMEOUT,
  getPlayerMapping,
  getResourceMapping,
  INFORMATION_TIMEOUT,
  LAYER_SCALE,
  MAP_ASSET_KEY,
  PLAYER_DESC_OFFSET_LEFT,
  RANGE,
  RESOURCE_ICON_SCALE,
  RESOURCE_ICON_WIDTH,
  SPACE_PRESS_ACTION_PREFIX,
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  TILES_ASSET_KEY,
  TIMEOUT_OFFSET,
} from '../GameUtils'
import { EquipmentMessageType } from '../webSocketMessage/chat/EqupimentMessage'
import { sendUserMessage, UserMessageType } from '../webSocketMessage/chat/UserMessage'
import { UserDataView } from '../views/UserDataView'
import { ErrorView } from '../views/ErrorView'
import { TimeView } from '../views/TimeView'
import { SettingsView } from '../views/SettingsView'
import { StatusAndCoopView } from '../views/StatusAndCoopView'
import { AdvertisementInfoBuilder } from '../tools/AdvertisementInfoBuilder'
import Key = Phaser.Input.Keyboard.Key
import { TimeMessageType, sendTimeMessage } from '../webSocketMessage/chat/TimeMessage'
import { LeaderboardView } from '../views/LeaderboardView'
import { parseLobbyMessage } from '../webSocketMessage/lobby/MessageParser'
import { LobbyMessageType } from '../webSocketMessage/lobby/LobbyMessage'
import { LobbyView } from '../views/LobbyView'
import { LoadingBarAndResultBuilder } from '../tools/LoadingBarAndResultBuilder'
import {
  IncomingCoopMessageType,
  OutcomingCoopMessageType,
  sendCoopMessage,
} from '../webSocketMessage/chat/CoopMessageHandler'
import { IncomingWorkshopMessageType } from '../webSocketMessage/chat/WorkshopMessageHandler'
import { type Travel } from '../../apis/game/Types'
import { InformationView } from '../views/InformationView'
import { CoopOfferPopup } from '../components/CoopOfferPopup'
import { ResourceNegotiationView } from '../views/ResourceNegotiationView'
import { clearOverlayWindows } from '../Game'

const VITE_ECSB_MOVEMENT_WS_API_URL: string = import.meta.env
  .VITE_ECSB_MOVEMENT_WS_API_URL as string
const VITE_ECSB_CHAT_WS_API_URL: string = import.meta.env.VITE_ECSB_CHAT_WS_API_URL as string
const VITE_ECSB_LOBBY_WS_API_URL: string = import.meta.env.VITE_ECSB_LOBBY_WS_API_URL as string
const VITE_ECSB_HTTP_AUTH_AND_MENAGEMENT_API_URL: string = import.meta.env
  .VITE_ECSB_HTTP_AUTH_AND_MENAGEMENT_API_URL

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
}

export class Scene extends Phaser.Scene {
  private readonly gridEngine!: GridEngine
  private readonly gameToken: string
  readonly playerId: PlayerId
  public readonly status: GameStatus
  public readonly settings: GameSettings
  private readonly lowTravels: Coordinates[]
  private readonly mediumTravels: Coordinates[]
  private readonly highTravels: Coordinates[]
  private readonly playerWorkshopsCoordinates: Coordinates[]
  public playerCloudMovement!: Map<PlayerId, boolean>
  public playerWorkshopUnitPrice = 0
  public playerWorkshopResouseName = ''
  public playerWorkshopMaxProduction = 0
  public readonly players: Record<PlayerId, PlayerState>
  public playersClasses!: Map<PlayerId, string>
  public actionTrade: string | null
  public tradeWindow: TradeView | null
  public userDataView: UserDataView
  public timeView: TimeView | null
  public settingsView: SettingsView
  public statusAndCoopView: StatusAndCoopView | null
  public equipmentView: EquipmentView | null
  public workshopView: WorkshopView | null
  public travelView: TravelView | null
  public informationActionPopup: InformationView
  public loadingView: LoadingView
  public leaderboardView: LeaderboardView | null
  public lobbyView: LobbyView | null
  public resourceNegotiationView: ResourceNegotiationView | null
  public interactionCloudBuiler!: InteractionCloudBuilder
  public advertisementInfoBuilder!: AdvertisementInfoBuilder
  public contextMenuBuilder!: ContextMenuBuilder
  public imageCropper!: ImageCropper
  public loadingBarBuilder: LoadingBarAndResultBuilder | undefined
  public movingEnabled: boolean
  private lobbyWs!: Websocket
  private movementWs!: Websocket
  public chatWs!: Websocket
  public equipment?: Equipment
  public otherPlayerId?: PlayerId
  public characterUrl!: string
  public resourceUrl!: string
  public tileUrl!: string
  private receivedTimeSync = false
  private receivedPlayerSync = false
  private readonly chatQueue: ChatMessage[] = []
  public plannedTravel: PlannedTravel | null
  public shownGatheredResourcesMessage: boolean
  public playerAdvertisedTravel: Record<PlayerId, string>

  constructor(
    gameToken: string,
    userStatus: GameStatus,
    settings: GameSettings,
    mapConfig: AssetConfig,
    characterUrl: string,
    resourceUrl: string,
    tileUrl: string,
  ) {
    super(sceneConfig)
    this.gameToken = gameToken
    this.playerId = decodeGameToken(gameToken).playerId
    this.status = userStatus
    this.settings = settings
    this.players = {}
    this.actionTrade = null
    this.movingEnabled = false
    this.tradeWindow = null
    this.userDataView = new UserDataView(this.playerId, this.status.className)
    this.timeView = null
    this.settingsView = new SettingsView(() => {
      this.destroy()
    })
    this.statusAndCoopView = null
    this.equipmentView = null
    this.workshopView = null
    this.informationActionPopup = new InformationView()
    this.loadingView = new LoadingView()
    this.lobbyView = null
    this.leaderboardView = null
    this.travelView = null
    this.resourceNegotiationView = null
    this.plannedTravel = null
    this.shownGatheredResourcesMessage = false
    this.playerAdvertisedTravel = {}
    this.interactionCloudBuiler = new InteractionCloudBuilder()
    this.advertisementInfoBuilder = new AdvertisementInfoBuilder(this)
    this.contextMenuBuilder = new ContextMenuBuilder()
    this.imageCropper = new ImageCropper()
    this.playerCloudMovement = new Map()
    this.playersClasses = new Map()
    this.lowTravels = mapConfig.lowLevelTravels
    this.mediumTravels = mapConfig.mediumLevelTravels
    this.highTravels = mapConfig.highLevelTravels
    this.characterUrl = characterUrl
    this.resourceUrl = resourceUrl
    this.tileUrl = tileUrl

    this.playerWorkshopsCoordinates = mapConfig.professionWorkshops[userStatus.className]

    settings.classResourceRepresentation.forEach((dto) => {
      if (dto.key === userStatus.className) {
        this.playerWorkshopUnitPrice = dto.value.unitPrice
        this.playerWorkshopResouseName = dto.value.gameResourceName
        this.playerWorkshopMaxProduction = dto.value.maxProduction
      }
    })
  }

  preload(): void {
    this.load.tilemapTiledJSON(
      MAP_ASSET_KEY,
      `${VITE_ECSB_HTTP_AUTH_AND_MENAGEMENT_API_URL}/assets/${this.settings.gameAssets.mapAssetId}`,
    )
    this.load.image(TILES_ASSET_KEY, this.tileUrl)
    this.load.spritesheet(CHARACTER_ASSET_KEY, this.characterUrl, {
      frameWidth: SPRITE_WIDTH,
      frameHeight: SPRITE_HEIGHT,
    })
  }

  create(): void {
    const tilemap = this.make.tilemap({ key: MAP_ASSET_KEY })
    tilemap.addTilesetImage('Overworld', TILES_ASSET_KEY)

    for (let i = 0; i < tilemap.layers.length; i++) {
      const layer = tilemap.createLayer(i, 'Overworld', 0, 0)
      layer.scale = LAYER_SCALE
    }

    this.loadingBarBuilder = new LoadingBarAndResultBuilder(
      tilemap.tileWidth,
      tilemap.tileHeight,
      this,
    )

    const playerSprite = this.add.sprite(0, 0, CHARACTER_ASSET_KEY)
    const text = this.add.text(PLAYER_DESC_OFFSET_LEFT, ALL_PLAYERS_DESC_OFFSET_TOP, 'You')
    text.setColor('#000000')
    text.setFontFamily('Georgia, serif')

    this.playerCloudMovement.set(this.playerId, false)
    this.playersClasses.set(this.playerId, this.status.className)

    const cloud = this.interactionCloudBuiler.build(this, this.playerId)
    const adBubble = this.advertisementInfoBuilder.build(this.playerId)
    this.advertisementInfoBuilder.setMarginAndVisibility(this.playerId)

    this.cameras.main.setBounds(
      0,
      0,
      tilemap.widthInPixels * LAYER_SCALE,
      tilemap.heightInPixels * LAYER_SCALE,
    )

    const container = this.add.container(0, 0, [playerSprite, text, cloud, adBubble])

    this.cameras.main.startFollow(container, true)
    this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height)

    const gridEngineConfig = {
      characters: [
        {
          id: this.playerId,
          sprite: playerSprite,
          container,
          walkingAnimationMapping: getPlayerMapping(this.settings.classResourceRepresentation)(
            this.status.className,
          ),
          speed: this.settings.walkingSpeed,
          startPosition: this.status.coords,
          collides: true,
        },
      ],
      numberOfDirections: 8,
    }

    this.players[this.playerId] = {
      coords: this.status.coords,
      direction: this.status.direction as Direction,
      sprite: playerSprite,
    }
    this.gridEngine.create(tilemap, gridEngineConfig)

    this.configureLobbyWebSocket()

    this.gridEngine.positionChangeStarted().subscribe(({ charId, exitTile, enterTile }) => {
      if (charId === this.playerId) {
        const direction = this.getDirection(exitTile, enterTile)

        sendMovementMessage(this.movementWs, {
          type: MovementMessageType.Move,
          coords: {
            x: enterTile.x,
            y: enterTile.y,
          },
          direction: direction,
        })

        this.players[this.playerId].coords = { x: enterTile.x, y: enterTile.y }
        this.players[this.playerId].direction = direction
      }
    })

    this.gridEngine.positionChangeFinished().subscribe(({ charId, exitTile, enterTile }) => {
      if (charId !== this.playerId) {
        this.gridEngine.turnTowards(charId, this.players[charId].direction)
        return
      }

      if (charId === this.playerId) {
        if (
          this.playerWorkshopsCoordinates.some(
            (coord) => coord.x === enterTile.x && coord.y === enterTile.y,
          )
        ) {
          this.informationActionPopup.setText(
            `${SPACE_PRESS_ACTION_PREFIX} rozpocząć wytwarzanie...`,
          )
          this.informationActionPopup.show()
        } else if (
          this.lowTravels.some((coord) => coord.x === enterTile.x && coord.y === enterTile.y)
        ) {
          this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} odbyć krótką podróż...`)
          this.informationActionPopup.show()
        } else if (
          this.mediumTravels.some((coord) => coord.x === enterTile.x && coord.y === enterTile.y)
        ) {
          this.informationActionPopup.setText(
            `${SPACE_PRESS_ACTION_PREFIX} odbyć średnią podróż...`,
          )
          this.informationActionPopup.show()
        } else if (
          this.highTravels.some((coord) => coord.x === enterTile.x && coord.y === enterTile.y)
        ) {
          this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} odbyć długą podróż...`)
          this.informationActionPopup.show()
        } else {
          this.informationActionPopup.close()
        }
      }
    })

    this.input.on(
      'pointerdown',
      (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
        if (gameObjects.length === 0) {
          window.document.getElementById('btns')?.remove()
          this.actionTrade = null
        }
      },
    )

    gameService
      .getPlayerEquipment()
      .then((eq: Equipment) => {
        this.equipment = eq
        this.equipmentView = new EquipmentView(
          eq,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
        )
        this.equipmentView.show()
        this.statusAndCoopView = new StatusAndCoopView(
          eq,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
          this,
        )
        this.statusAndCoopView.show()
      })
      .catch((err) => {
        console.error(err)
      })

    this.userDataView.show()

    const errorsAndInfo = document.createElement('div')
    errorsAndInfo.id = 'errorsAndInfo'
    window.document.body.appendChild(errorsAndInfo)

    this.settingsView.show()

    this.scale.resize(window.innerWidth, window.innerHeight)

    if (
      this.playerWorkshopsCoordinates.some(
        (coord) => coord.x === this.status.coords.x && coord.y === this.status.coords.y,
      )
    ) {
      this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} rozpocząć wytwarzanie...`)
      this.informationActionPopup.show()
    } else if (
      this.lowTravels.some(
        (coord) => coord.x === this.status.coords.x && coord.y === this.status.coords.y,
      )
    ) {
      this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} odbyć krótką podróż...`)
      this.informationActionPopup.show()
    } else if (
      this.mediumTravels.some(
        (coord) => coord.x === this.status.coords.x && coord.y === this.status.coords.y,
      )
    ) {
      this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} odbyć średnią podróż...`)
      this.informationActionPopup.show()
    } else if (
      this.highTravels.some(
        (coord) => coord.x === this.status.coords.x && coord.y === this.status.coords.y,
      )
    ) {
      this.informationActionPopup.setText(`${SPACE_PRESS_ACTION_PREFIX} odbyć długą podróż...`)
      this.informationActionPopup.show()
    }
  }

  createTradeWindow = (targetId: string, isUserTurn: boolean): void => {
    this.tradeWindow = new TradeView(
      this,
      isUserTurn,
      this.playerId,
      this.equipment!,
      targetId,
      this.resourceUrl,
      this.settings.classResourceRepresentation,
    )
    this.tradeWindow.show()
  }

  configureLobbyWebSocket(): void {
    this.lobbyWs = new WebsocketBuilder(
      `${VITE_ECSB_LOBBY_WS_API_URL}/ws?gameToken=${this.gameToken}`,
    )
      .onOpen((i, ev) => {
        console.log('lobbyWs opened')
      })
      .onClose((i, ev) => {
        console.log('lobbyWs closed')
      })
      .onError((i, ev) => {
        console.error('lobbyWs error')
      })
      .onMessage((i, ev) => {
        const msg = parseLobbyMessage(ev.data)
        if (!msg) return

        switch (msg.type) {
          case LobbyMessageType.LobbyChange:
            if (!this.lobbyView) {
              this.lobbyView = new LobbyView(msg.playersAmount.amount, msg.playersAmount.needed)
              this.lobbyView.show()
            } else {
              this.lobbyView.update(msg.playersAmount.amount, msg.playersAmount.needed)
              this.lobbyView.show()
            }
            break
          case LobbyMessageType.LobbyStart:
            this.configureMovementWebSocket()
            this.configureChatWebSocket()
            this.lobbyView?.close()
            this.lobbyWs.close()
            break
          case LobbyMessageType.LobbyEnd:
            this.lobbyView?.close()
            gameService
              .getPlayerResults()
              .then((leaderboard: EndGameStatus) => {
                this.movingEnabled = false
                this.leaderboardView = new LeaderboardView(leaderboard, this.playerId, () => {
                  this.destroy()
                })
                this.leaderboardView.show()
              })
              .catch((err) => {
                console.error(err)
              })
            break
        }
      })
      .onRetry((i, ev) => {
        console.log('retry')
      })
      .build()
  }

  configureMovementWebSocket(): void {
    this.movementWs = new WebsocketBuilder(
      `${VITE_ECSB_MOVEMENT_WS_API_URL}/ws?gameToken=${this.gameToken}`,
    )
      .onOpen((i, ev) => {
        console.log('movementWs opened')

        sendMovementMessage(this.movementWs, {
          type: MovementMessageType.SyncRequest,
        })
      })
      .onClose((i, ev) => {
        console.log('movementWs closed')
        console.log(ev)

        clearOverlayWindows()

        this.movingEnabled = false
        const errorMessage = new ErrorView()
        errorMessage.setText('moveWs closed - please reconnect')
        errorMessage.show()
      })
      .onError((i, ev) => {
        console.error('movementWs error')
      })
      .onMessage((i, ev) => {
        const msg = parseMovementMessage(ev.data)
        if (!msg) return
        this.handleMovementMessage(msg)
      })
      .onRetry((i, ev) => {
        console.log('retry')
      })
      .build()
  }

  handleMovementMessage(msg: MovementMessage): void {
    switch (msg.type) {
      case MovementMessageType.PlayerSyncing:
        msg.players.forEach((player) => {
          if (!Object.keys(this.players).includes(player.playerPosition.id)) {
            this.addPlayer(
              player.playerPosition.id,
              player.playerPosition.coords,
              player.playerPosition.direction,
              player.className,
            )
          }
        })
        this.receivedPlayerSync = true
        break
      case MovementMessageType.PlayerAdded:
        if (!Object.keys(this.players).includes(msg.id)) {
          this.addPlayer(msg.id, msg.coords, msg.direction, msg.className)
        }
        break
      case MovementMessageType.PlayerMoved:
        if (Object.keys(this.players).includes(msg.id)) {
          this.movePlayer(msg.id, msg.coords, msg.direction)
        }
        break
      case MovementMessageType.PlayerRemoved:
        if (Object.keys(this.players).includes(msg.id)) {
          this.removePlayer(msg.id)
        }
        break
    }
  }

  configureChatWebSocket(): void {
    this.chatWs = new WebsocketBuilder(
      `${VITE_ECSB_CHAT_WS_API_URL}/ws?gameToken=${this.gameToken}`,
    )
      .onOpen((i, ev) => {
        this.loadingView.show()
        console.log('chatWs opened')

        sendTimeMessage(this.chatWs, {
          type: TimeMessageType.SyncRequest,
        })
        sendNotificationMessage(this.chatWs, {
          type: NotificationMessageType.NotificationSyncRequest,
        })
      })
      .onClose((i, ev) => {
        console.log('chatWs closed')
        console.log(ev)

        clearOverlayWindows()

        this.movingEnabled = false
        const errorMessage = new ErrorView()
        errorMessage.setText('chatWs closed - please reconnect')
        errorMessage.show()
      })
      .onError((i, ev) => {
        console.error('chatWs error')
      })
      .onMessage((i, ev) => {
        const msg = parseChatMessage(ev.data)
        if (!msg) return

        if (msg.message.type === TimeMessageType.SyncResponse) {
          this.loadingView.close()
          this.movingEnabled = true

          this.timeView = new TimeView(
            Math.floor(Object.keys(msg.message.timeTokens).length / 2),
            Math.floor(msg.message.timeLeftSeconds / 1000),
            Math.floor(this.settings.timeForGame / 1000),
          )
          this.timeView.show()
          this.timeView.startTimer()
          msg.message.timeTokens.forEach((el) => {
            this.timeView?.setTimeToken(el.key, el.value.actual, el.value.max)
          })

          while (this.chatQueue.length > 0) {
            const msg = this.chatQueue.shift()
            if (!msg) return

            this.handleChatMessage(msg)
          }

          this.receivedTimeSync = true
        } else {
          if (!this.receivedTimeSync || !this.receivedPlayerSync) {
            this.chatQueue.push(msg)
            return
          }

          this.handleChatMessage(msg)
        }
      })
      .onRetry((i, ev) => {
        console.log('retry')
      })
      .build()
  }

  handleChatMessage(msg: ChatMessage): void {
    switch (msg.message.type) {
      case IncomingTradeMessageType.TradeServerPropose:
        this.showTradeInvite(msg.senderId)
        break
      case IncomingTradeMessageType.TradeServerStart:
        this.otherPlayerId = msg.senderId
        this.createTradeWindow(msg.senderId, msg.message.myTurn)
        break
      case IncomingTradeMessageType.TradeServerCancel:
        this.tradeWindow?.close(false)
        if (msg.senderId !== this.playerId) {
          this.showErrorPopup(`Gracz ${msg.senderId} przerwał handel`)
        }
        break
      case IncomingTradeMessageType.TradeServerBid:
        this.updateTradeDialog(msg.message.tradeBid.senderRequest, msg.message.tradeBid.senderOffer)
        break
      case IncomingTradeMessageType.TradeServerFinish:
        this.tradeWindow?.close(true)
        break
      case IncomingWorkshopMessageType.WorkshopAccept:
        this.loadingBarBuilder!.setCoordinates(
          this.players[this.playerId].coords.x,
          this.players[this.playerId].coords.y,
        )
        this.loadingBarBuilder!.showLoadingBar(msg.message.time - TIMEOUT_OFFSET)
        this.workshopView?.close()
        break
      case IncomingWorkshopMessageType.WorkshopDeny:
        this.showErrorPopup(msg.message.reason)
        this.workshopView?.close()
        this.movingEnabled = true
        break
      case IncomingCoopMessageType.CoopTravelAccept:
        this.loadingBarBuilder!.setCoordinates(
          this.players[this.playerId].coords.x,
          this.players[this.playerId].coords.y,
        )
        this.loadingBarBuilder!.showLoadingBar(msg.message.time - TIMEOUT_OFFSET)
        this.travelView?.close()
        this.loadingView?.close()
        this.movingEnabled = false
        this.advertisementInfoBuilder.addBubbleForCoop('', this.playerId)
        this.advertisementInfoBuilder.setMarginAndVisibility(this.playerId)
        delete this.playerAdvertisedTravel[this.playerId]
        break
      case IncomingCoopMessageType.CoopTravelDeny:
        this.movingEnabled = true
        this.showErrorPopup(msg.message.reason)
        this.travelView?.close()
        this.loadingView?.close()
        break
      case IncomingCoopMessageType.CoopStartPlanning:
        this.planSingleTravel(msg.message.travelName)
        this.travelView?.close()
        this.movingEnabled = true
        break
      case IncomingCoopMessageType.CoopCancelPlanning:
        this.shownGatheredResourcesMessage = false
        this.cancelPlanningTravel()
        this.advertisementInfoBuilder.addBubbleForCoop('', this.playerId)
        this.advertisementInfoBuilder.setMarginAndVisibility(this.playerId)
        delete this.playerAdvertisedTravel[this.playerId]
        break
      case IncomingCoopMessageType.CoopCancel:
        if (msg.senderId !== this.playerId) {
          this.showErrorPopup(
            `Gracz ${msg.senderId} przerwał wspólne planowanie podróży do miasta ${this.plannedTravel?.travel.value.name}`,
          )
        }
        this.cancelPlanningTravel()
        break
      case IncomingCoopMessageType.CoopResourceChange:
        if (this.plannedTravel === null) {
          if (msg.message.equipments.length === 1) {
            this.planSingleTravel(msg.message.travelName)
          } else {
            this.planMultiTravel(msg.message.travelName, msg.message.equipments)
          }
          return
        }
        if (this.plannedTravel.isSingle) {
          if (msg.message.equipments.length === 1) {
            this.updateCoopPlayersEquipment(msg.message.equipments)
          } else {
            this.planMultiTravel(msg.message.travelName, msg.message.equipments)
          }
        } else {
          if (msg.message.equipments.length === 1) {
            this.planSingleTravel(msg.message.travelName)
          } else {
            this.updateCoopPlayersEquipment(msg.message.equipments)
          }
        }
        break
      case IncomingCoopMessageType.CoopGoToTravel:
      case IncomingCoopMessageType.CoopWaitForTravel:
        if (!this.shownGatheredResourcesMessage) {
          this.shownGatheredResourcesMessage = true
          this.showInformationPopup(
            `Uzbierano wymagane zasoby na wyprawe do miasta <strong>${msg.message.travelName}</strong>`,
          )
          if (msg.message.type === IncomingCoopMessageType.CoopGoToTravel) {
            this.showInformationPopup(
              `Udaj się do miasta <strong>${msg.message.travelName}</strong> na wyprawę`,
            )
          }
        }
        if (this.plannedTravel === null) {
          if (msg.message.equipments.length === 1) {
            this.planSingleTravel(msg.message.travelName)
          } else {
            this.planMultiTravel(msg.message.travelName, msg.message.equipments)
          }
        }
        this.fillCoopPlayersEquipment()
        break
      case IncomingCoopMessageType.CoopStartNegotiation:
        this.resourceNegotiationView = new ResourceNegotiationView(
          this,
          this.getTravelByName(msg.message.travelName)!,
          msg.senderId,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
          msg.message.myTurn,
        )
        this.resourceNegotiationView?.show()
        this.advertisementInfoBuilder.addBubbleForCoop('', this.playerId)
        this.advertisementInfoBuilder.setMarginAndVisibility(this.playerId)
        delete this.playerAdvertisedTravel[this.playerId]
        if (this.plannedTravel?.isSingle && this.plannedTravel?.wantToCooperate) {
          this.plannedTravel.wantToCooperate = false
          this.statusAndCoopView?.updateCoopView()
        }
        break
      case IncomingCoopMessageType.CoopFinishNegotiation:
        this.resourceNegotiationView?.close(true)
        this.loadingView.close()
        this.plannedTravel = null
        break
      case IncomingCoopMessageType.CoopCancelNegotiation:
        if (msg.senderId !== this.playerId) {
          this.showErrorPopup(
            `Gracz ${msg.senderId} przerwał negocjacje dotyczące podziału zasobów`,
          )
        }
        this.resourceNegotiationView?.close(false)
        break
      case IncomingCoopMessageType.CoopNegotiationBid:
        this.resourceNegotiationView?.update(true, msg.message.coopBid)
        break
      case IncomingCoopMessageType.CoopProposeOwnTravel:
        this.showCoopInvite(
          msg.senderId,
          msg.message.travelName,
          this.playerId !== msg.message.guestId,
          false,
          null,
        )
        break
      case IncomingCoopMessageType.CoopSimpleJoinPlanning:
        this.showCoopInvite(msg.senderId, this.plannedTravel!.travel.value.name, true, true, false)
        break
      case IncomingCoopMessageType.CoopGatheringJoinPlanning:
        this.showCoopInvite(msg.senderId, this.plannedTravel!.travel.value.name, true, true, true)
        break
      case IncomingCoopMessageType.CoopFinish:
        this.showInformationPopup(
          `Współpraca z graczem ${this.plannedTravel?.partner} zakończona sukcesem`,
        )
        this.plannedTravel = null
        this.statusAndCoopView?.updateCoopView()
        break
      case NotificationMessageType.NotificationStartAdvertiseCoop:
        this.advertisementInfoBuilder.addBubbleForCoop(msg.message.travelName, msg.senderId)
        this.advertisementInfoBuilder.setMarginAndVisibility(msg.senderId)
        this.playerAdvertisedTravel[msg.senderId] = msg.message.travelName
        break
      case NotificationMessageType.NotificationStopAdvertiseCoop:
        this.advertisementInfoBuilder.addBubbleForCoop('', msg.senderId)
        this.advertisementInfoBuilder.setMarginAndVisibility(msg.senderId)
        delete this.playerAdvertisedTravel[msg.senderId]
        break
      case NotificationMessageType.NotificationAdvertisementBuy:
        this.advertisementInfoBuilder.addBubbleForResource(
          msg.message.gameResourceName,
          msg.senderId,
          true,
        )
        this.advertisementInfoBuilder.setMarginAndVisibility(msg.senderId)
        break
      case NotificationMessageType.NotificationAdvertisementSell:
        this.advertisementInfoBuilder.addBubbleForResource(
          msg.message.gameResourceName,
          msg.senderId,
          false,
        )
        this.advertisementInfoBuilder.setMarginAndVisibility(msg.senderId)
        break
      case NotificationMessageType.NotificationTradeStart:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.TALK)
        break
      case NotificationMessageType.NotificationTradeEnd:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.TALK)
        break
      case NotificationMessageType.NotificationTravelStart:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.TRAVEL)
        break
      case NotificationMessageType.NotificationTravelEnd:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.TRAVEL)
        break
      case NotificationMessageType.NotificationTravelChoosingStart:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.TRAVEL)
        break
      case NotificationMessageType.NotificationTravelChoosingStop:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.TRAVEL)
        break
      case NotificationMessageType.NotificationWorkshopChoosingStart:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.WORK)
        break
      case NotificationMessageType.NotificationWorkshopChoosingStop:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.WORK)
        break
      case NotificationMessageType.NotificationProductionStart:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.PRODUCTION)
        this.playerCloudMovement.set(msg.senderId, true)
        break
      case NotificationMessageType.NotificationProductionEnd:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.PRODUCTION)
        this.playerCloudMovement.set(msg.senderId, false)
        break
      case NotificationMessageType.NotificationSyncCoopResponse:
        this.adBubblesCoop(msg.message.states)
        break
      case NotificationMessageType.NotificationSyncTradeResponse:
        this.adBubblesTrade(msg.message.states)
        break
      case NotificationMessageType.NotificationStartNegotiation:
        this.interactionCloudBuiler.showInteractionCloud(msg.senderId, CloudType.TALK)
        break
      case NotificationMessageType.NotificationStopNegotiation:
        this.interactionCloudBuiler.hideInteractionCloud(msg.senderId, CloudType.TALK)
        break
      case EquipmentMessageType.QueueProcessed:
        this.loadingBarBuilder!.setCoordinates(
          this.players[this.playerId].coords.x,
          this.players[this.playerId].coords.y,
        )
        if (msg.message.context === 'workshop') {
          const img = this.imageCropper.crop(
            RESOURCE_ICON_WIDTH,
            RESOURCE_ICON_WIDTH,
            RESOURCE_ICON_SCALE,
            this.resourceUrl,
            this.settings.classResourceRepresentation.length,
            getResourceMapping(this.settings.classResourceRepresentation)(
              msg.message.resources![0].key,
            ),
            false,
          )
          this.loadingBarBuilder!.showResult(msg.message.resources![0].value, img)
        } else if (msg.message.context === 'travel') {
          const img = document.createElement('img')
          img.src = '/assets/coinCustomIcon.png'
          this.loadingBarBuilder!.showResult(msg.message.money!, img)
        }
        this.movingEnabled = true
        break
      case BackendWarningMessageType.UserWarning:
        this.showErrorPopup(msg.message.reason)
        break
      case EquipmentMessageType.EquipmentChange:
        this.equipment = msg.message.playerEquipment
        this.equipmentView?.update(msg.message.playerEquipment)
        break
      case TimeMessageType.End:
        this.chatWs.close()
        this.movementWs.close()

        gameService
          .getPlayerResults()
          .then((leaderboard: EndGameStatus) => {
            this.movingEnabled = false
            this.leaderboardView = new LeaderboardView(leaderboard, this.playerId, () => {
              this.destroy()
            })
            this.leaderboardView.show()
          })
          .catch((err) => {
            console.error(err)
          })
        break
      case TimeMessageType.Remaining:
        this.timeView?.setTimer(Math.floor(msg.message.timeLeftSeconds / 1000))
        break
      case TimeMessageType.PlayerRegen:
        msg.message.tokens.forEach((el) => {
          this.timeView?.setTimeToken(el.key, el.value.actual, el.value.max)
        })
        this.workshopView?.onTimeTokensChange()
        break
    }
  }

  adBubblesCoop(states: { key: string; value: string }[] | null): void {
    if (this.receivedPlayerSync) {
      states?.forEach((element) => {
        if (Object.keys(this.players).includes(element.key) && element.key !== this.playerId) {
          this.advertisementInfoBuilder.addBubbleForCoop(element.value, element.key)
          this.advertisementInfoBuilder.setMarginAndVisibility(element.key)
          this.playerAdvertisedTravel[element.key] = element.value
        }
      })
    } else {
      setTimeout(() => {
        this.adBubblesCoop(states)
      }, 200)
    }
  }

  adBubblesTrade(states: { key: string; value: tradeSyncValue }[] | null): void {
    if (this.receivedPlayerSync) {
      states?.forEach((element) => {
        if (Object.keys(this.players).includes(element.key) && element.key !== this.playerId) {
          if (element.value.buy) {
            this.advertisementInfoBuilder.addBubbleForResource(element.value.buy, element.key, true)
          }
          if (element.value.sell) {
            this.advertisementInfoBuilder.addBubbleForResource(
              element.value.sell,
              element.key,
              false,
            )
          }
          this.advertisementInfoBuilder.setMarginAndVisibility(element.key)
        }
      })
    } else {
      setTimeout(() => {
        this.adBubblesTrade(states)
      }, 200)
    }
  }

  getDirection = (startPosition: Position, endPosition: Position): Direction => {
    const xDiff = startPosition.x - endPosition.x
    const yDiff = startPosition.y - endPosition.y

    if (xDiff === 0 && yDiff === 0) {
      return Direction.NONE
    }

    if (xDiff === 0) {
      return yDiff > 0 ? Direction.UP : Direction.DOWN
    }

    if (yDiff === 0) {
      return xDiff > 0 ? Direction.LEFT : Direction.RIGHT
    }

    if (xDiff > 0) {
      return yDiff > 0 ? Direction.UP_LEFT : Direction.DOWN_LEFT
    }

    return yDiff > 0 ? Direction.UP_RIGHT : Direction.DOWN_RIGHT
  }

  addPlayer(id: string, coords: Coordinates, direction: Direction, characterClass: string): void {
    const sprite = this.add.sprite(0, 0, CHARACTER_ASSET_KEY)
    const text = this.add.text(0, ALL_PLAYERS_DESC_OFFSET_TOP, id)
    text.setColor('#000000')
    text.setFontFamily('Georgia, serif')

    this.playerCloudMovement.set(id, false)
    this.playersClasses.set(id, characterClass)

    const cloud = this.interactionCloudBuiler.build(this, id)
    const adBubble = this.advertisementInfoBuilder.build(id)
    this.advertisementInfoBuilder.setMarginAndVisibility(id)

    sprite.setInteractive()
    sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if ((!this.actionTrade || this.actionTrade !== id) && this.movingEnabled) {
        sendUserMessage(this.chatWs, {
          type: UserMessageType.UserClicked,
          name: id,
        })

        const neighbor = this.players[id]
        const currPlayer = this.players[this.playerId]
        if (
          Math.abs(neighbor.coords.x - currPlayer.coords.x) <= RANGE &&
          Math.abs(neighbor.coords.y - currPlayer.coords.y) <= RANGE
        ) {
          window.document.getElementById('btns')?.remove()
          const div = this.contextMenuBuilder.build(this, id)
          this.add.dom(
            this.cameras.main.scrollX + pointer.x,
            this.cameras.main.scrollY + pointer.y,
            div,
          )
          this.actionTrade = id
        }
      }
    })
    const container = this.add.container(0, 0, [sprite, text, cloud, adBubble])

    this.gridEngine.addCharacter({
      id: id,
      sprite: sprite,
      container,
      facingDirection: direction,
      walkingAnimationMapping: getPlayerMapping(this.settings.classResourceRepresentation)(
        characterClass,
      ),
      speed: this.settings.walkingSpeed,
      startPosition: coords,
      collides: false,
    })

    this.players[id] = {
      coords,
      direction,
      sprite,
    }
  }

  removePlayer(id: string): void {
    this.gridEngine.getSprite(id)?.destroy()
    this.gridEngine.getContainer(id)?.destroy()
    this.gridEngine.removeCharacter(id)

    delete this.players[id]
  }

  movePlayer(id: string, coords: Coordinates, direction: Direction): void {
    this.gridEngine.moveTo(id, coords)

    this.interactionCloudBuiler.purgeUnnecessaryIcons(id)
    this.players[id].coords = coords
    this.players[id].direction = direction
  }

  showTradeInvite(from: string): void {
    toast(TradeOfferPopup({ scene: this, from: from }), {
      position: 'bottom-right',
      autoClose: 8000,
      hideProgressBar: true,
      closeOnClick: false,
      closeButton: false,
      pauseOnHover: true,
      draggable: false,
      progress: undefined,
      toastId: from,
    })
  }

  acceptTradeInvitation(senderId: string): void {
    sendTradeMessage(this.chatWs, {
      type: OutcomingTradeMessageType.ProposeTradeAck,
      proposalSenderId: senderId,
    })
  }

  sendTradeMinorChange(ourSide: TradeEquipment, otherSide: TradeEquipment): void {
    sendTradeMessage(this.chatWs, {
      type: OutcomingTradeMessageType.TradeMinorChange,
      tradeBid: {
        senderOffer: ourSide,
        senderRequest: otherSide,
      },
      receiverId: this.otherPlayerId!,
    })
  }

  sendTradeBid(ourSide: TradeEquipment, otherSide: TradeEquipment): void {
    sendTradeMessage(this.chatWs, {
      type: OutcomingTradeMessageType.TradeBid,
      tradeBid: {
        senderOffer: ourSide,
        senderRequest: otherSide,
      },
      receiverId: this.otherPlayerId!,
    })
    this.tradeWindow?.disableProposeButton()
    this.tradeWindow?.disableAcceptButton()
  }

  updateTradeDialog(ourSide: TradeEquipment, otherSide: TradeEquipment): void {
    if (!this.tradeWindow) return

    this.tradeWindow.setCurrPlayerTurn(true)
    this.tradeWindow.update(ourSide, otherSide)
    this.tradeWindow.updatePlayerTurnElements()
  }

  finishTrade(ourSide: TradeEquipment, otherSide: TradeEquipment): void {
    sendTradeMessage(this.chatWs, {
      type: OutcomingTradeMessageType.TradeBidAck,
      finalBid: {
        senderOffer: ourSide,
        senderRequest: otherSide,
      },
      receiverId: this.otherPlayerId!,
    })
  }

  cancelTrade(): void {
    sendTradeMessage(this.chatWs, {
      type: OutcomingTradeMessageType.TradeCancel,
    })
    this.otherPlayerId = undefined
  }

  showCoopInvite(
    from: string,
    travelName: string,
    ownership: boolean,
    joining: boolean,
    senderHasTravel: boolean | null,
  ): void {
    toast(
      CoopOfferPopup({
        scene: this,
        from: from,
        travelName: travelName,
        ownership: ownership,
        joining: joining,
        senderHasTravel: senderHasTravel,
      }),
      {
        position: 'bottom-right',
        autoClose: 8000,
        hideProgressBar: true,
        closeOnClick: false,
        closeButton: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        toastId: `${from}-coop`,
      },
    )
  }

  acceptCoopInvitation(
    senderId: string,
    joining: boolean,
    senderHasTravel: boolean | null,
    travelName: string,
  ): void {
    if (joining) {
      if (senderHasTravel) {
        sendCoopMessage(this.chatWs, {
          type: OutcomingCoopMessageType.GatheringJoinPlanningAck,
          otherOwnerId: senderId,
        })
      } else {
        sendCoopMessage(this.chatWs, {
          type: OutcomingCoopMessageType.SimpleJoinPlanningAck,
          guestId: senderId,
        })
      }
    } else {
      sendCoopMessage(this.chatWs, {
        type: OutcomingCoopMessageType.ProposeOwnTravelAck,
        travelName: travelName,
        ownerId: senderId,
      })
    }
  }

  showInformationPopup(message: string): void {
    const informationPopup = new InformationView()
    informationPopup.setText(message)
    informationPopup.show()
    setTimeout(() => {
      informationPopup.close()
    }, INFORMATION_TIMEOUT)
  }

  showErrorPopup(message: string): void {
    const errorMessage = new ErrorView()
    errorMessage.setText(message)
    errorMessage.show()
    setTimeout(() => {
      errorMessage.close()
    }, ERROR_TIMEOUT)
  }

  getTravelByName = (travelName: string): Travel | null => {
    for (const travelType of this.settings.travels) {
      const foundTravel = travelType.value.find((travel) => travel.value.name === travelName)
      if (foundTravel) {
        return foundTravel
      }
    }
    return null
  }

  getEquipmentFromCoopEquipment = (
    coopEquipment: CoopEquipmentDto,
    required: boolean,
  ): Equipment => {
    const resources: GameResourceDto[] = []
    for (const resource of this.equipment!.resources) {
      resources.push({
        key: resource.key,
        value: 0,
      })
    }

    const playerEquipment: Equipment = {
      money: 0,
      time: 0,
      resources: resources,
    }
    for (const resource of coopEquipment.value.resources) {
      playerEquipment.resources.find((r) => r.key === resource.key)!.value = required
        ? resource.value.needed
        : resource.value.amount
    }

    if (coopEquipment.value.timeTokensCoopInfo) {
      playerEquipment.time = required
        ? coopEquipment.value.timeTokensCoopInfo.time.needed
        : coopEquipment.value.timeTokensCoopInfo.time.amount
    }

    return playerEquipment
  }

  planSingleTravel = (travelName: string): void => {
    this.settings.travels.forEach((travelType) => {
      travelType.value.forEach((travel) => {
        if (travel.value.name === travelName) {
          this.startPlanningTravel(
            true,
            travel,
            JSON.parse(JSON.stringify(this.equipment!)),
            {
              money: 0,
              time: travel.value.time!,
              resources: travel.value.resources,
            },
            null,
            null,
            null,
            null,
            null,
            null,
          )
        }
      })
    })
  }

  planMultiTravel = (travelName: string, equipments: CoopEquipmentDto[]): void => {
    const partnerName = equipments[0].key !== this.playerId ? equipments[0].key : equipments[1].key
    const playerCoopEquipment = equipments.find((equipment) => equipment.key === this.playerId)
    const partnerCoopEquipment = equipments.find((equipment) => equipment.key === partnerName)

    this.startPlanningTravel(
      false,
      this.getTravelByName(travelName)!,
      this.getEquipmentFromCoopEquipment(playerCoopEquipment!, false),
      this.getEquipmentFromCoopEquipment(playerCoopEquipment!, true),
      null,
      playerCoopEquipment!.value.timeTokensCoopInfo !== null,
      partnerName,
      this.getEquipmentFromCoopEquipment(partnerCoopEquipment!, false),
      this.getEquipmentFromCoopEquipment(partnerCoopEquipment!, true),
      null,
    )
  }

  cancelPlanningTravel = (): void => {
    this.plannedTravel = null
    this.statusAndCoopView?.updateCoopView()
    this.statusAndCoopView?.hideCoopView()
  }

  startPlanningTravel = (
    isSingle: boolean,
    travel: Travel,
    playerResources: Equipment,
    playerRequiredResources: Equipment,
    playerProfit: number | null,
    playerIsRunning: boolean | null,
    partner: string | null,
    partnerResources: Equipment | null,
    partnerRequiredResources: Equipment | null,
    partnerProfit: number | null,
  ): void => {
    this.plannedTravel = {
      isSingle: isSingle,
      wantToCooperate: isSingle ? false : null,
      travel: travel,
      playerResources: playerResources,
      playerRequiredResources: playerRequiredResources,
      playerProfit: playerProfit,
      playerIsRunning: playerIsRunning,
      partner: partner,
      partnerResources: partnerResources,
      partnerRequiredResources: partnerRequiredResources,
      partnerProfit: partnerProfit,
    }
    this.statusAndCoopView?.updateCoopView()
    this.statusAndCoopView?.showCoopView()
  }

  updateCoopPlayersEquipment = (equipments: CoopEquipmentDto[]): void => {
    if (equipments.length === 2) {
      const partnerName =
        equipments[0].key !== this.playerId ? equipments[0].key : equipments[1].key
      const partnerCoopEquipment = equipments.find((equipment) => equipment.key === partnerName)
      partnerCoopEquipment!.value.resources.forEach((resource) => {
        this.plannedTravel!.partnerResources!.resources.find((r) => r.key === resource.key)!.value =
          resource.value.amount
        this.plannedTravel!.partnerRequiredResources!.resources.find(
          (r) => r.key === resource.key,
        )!.value = resource.value.needed
      })
    }

    const playerCoopEquipment = equipments.find((equipment) => equipment.key === this.playerId)
    playerCoopEquipment!.value.resources.forEach((resource) => {
      this.plannedTravel!.playerResources.resources.find((r) => r.key === resource.key)!.value =
        resource.value.amount
      this.plannedTravel!.playerRequiredResources.resources.find(
        (r) => r.key === resource.key,
      )!.value = resource.value.needed
    })

    this.statusAndCoopView?.updateCoopView()
  }

  fillCoopPlayersEquipment = (): void => {
    this.plannedTravel!.playerResources.time = this.timeView!.getAvailableTokens()
    for (const resource of this.plannedTravel!.playerResources.resources) {
      resource.value = this.plannedTravel!.playerRequiredResources.resources.find(
        (r) => r.key === resource.key,
      )!.value
    }
    if (!this.plannedTravel!.isSingle) {
      for (const resource of this.plannedTravel!.partnerResources!.resources) {
        resource.value = this.plannedTravel!.partnerRequiredResources!.resources.find(
          (r) => r.key === resource.key,
        )!.value
      }
    }
    this.statusAndCoopView?.updateCoopView()
  }

  private areAllKeysDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
    return keys.every((value) => value.isDown)
  }

  update(): void {
    const controls: Controls = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      action: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      advancedView: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
    }

    if (controls.advancedView.isDown || this.settingsView.permanentAdsSetting()) {
      this.advertisementInfoBuilder.showIfCloudNotVisible()
    } else {
      this.advertisementInfoBuilder.hide()
    }

    if (!this.movingEnabled) return

    const moveMapping: Array<{ keys: Key[]; direction: Direction }> = [
      { keys: [controls.left, controls.up], direction: Direction.UP_LEFT },
      { keys: [controls.left, controls.down], direction: Direction.DOWN_LEFT },
      { keys: [controls.right, controls.up], direction: Direction.UP_RIGHT },
      { keys: [controls.right, controls.down], direction: Direction.DOWN_RIGHT },
      { keys: [controls.left], direction: Direction.LEFT },
      { keys: [controls.down], direction: Direction.DOWN },
      { keys: [controls.right], direction: Direction.RIGHT },
      { keys: [controls.up], direction: Direction.UP },
    ]

    if (controls.action.isDown && Phaser.Input.Keyboard.JustDown(controls.action)) {
      if (
        this.playerWorkshopsCoordinates.some(
          (coords) =>
            this.players[this.playerId].coords.x === coords.x &&
            this.players[this.playerId].coords.y === coords.y,
        ) &&
        this.equipment
      ) {
        this.workshopView = new WorkshopView(
          this,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
        )
        this.workshopView.show()

        this.informationActionPopup.close()
      } else if (
        this.lowTravels.some(
          (coords) =>
            this.players[this.playerId].coords.x === coords.x &&
            this.players[this.playerId].coords.y === coords.y,
        )
      ) {
        this.travelView = new TravelView(
          this,
          TravelType.LOW,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
        )
        this.travelView.show()

        this.informationActionPopup.close()
      } else if (
        this.mediumTravels.some(
          (coords) =>
            this.players[this.playerId].coords.x === coords.x &&
            this.players[this.playerId].coords.y === coords.y,
        )
      ) {
        this.travelView = new TravelView(
          this,
          TravelType.MEDIUM,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
        )
        this.travelView.show()

        this.informationActionPopup.close()
      } else if (
        this.highTravels.some(
          (coords) =>
            this.players[this.playerId].coords.x === coords.x &&
            this.players[this.playerId].coords.y === coords.y,
        )
      ) {
        this.travelView = new TravelView(
          this,
          TravelType.HIGH,
          this.resourceUrl,
          this.settings.classResourceRepresentation,
        )
        this.travelView.show()

        this.informationActionPopup.close()
      }

      return
    }

    const foundMapping = moveMapping.find((mapping) => this.areAllKeysDown(mapping.keys))
    if (foundMapping) {
      this.gridEngine.move(this.playerId, foundMapping.direction)
      this.interactionCloudBuiler.purgeUnnecessaryIcons(this.playerId)
    }
  }

  destroy(): void {
    this.timeView?.endTimer()
    this.lobbyWs?.close()
    this.movementWs?.close()
    this.chatWs?.close()
    toast.dismiss()
  }
}
