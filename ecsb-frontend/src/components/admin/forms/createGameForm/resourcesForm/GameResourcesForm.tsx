import { type CreateGameFormData } from '../CreateGameForm'
import './GameResourcesForm.css'

interface GameResourcesFormProps {
  createGameFormData: CreateGameFormData
  setCreateGameFormData: React.Dispatch<React.SetStateAction<CreateGameFormData>>
}

const GameResourcesForm: React.FC<GameResourcesFormProps> = ({
  createGameFormData,
  setCreateGameFormData,
}) => {
  const handleChangeClassTokenRegeneration = (index: number, value: string) => {
    if (value.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        classResources: prevFormData.classResources.map((resource, i) => {
          if (i === index) {
            return {
              ...resource,
              classTokenRegeneration: 0,
            }
          }
          return resource
        }),
      }))
      return
    }

    const parsedValue = parseInt(value)

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].classTokenRegeneration = parsedValue
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeCharacterMapping = (index: number, value: number) => {
    if (value < 1 || value > createGameFormData.classResources.length) return

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].characterMapping = value
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeItemName = (index: number, value: string) => {
    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].itemName = value
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeItemMapping = (index: number, value: number) => {
    if (value < 1 || value > createGameFormData.classResources.length) return

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].itemMapping = value
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeCostPerItem = (index: number, value: number) => {
    if (value < 1 || value > 1000000) return

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].costPerItem = value
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeItemPerWorkshop = (index: number, value: number) => {
    if (value < 1 || value > 1000000) return

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].itemPerWorkshop = value
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeItemBuyout = (index: number, value: string) => {
    if (value.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        classResources: prevFormData.classResources.map((resource, i) => {
          if (i === index) {
            return {
              ...resource,
              itemBuyout: 0,
            }
          }
          return resource
        }),
      }))
      return
    }

    const parsedValue = parseInt(value)

    const updatedResources = [...createGameFormData.classResources]
    updatedResources[index].itemBuyout = parsedValue
    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      classResources: updatedResources,
    }))
  }

  const handleChangeMovingSpeed = (value: string) => {
    if (value.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        movingSpeed: 0,
      }))
      return
    }

    let parsedValue = parseInt(value)
    if (parsedValue >= 1000000) {
      parsedValue = 1000000
    }

    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      movingSpeed: parsedValue,
    }))
  }

  const handleChangeTimeAmount = (prevValue: number, newValue: string) => {
    if (newValue.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        maxTimeAmount: 0,
      }))
      return
    }

    let parsedNewValue = parseInt(newValue)
    if (parsedNewValue % 2 !== 0) {
      if (parsedNewValue > prevValue) {
        parsedNewValue += 1
      } else {
        parsedNewValue -= 1
      }
    }
    if (parsedNewValue >= 10) {
      parsedNewValue = 10
    }

    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      maxTimeAmount: parsedNewValue,
    }))
  }

  const handleChangeInteractionRadius = (value: string) => {
    if (value.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        interactionRadius: 0,
      }))
      return
    }

    let parsedValue = parseInt(value)
    if (parsedValue >= 1000000) {
      parsedValue = 1000000
    }

    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      interactionRadius: parsedValue,
    }))
  }

  const handleChangeDefaultMoney = (value: string) => {
    if (value.length === 0) {
      setCreateGameFormData((prevFormData) => ({
        ...prevFormData,
        defaultMoney: 0,
      }))
      return
    }

    let parsedValue = parseInt(value)
    if (parsedValue >= 1000000) {
      parsedValue = 1000000
    }

    setCreateGameFormData((prevFormData) => ({
      ...prevFormData,
      defaultMoney: parsedValue,
    }))
  }

  return (
    <div id='game-details-form'>
      <h5 id='main-title'>Classes & Resources</h5>
      <h6 id='sub-title'>
        Provide details for every class and the resources produced by each class
      </h6>
      <table>
        <thead>
          <tr>
            <th>Class Name</th>
            <th>Character Mapping</th>
            <th>Resource Name</th>
            <th>Resource Mapping</th>
            <th>Resource Unit Price</th>
            <th>Resource Max Production</th>
            <th>Resource Buyout Price</th>
            <th>Token Regeneration Time (in seconds)</th>
          </tr>
        </thead>
        <tbody>
          {createGameFormData.classResources.map((resource, index) => (
            <tr key={index}>
              <td>
                <span>{resource.className}</span>
              </td>
              <td>
                <input
                  min={1}
                  max={createGameFormData.classResources.length}
                  type='number'
                  value={resource.characterMapping}
                  onChange={(e) => {
                    handleChangeCharacterMapping(index, parseInt(e.target.value))
                  }}
                />
              </td>
              <td>
                <input
                  type='text'
                  value={resource.itemName}
                  onChange={(e) => {
                    handleChangeItemName(index, e.target.value)
                  }}
                />
              </td>
              <td>
                <input
                  min={1}
                  max={createGameFormData.classResources.length}
                  type='number'
                  value={resource.itemMapping}
                  onChange={(e) => {
                    handleChangeItemMapping(index, parseInt(e.target.value))
                  }}
                />
              </td>
              <td>
                <input
                  min={1}
                  max={1000000}
                  type='number'
                  value={resource.costPerItem}
                  onChange={(e) => {
                    handleChangeCostPerItem(index, parseInt(e.target.value))
                  }}
                />
              </td>
              <td>
                <input
                  min={1}
                  max={1000000}
                  type='number'
                  value={resource.itemPerWorkshop}
                  onChange={(e) => {
                    handleChangeItemPerWorkshop(index, parseInt(e.target.value))
                  }}
                />
              </td>
              <td>
                <input
                  type='number'
                  value={resource.itemBuyout}
                  onChange={(e) => {
                    handleChangeItemBuyout(index, e.target.value)
                  }}
                />
              </td>
              <td>
                <input
                  min={1}
                  max={60}
                  type='number'
                  value={resource.classTokenRegeneration}
                  onChange={(e) => {
                    handleChangeClassTokenRegeneration(index, e.target.value)
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='input-container'>
        <div>
          <label htmlFor=''>Walking speed</label>
          <input
            min={0}
            max={1000000}
            value={createGameFormData.movingSpeed}
            onChange={(e) => {
              handleChangeMovingSpeed(e.target.value)
            }}
            type='number'
          />
        </div>
        <div>
          <label htmlFor=''>Interaction radius</label>
          <input
            min={0}
            max={1000000}
            value={createGameFormData.interactionRadius}
            onChange={(e) => {
              handleChangeInteractionRadius(e.target.value)
            }}
            type='number'
          />
        </div>
      </div>
      <div className='input-container'>
        <div>
          <label htmlFor=''>Default money</label>
          <input
            min={0}
            max={1000000}
            value={createGameFormData.defaultMoney}
            onChange={(e) => {
              handleChangeDefaultMoney(e.target.value)
            }}
            type='number'
          />
        </div>
        <div>
          <label htmlFor=''>Maximum number of time slots</label>
          <input
            min={0}
            max={100}
            value={createGameFormData.maxTimeAmount}
            onChange={(e) => {
              handleChangeTimeAmount(createGameFormData.maxTimeAmount, e.target.value)
            }}
            type='number'
          />
        </div>
      </div>
    </div>
  )
}

export default GameResourcesForm
