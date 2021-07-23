import { FC, useState, ChangeEvent,useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { message as Message } from 'antd'
import s from './ChangePassword.module.css'
import getSlug, {hideText, hideEmail, phoneFormat} from '@lib/get-slug'


const ChangePassword: FC<any> = () => {

  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState<string>('')
  const [alert, setAlert] = useState<any>(null)
  const [newPassword, setNewPassword] = useState<string>('')
  const [rePassword, setRePassword] = useState<string>('')
  
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const submitForm = async () => {
    try{
      if(newPassword === ''){
        Message.error('Vui lòng nhập mật khẩu');
        return
      }
      if(alert !== ''  || alert === null){
        Message.error('Mật khẩu phải an toàn hơn');
        return
      }
      if(newPassword!== rePassword){
        Message.error('Mật khẩu không khớp.');
        return
      }
        setIsLoading(true)
        const { data: { statusCode } } = await axios.post('/auth/change-password', {
          password: newPassword
            }, headerApi)
          if(statusCode === 200){
            Message.success('Đổi mật khẩu thành công.');
            setNewPassword('')
            setRePassword('')
            setPassword('')
          }

        setIsLoading(false)
        
      }catch(err){
        console.log(err.response)
        Message.error(err.response.data.message);
        Message.error('Có sự cố, không đổi được mật khẩu.');
      }
  }
  const onNewPasswordChange = (event: any) =>{
      setNewPassword(event.target.value)
      isPasswordValid(event.target.value)
      
    }
  const isPasswordValid = (password: string) =>{
    let valid = false
    if(password.length < 7 || password.length  > 16){
      valid = true
    }
    if (password == password.toLowerCase()){
      valid = true
    }
    if(valid){
      setAlert('Mật khẩu phải dài từ 8-16 kí tự, bao gồm 1 chữ viết hoa và 1 chữ viết thường')
    }else{
      setAlert('')
    }

  }
  
  return (

        <div className="user-profile">
          <div className={s.formBox}>
          <h1 className={s.h1}>Đổi mật khẩu</h1>
                  {/* <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div className={s.labelColumn}>Mật khẩu hiện tại</div>
                    <div className="md:col-span-8">
                        <input type="password" value={password}  
                        onChange={(event) => {
                          setPassword(event.target.value)
                          }}
                        placeholder='Mật khẩu hiện tại' className={s.input}  />
                    </div>
                  </div> */}
                <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                  <div className={s.labelColumn}>
                    Mật khẩu mới
                  </div>
                  <div className="md:col-span-8 self-center">

                      <input value={newPassword}     type="password"
                          onChange={onNewPasswordChange}
                        placeholder='Mật khẩu mới' className={s.input}  />
                       {alert && <div className={s.alert}>{alert}</div> }
                          

                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                  <div className={s.labelColumn}>
                    Xác nhận lại
                  </div>
                  <div className="md:col-span-8 self-center">

                      <input 
                          type="password" value={rePassword} 
                          onChange={(event) => {
                            setRePassword(event.target.value)
                          }}
                        placeholder='Xác nhận lại' className={s.input}  />
 
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}></div>
                    <div className="md:col-span-8 pt-2">
                      <button onClick={submitForm}
                       className={s.button} >Lưu</button>
                    </div>
                  </div>

          </div>

        </div>
  )
}

export default ChangePassword
