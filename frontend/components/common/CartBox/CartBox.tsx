import { FC, useState, useEffect ,} from 'react'
import { RiShoppingCartLine } from 'react-icons/ri'
import Link from 'next/link'
import { useAuth } from '@context/AuthContext'
import axios from 'axios'
import s from './CartBox.module.css'

const CartBox: FC<{}> = () => {
    const { accessToken, action: { event, payload }} = useAuth();
    return (    
      <>
   <Link href={'/cart'}><a> 
                <span className={s.root}><RiShoppingCartLine fill="none" />
                    {event ==='CART_SUMMARY_UPDATE'  && payload.quantityTotal > 0 ? <label>{payload.quantityTotal}</label> : <></> }
                </span>
            </a></Link>
        </>
    )
}
export default CartBox
