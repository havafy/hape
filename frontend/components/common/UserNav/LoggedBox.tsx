import s from './UserNav.module.css'
import Link from 'next/link'
import { useAuth } from '@context/AuthContext'

import { FaRegUserCircle } from 'react-icons/fa'
import { 
    RiSettings5Line, 
    RiDatabase2Line, 
    RiShoppingBag2Line, 
    RiLogoutCircleLine 
} from 'react-icons/ri'
const LoggedBox = () => {
    console.log('LoggedBox render...')
  const { user, logout, updateAction } = useAuth();
  const logoutSubmit = () => {
    updateAction({event: 'CART_SUMMARY_UPDATE', payload: {} })
    logout()
  }
  return (

    <div className='user-logged-box'>
    <div>
        <span className="circle-avatar" style={{'backgroundImage': `url(${user.avatar})`, }}></span> 
    <div className="user-menu-dropdown">
        <i className="header-popover-arrow" style={{'transform': `translate(0px, 0px)`, 'left': `35px`}}></i>
        <ul>


        <li className="menu-item">
            <Link href='/user/orders'><a><RiShoppingBag2Line />Đơn hàng</a></Link>
        </li>
        <li className="menu-item">
            <Link href='/user/address-book'><a><RiSettings5Line />Địa chỉ</a></Link>
        </li>
        <li className="menu-item">
            <Link href='/user/profile'><a><FaRegUserCircle />Tài khoản</a></Link>
        </li>

        <li className="menu-item cursor-pointer" onClick={logoutSubmit}>
            <a><RiLogoutCircleLine /> Đăng xuất</a></li>
        </ul>
    </div>
    </div>
</div> 
  )
  }
export default LoggedBox