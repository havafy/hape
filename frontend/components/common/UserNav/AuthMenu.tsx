import s from './UserNav.module.css'
import { RegisterForm } from '@components/common'
import { useAuth } from '@context/AuthContext'
import LoggedBox from  './LoggedBox'
const AuthMenu = () => {
  const { accessToken, user, logout } = useAuth();
  return (
    <>
      {
        accessToken !== '' ? <LoggedBox/>
         :  <>
          <RegisterForm />
   
          </>
      }
    </>

  )
}
export default AuthMenu