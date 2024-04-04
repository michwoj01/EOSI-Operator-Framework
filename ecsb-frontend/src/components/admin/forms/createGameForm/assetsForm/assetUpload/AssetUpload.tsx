import { type FC } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type CreateGameFormData } from '../../CreateGameForm'
import './AssetUpload.css'

interface AssetUploadProps {
  createGameFormData: CreateGameFormData
  setCreateGameFormData: React.Dispatch<React.SetStateAction<CreateGameFormData>>
  formFileField: string
  formFileNameField: string
  formFileIDField: string
  fileType: string
  requestFileType: string
  title: string
  setAndShowSavedAssetModalForm: (
    fileType: string,
    formAssetFieldToSet: string,
    formAssetNameField: string,
    formAssetFieldToUnset: string,
  ) => void
}

const AssetUpload: FC<AssetUploadProps> = ({
  createGameFormData,
  setCreateGameFormData,
  formFileField,
  formFileNameField,
  formFileIDField,
  fileType,
  requestFileType,
  title,
  setAndShowSavedAssetModalForm,
}) => {
  const uuid = uuidv4()

  const selectFiles = (fileList: FileList | null) => {
    if (!fileList) {
      return
    }

    if (fileList.length === 1) {
      setCreateGameFormData((prevState: CreateGameFormData) => {
        const newFormData = {
          ...prevState,
          [formFileField]: fileList.item(0),
          [formFileNameField]: fileList.item(0)?.name,
          [formFileIDField]: null,
        }
        return newFormData
      })
    }
  }

  const selectedFileName = (): string | null => {
    switch (formFileNameField) {
      case 'characterAssetsName':
        return createGameFormData.characterAssetsName
      case 'tileAssetName':
        return createGameFormData.tileAssetName
      case 'resourceAssetsName':
        return createGameFormData.resourceAssetsName
      case 'mapAssetName':
        return createGameFormData.mapAssetName
      default:
        return null
    }
  }

  const selectedFile = (): File | null => {
    switch (formFileField) {
      case 'characterAssetFile':
        return createGameFormData.characterAssetFile
      case 'tileAssetFile':
        return createGameFormData.tileAssetFile
      case 'resourceAssetFile':
        return createGameFormData.resourceAssetFile
      case 'mapAssetFile':
        return createGameFormData.mapAssetFile
      default:
        return null
    }
  }

  const fileName = selectedFileName()
  const file = selectedFile()

  return (
    <div className={'asset-upload-container'}>
      <h5 className={'asset-title'}>{title}</h5>
      {fileName && (
        <div className='asset-file'>
          <h5>Currently selected file: {fileName}</h5>
          {file && (
            <img className={'asset-image'} src={URL.createObjectURL(file)} alt={file.name} />
          )}
        </div>
      )}
      <div className={'asset-buttons'}>
        <div className={'simple-button'}>
          <label htmlFor={uuid} className={'text'}>
            Upload
          </label>
          <input
            onChange={(e) => {
              selectFiles(e.target.files)
            }}
            accept={fileType}
            hidden={true}
            id={uuid}
            type={'file'}
          />
        </div>
        <button
          className={'cta-button'}
          onClick={() => {
            setAndShowSavedAssetModalForm(
              requestFileType,
              formFileIDField,
              formFileNameField,
              formFileField,
            )
          }}
        >
          <p className={'text'}>Saved Assets</p>
        </button>
      </div>
    </div>
  )
}

export default AssetUpload
