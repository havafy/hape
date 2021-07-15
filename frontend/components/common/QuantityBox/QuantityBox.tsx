import { FC, useState } from 'react'
import { BiPlus, BiMinus } from 'react-icons/bi'

import s from './QuantityBox.module.css'

const QuantityBox: FC<{defaultQty: number, onChange: (quantity: number) => void}> 
        = ({defaultQty, onChange}) => {
    const [ quantity, setQuantity] = useState<number>(defaultQty)
    const update = (rqQuantity: number)=> {
        setQuantity(rqQuantity)
        onChange(rqQuantity)
    }
    return (    
    <span className={s.root}>
        <button onClick={e=>update(quantity -1)}>
            <BiMinus />
        </button>
      <input 
        value={quantity} type="text"
        onChange={(e:any)=> update(e.target.value)} />
        <button onClick={e=>update(quantity +1)}>
               <BiPlus />
        </button>
      </span>
    )
    }
export default QuantityBox
