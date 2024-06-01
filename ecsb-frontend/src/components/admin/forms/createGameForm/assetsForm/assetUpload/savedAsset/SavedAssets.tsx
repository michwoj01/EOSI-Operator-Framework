import React from 'react';
import {type CreateGameFormData, type SavedAssetData} from '../../../CreateGameForm'
import {format} from 'date-fns'
import './SavedAssets.css'

interface SavedAssetsProps {
  setCreateGameFormData: React.Dispatch<React.SetStateAction<CreateGameFormData>>
  data: SavedAssetData
  onClose: () => void
}

const SavedAssets: React.FC<SavedAssetsProps> = ({ setCreateGameFormData, onClose, data }) => {
  const handleClose = () => {
    onClose()
  }

  const handleSelectAsset = (index: number) => {
    setCreateGameFormData((prevState: CreateGameFormData) => {
      const newFormData = {
        ...prevState,
        [data.formAssetFieldToSet]: data.assets[index].id,
        [data.formAssetNameField]: data.assets[index].name,
        [data.formAssetFieldToUnset]: null,
      }
      return newFormData
    })

    handleClose()
  }

  return (
    <div className='saved-assets-overlay'>
      <div className='saved-assets-modal'>
        <div className='saved-assets-list'>
          {data.assets.map((asset, index) => (
            <div key={index} className='saved-asset-item'>
              <div className='saved-asset-name'>{asset.name}</div>
              <div className='saved-asset-date'>
                {format(new Date(asset.createdAt), 'yyyy-MM-dd HH:mm:ss')}
              </div>
              <button
                className='saved-asset-select'
                onClick={() => {
                  handleSelectAsset(index)
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
        <div className='saved-assets-buttons'>
          <button className='saved-assets-close' onClick={handleClose}>
            Close
          </button>
          <button className='saved-assets-default' disabled={true} onClick={handleClose}>
            Choose default
          </button>
        </div>
      </div>
    </div>
  )
}

export default SavedAssets
