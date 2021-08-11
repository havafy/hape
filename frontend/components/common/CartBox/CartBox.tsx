import { FC, useState, useEffect ,} from 'react'
import { RiShoppingCartLine, RiDatabase2Line, RiPlayListAddFill, RiFileList2Line} from 'react-icons/ri' 
import { AiOutlineShop } from 'react-icons/ai' 
import Link from 'next/link'

import { 
    FcAcceptDatabase
} from 'react-icons/fc'

import Router from 'next/router'
import { useAuth } from '@context/AuthContext'
import axios from 'axios'
import cn from 'classnames'
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
    const onClickPost = () =>{
        if(accessToken === undefined || accessToken === ''){
            updateAction({event: 'LOGIN_OPEN', payload: {} })   
        }else{
            Router.push('/user/shop-product-form')

        }
    }
    return ( <>
        <span onClick={onClickPost} className={cn(s.shop, 'user-logged-box')}><AiOutlineShop />
        <div className={cn('user-menu-dropdown','mt-1')}>
        <i className="header-popover-arrow" style={{'transform': `translate(0px, 0px)`, 'left': `35px`}}></i>
        <ul >
            <li className="menu-item">
            {accessToken ?  <Link href='/user/shop-product-form'>
            <a><RiPlayListAddFill />Tạo sản phẩm</a>
                    </Link> :  <a><RiPlayListAddFill />Tạo sản phẩm</a> }
            </li>
            <li className="menu-item">
            
            {accessToken ? <Link href='/user/shop-products'><a><RiFileList2Line />Sản phẩm</a></Link>
             :  <a><RiFileList2Line />Sản phẩm</a> }
           </li>
            <li className="menu-item">
            {accessToken ? <Link href='/user/shop-orders'><a><FcAcceptDatabase />Quản lý đơn hàng</a></Link>
             :  <a><FcAcceptDatabase />Quản lý đơn hàng</a> }

            </li>
        </ul>
        </div>
        </span>
        <span onClick={onClick} className={s.cart}><RiShoppingCartLine fill="none" />
            {event ==='CART_SUMMARY_UPDATE'  && payload.quantityTotal > 0 ? <label>{payload.quantityTotal}</label> : <></> }
        </span>
        </>
    )
}
export default CartBox
