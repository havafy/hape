import { FC, useState, useEffect ,} from 'react'
import { RiShoppingCartLine } from 'react-icons/ri'

import Router from 'next/router'
import { useAuth } from '@context/AuthContext'
import axios from 'axios'
import s from './CartBox.module.css'

const CartBox: FC<{}> = () => {
    const { accessToken, action: {event,payload }, updateAction} = useAuth();
    const onClick = () =>{
        if(accessToken === undefined || accessToken === ''){
            updateAction({event: 'LOGIN_OPEN', payload: {} })   
        }else{
            Router.push('/cart')

        }
    }
    return (    
        <span onClick={onClick} className={s.root}><RiShoppingCartLine fill="none" />
            {event ==='CART_SUMMARY_UPDATE'  && payload.quantityTotal > 0 ? <label>{payload.quantityTotal}</label> : <></> }
        </span>
    )
}
export default CartBox
