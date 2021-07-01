import { FC, useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import { useRouter } from 'next/router'
import s from './UserSidebar.module.css'
import { GiShoppingBag } from 'react-icons/gi'
import { FaAddressCard, FaMoneyCheck,  FaUserCircle } from 'react-icons/fa'
import { RiLockPasswordFill, RiSettings5Line, RiDatabase2Line } from 'react-icons/ri'
const UserSidebar: FC = () => {
  return (
<div className={cn(s.root,'user-sidebar')}>
    <div className='menu-box'>
        <div className='group-title'>
           Mua hàng
        </div>
        <div className="list-menu">
            <div className="menu-item"><Link href={"/user/orders"}><a>
                <GiShoppingBag /> Đơn hàng</a></Link></div>
            <div className="menu-item"><Link href={"/user/address-book"}><a><FaAddressCard />Địa chỉ</a></Link></div>      
        </div>
    </div>
    <div className='menu-box'>
        <div className="group-title">
            Cửa hàng
        </div>
        <div className="list-menu">
            <div className="menu-item">
                <Link href={"/user/shop_products"}>
                    <a><RiDatabase2Line />Sản phẩm</a>
                </Link>
                </div>
            <div className="menu-item"> 
            <Link href={"/user/shop_orders"}>
                    <a><FaMoneyCheck />Đơn hàng</a>
                </Link></div>
            <div className="menu-item"> 
            <Link href={"/user/shop_settings"}>
                    <a><RiSettings5Line />Cấu hình</a>
                </Link></div>
         </div>
    </div>
    <div className='menu-box'>
        <div className="group-title">
            Tài Khoản Của Tôi
        </div>
        <div className="list-menu">
            <div className="menu-item"> 
            <Link href={"/user/settings"}>
                    <a><FaUserCircle />Thông tin tài khoản</a>
                </Link></div>
            <div className="menu-item"> 
            <Link href={"/user/password"}>
                    <a><RiLockPasswordFill /> Đổi Mật khẩu</a>
                </Link></div>

         </div>
    </div>

</div>
  )
}
export default UserSidebar
