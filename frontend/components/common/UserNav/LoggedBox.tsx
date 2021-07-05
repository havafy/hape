import s from './UserNav.module.css'
import Link from 'next/link'
import { useAuth } from '@context/AuthContext'

import { FaRegUserCircle } from 'react-icons/fa'
import { RiSettings5Line, RiDatabase2Line, RiShoppingBag2Line } from 'react-icons/ri'
const LoggedBox = () => {
  const { user, logout } = useAuth();
  return (
      <div className="grid grid-cols-2 ">
          <div className="col-span-1">
                {/* <Link href='/user/shop-product-form'><a className="button arrow">Đăng sản phẩm</a></Link> */}
        </div>
        <div className="col-span-1 text-right">
            <div className='user-logged-box'>
            <div>
                <span className="circle-avatar" style={{'backgroundImage': `url(${user.avatar})`}}></span> 
            <div className="user-menu-dropdown">
                <i className="header-popover-arrow" style={{'transform': `translate(0px, 0px)`, 'right': `15px`}}></i>
                <ul>
                <li className="menu-item">
                    <Link href='/user/orders'><a><RiShoppingBag2Line />Đơn mua hàng</a></Link>
                </li>
     
                <li className="menu-item">
                    <Link href='/user/profile'><a><FaRegUserCircle />Tài khoản</a></Link>
                </li>
                <li className="menu-item">
                    <Link href='/user/shop-settings'><a><RiSettings5Line />Cửa hàng</a></Link>
                </li>
                <li className="menu-item">
                    <Link href='/user/shop-products'><a><RiDatabase2Line />Sản phẩm</a></Link>
                </li>
       
                <li className="menu-item text-center py-3" onClick={logout}>Đăng xuất</li>
                </ul>
            </div>
            </div>
        </div> 
        </div> 
  </div>
  )
  }
export default LoggedBox