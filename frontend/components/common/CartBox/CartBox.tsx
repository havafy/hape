import { FC, useState, useEffect ,} from 'react'
import { RiShoppingCartLine } from 'react-icons/ri'
import Link from 'next/link'
import { useAuth } from '@context/AuthContext'
import axios from 'axios'
import s from './CartBox.module.css'

const CartBox: FC<{}> = () => {
    const { accessToken, action: { event, payload }, updateAction} = useAuth();
    const headerApi = { 
      headers: { 'Authorization': `Bearer ${accessToken}` } 
    }
    useEffect(()=>{
      // pullCart()
    },[])
    const pullCart = async () =>{
      console.log('calling on CartBox')
      let {data} = await axios.get('/cart', headerApi)
      updateAction({event: 'CART_ONCHANGE', payload: data})
    }
    console.log(event)
    return (    
      <>
        {event ==='CART_ONCHANGE' && 
             <Link href={'/cart'}><a> 
                <span className={s.root}><RiShoppingCartLine fill="none" />
                    <label>{payload.quantityTotal}</label>
                </span>
            </a></Link>}
        </>
    )
}
export default CartBox