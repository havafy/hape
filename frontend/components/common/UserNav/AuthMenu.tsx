import s from './UserNav.module.css'
import { RegisterForm, LoginForm } from '@components/common'
import { useAuth } from '@context/AuthContext'
const AuthMenu = () => {
  const { accessToken, user, logout } = useAuth();
  return (
    <div>
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
              <div>
          <LoginForm />
          <RegisterForm />
          </div>
      }
    </div>

  )
}
export default AuthMenu