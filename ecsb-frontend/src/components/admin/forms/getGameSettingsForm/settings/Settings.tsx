import React from 'react';
import {type GameSettings} from '../../../../../services/game/Types'
import {
    type ClassResourceRepresentation,
    type GameAssets,
    type GameSettingsTravels,
} from '../../../../../apis/game/Types'
import './Settings.css'

interface SettingsProps {
  settings: GameSettings | null
  errorMessage: string | null
  onClose: (value: boolean) => void
}

const Settings: React.FC<SettingsProps> = ({ settings, errorMessage, onClose }) => {
  const handleClose = () => {
    onClose(false)
  }

  const renderClassRepresentation = (classRepresentation: ClassResourceRepresentation[]) => {
    return (
      <div className='modal-classrepresentation-settings'>
        <h2>
          <strong>Class Representation</strong>
        </h2>
        {classRepresentation.map((classDto) => (
          <div key={classDto.key}>
            <p>
              <strong>Class Name:</strong> {classDto.key}
            </p>
            <p>
              <strong>Class Asset Mapping:</strong> {classDto.value.classAsset}
            </p>
            <p>
              <strong>Resource Name:</strong> {classDto.value.gameResourceName}
            </p>
            <p>
              <strong>Resource Asset Mapping:</strong> {classDto.value.resourceAsset}
            </p>
            <p>
              <strong>Resource Unit Price:</strong> {classDto.value.unitPrice}
            </p>
            <p>
              <strong>Resource Max Production:</strong> {classDto.value.maxProduction}
            </p>
            <p>
              <strong>Resource Buyout Price:</strong> {classDto.value.buyoutPrice}
            </p>
            <p>
              <strong>Token Regeneration Time:</strong> {classDto.value.regenTime}
            </p>
          </div>
        ))}
      </div>
    )
  }

  const renderAssets = (assets: GameAssets) => {
    return (
      <div className='modal-assets-settings'>
        <h2>
          <strong>Assets</strong>
        </h2>
        <h3>Map asset ID: {assets.mapAssetId}</h3>
        <h3>Character assets ID: {assets.characterAssetsId}</h3>
        <h3>Resource assets ID: {assets.resourceAssetsId}</h3>
        <h3>Tile assets ID: {assets.tileAssetsId}</h3>
      </div>
    )
  }

  const renderTravels = (travels: GameSettingsTravels[]) => {
    return (
      <div className='modal-travels-settings'>
        {travels.map((travel, index) => (
          <div key={index} className='modal-travels-settings-travel'>
            <h2>Travels {travel.key}</h2>
            {travel.value.map((travelValue) => (
              <div key={travelValue.key}>
                <h3>City: {travelValue.value.name}</h3>
                <p>
                  <strong>Cost:</strong>{' '}
                  {travelValue.value.resources
                    .map((resource) => `${resource.key}: ${resource.value}`)
                    .join(', ')}
                  {travelValue.value.time !== null ? `, time: ${travelValue.value.time}` : ''}
                </p>
                <p>
                  <strong>Money reward range:</strong> {travelValue.value.moneyRange.from} -{' '}
                  {travelValue.value.moneyRange.to}
                </p>
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className='modal-overlay'>
      {settings && (
        <div className='modal-container'>
          <div className='strip'></div>
          <h1>Settings</h1>
          <div className='modal-settings'>
            <div className='modal-main-settings'>
              <p>
                <strong>Name:</strong> {settings.name}
              </p>
              <p>
                <strong>Short Name:</strong> {settings.shortName}
              </p>
              <p>
                <strong>Game Session ID:</strong> {settings.gameSessionId}
              </p>
            </div>
            {renderClassRepresentation(settings.classResourceRepresentation)}
            {renderTravels(settings.travels)}
            {renderAssets(settings.gameAssets)}
          </div>
          <div className='error-button'>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      )}
      {errorMessage && (
        <div className='modal-container'>
          <div className='strip'></div>
          <h1>Error while getting settings</h1>
          <div className='modal-settings'>
            <div className='modal-main-settings'>
              <p>
                <strong>{errorMessage}</strong>
              </p>
            </div>
          </div>
          <div className='error-button'>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
