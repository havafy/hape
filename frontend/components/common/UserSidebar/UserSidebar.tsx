import { FC, useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import { useRouter } from 'next/router'
import s from './UserSidebar.module.css'
import { GiShoppingBag } from 'react-icons/gi'
import { FaAddressCard, FaMoneyCheck,  FaUserCircle } from 'react-icons/fa'
import { RiLockPasswordFill, RiSettings5Line, RiDatabase2Line } from 'react-icons/ri'
interface MenuProps {
    pid: string;
    subMenu: string;
    title: string;
    children: JSX.Element,
}
interface Props {
    pid: string;
}
const MenuItem: FC<MenuProps> = ({subMenu, title, pid, children})  => (
    <div className={cn('menu-item', {'active': subMenu === pid ? true : false})}>
        <Link href={"/user/" + subMenu}>
                <a>{children}{title}</a>
            </Link>
        </div>
)

const UserSidebar: FC<Props> = ({pid}) => (
<div className={cn(s.root,'user-sidebar')}>
    <div className='menu-box'>
        <div className='group-title'>
           Mua hàng
        </div>
        <div className="list-menu">
            <MenuItem subMenu="orders" title='Đơn mua hàng' pid={pid}><GiShoppingBag /></MenuItem>
            <MenuItem subMenu="address-book" title='Địa chỉ' pid={pid}><FaAddressCard /></MenuItem>
          </div>
    </div>
    <div className='menu-box'>
        <div className="group-title">
            Cửa hàng
        </div>
        <div className="list-menu">
            <MenuItem subMenu="shop-products" title='Sản phẩm' pid={pid}><RiDatabase2Line /></MenuItem>
            <MenuItem subMenu="shop-orders" title='Đơn hàng' pid={pid} ><FaMoneyCheck /></MenuItem>
            {/* <MenuItem subMenu="shop-settings" title='Cấu hình' pid={pid} ><RiSettings5Line /></MenuItem> */}
         </div>
    </div>
    <div className='menu-box'>
        <div className="group-title">
            Tài Khoản Của Tôi
        </div>
        <div className="list-menu">
            <MenuItem subMenu="profile" title='Thông tin tài khoản' pid={pid}><FaUserCircle /></MenuItem>
            <MenuItem subMenu="change-password" title='Đổi Mật khẩu' pid={pid}><RiLockPasswordFill /></MenuItem>
         </div>
    </div>

</div>
)

export default UserSidebar
