import s from './UserNav.module.css'
import { RegisterForm, LoginForm } from '@components/common'
import { useAuth } from '@context/AuthContext'
import LoggedBox from  './LoggedBox'
const AuthMenu = () => {
  const { accessToken, user, logout } = useAuth();
  return (
    <div>
      {
        accessToken !== '' ? <LoggedBox/>
         :  <div>
          <LoginForm />
          <RegisterForm />
          </div>
      }
    </div>

  )
}
export default AuthMenu