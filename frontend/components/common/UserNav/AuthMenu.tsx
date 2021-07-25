import s from './UserNav.module.css'
import { LoginForm } from '@components/common'
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
   
          </div>
      }
    </div>

  )
}
export default AuthMenu