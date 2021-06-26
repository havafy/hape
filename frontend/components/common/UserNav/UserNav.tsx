import { FC, useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import s from './UserNav.module.css'
import { RegisterForm, LoginForm } from '@components/common'
import { useAuth } from '@context/AuthContext'
import { Menu, Dropdown, Icon } from 'antd'
const RegisterModal = () => {

  const { accessToken, user, logout } = useAuth();
  

  return (
    <>
      {
        accessToken !== '' ?
          <div className={s.userLoggedBox}>
            <div>Chào, {user.username} 
            <div className={s.dropdown}>
                <ul>
                  <li className={s.dropdownItem}>Tài khoản</li>
                  <li className={s.dropdownItem} onClick={logout}>Đăng xuất</li>
                </ul>
              </div>
            </div>
            
          </div> :
              <>
          <LoginForm />
          <RegisterForm />
          </>
      }
    </>


  )
}


interface Props {
  className?: string
}
const UserNav: FC<Props> = ({ className }) => {

  return (
    <nav className={cn(s.root, className)}>
      <div className={s.mainContainer}>
        <RegisterModal />
      </div>
    </nav>
  )
}

export default UserNav
