import s from './UserNav.module.css'
import Link from 'next/link'
import { useAuth } from '@context/AuthContext'
const LoggedBox = () => {
  const { accessToken, user, logout } = useAuth();
  return (
      <div className="grid grid-cols-2 ">
          <div className="col-span-1">
                <Link href='/user/shop_product_create'><a className="button arrow">Post</a></Link>
        </div>
        <div className="col-span-1">
            <div className={s.userLoggedBox}>
            <div><span className="font-semibold">{user.username}</span> 
            <div className={s.dropdown}>
                <ul>
                <li className={s.dropdownItem}>Tài khoản</li>
                
                <li className={s.dropdownItem} onClick={logout}>Đăng xuất</li>
                </ul>
            </div>
            </div>
        </div> 
        </div> 
  </div>
  )
  }
export default LoggedBox