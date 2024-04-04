import { Fragment, type ReactElement } from 'react'
import './AssetsForm.css'

interface AssetsFormProps {
  title: string
  subTitle: string
  assetUpload: ReactElement[]
}

const AssetsForm: React.FC<AssetsFormProps> = ({ title, subTitle, assetUpload }) => {
  return (
    <div className={'assets-form'}>
      <div className={'titles-container'}>
        <p className={'main-title'}>{title}</p>
        <p className={'sub-title'}>{subTitle}</p>
      </div>
      {assetUpload.map((asset, index) => (
        <Fragment key={index}>{asset}</Fragment>
      ))}
    </div>
  )
}

export default AssetsForm
