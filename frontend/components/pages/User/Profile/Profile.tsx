import { FC, useState, ChangeEvent,useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { message as Message } from 'antd'
import s from './Profile.module.css'
import getSlug, {hideText, hideEmail, phoneFormat} from '@lib/get-slug'

const Profile: FC = () => {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [name, setName] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [shopName, setShopName] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [changeEmail, setChangeEmail] = useState<boolean>(false)
  const [changePhone, setChangePhone] = useState<boolean>(false)
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const siteName = process.env.NEXT_PUBLIC_SITE
  const submitForm = async () => {
    try{
        setIsLoading(true)
        const { data: { statusCode, user, message, shop } } = await axios.put('/users/profile', {
                username,
                name,
                shopName,
                phone,
                email
            }, headerApi)
          if(statusCode !== 200){
            Message.error(message);
          }else{
            if(user){
              setName(user.name)
              setUsername(user.username)
              setPhone(user.phone)
              setEmail(user.email)
            }
            if(shop){
              setShopName(shop.shopName)
            }
            setChangeEmail(false)
            setChangePhone(false)
            Message.success("Cập nhật thành công.");
          }

        setIsLoading(false)
      }catch(err){
        console.log(err.response)
        Message.error(err.response.data.message);
      
      }
  }


  const userNameHandleChange = (event: any) => {
    setUsername(getSlug(event.target.value))
  }
  const shopNameHandleChange = (event: any) => {
    setShopName(getSlug(event.target.value))
  }
  useEffect(() => {
    (async () => {
      setReady(false)
      try{
        let { data: { user, shop} } = await axios.get('/users/profile', headerApi)

        if(user){
            setName(user.name)
            setUsername(user.username)
            setPhone(user.phone)
            setEmail(user.email)
        }
        if(shop){
            setShopName(shop.shopName)
        }
        setReady(true)
      }catch(err){
        console.log(err)
      }

    })()
  
  }, [])
  return (

        <div className="user-profile">

          <div className={s.formBox}>
          <h1 className={s.h1}>Hồ Sơ Của Tôi</h1>
          <p className="text-gray-600 mb-5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div className={s.labelColumn}>Họ tên</div>
                    <div className="md:col-span-8">
                        <input  value={name}
                        onChange={(event) => {
                            setName(event.target.value)
                          }}
                        placeholder='Họ tên của bạn' className={s.input}  />
          
                    </div>
                  </div>
                <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                  <div className={s.labelColumn}>
                    Tên đăng nhập
                  </div>
                  <div className="md:col-span-8 self-center">

                      <input value={username} 
                        onChange={userNameHandleChange}
                        placeholder='Tên đăng nhập' className={s.input}  />
              <span className="text-gray-500 text-xs">(không ký tự đặt biệt)</span>
                  </div>
                  </div>

                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Tên shop<br/></div>
                    <div className="md:col-span-8">

                        <input value={shopName} 
                        onChange={shopNameHandleChange}
                        placeholder='Tên shop của bạn' className={s.input}  />
                      <span className="text-gray-500 text-xs">(không ký tự đặt biệt)</span>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Số điện thoại</div>
                    <div className="md:col-span-8">
                   {(!changePhone) && 
                   <div className="mt-2">
                     <span className="mr-2">{phone !== null && hideText(phone)}</span>
                     <button onClick={e=>setChangePhone(true)} 
                       className={s.btnLink}>{phone === null ? 'Thêm': 'Thay đổi'}</button>
                     </div> }

      

                    {changePhone === true && <input value={phone} 
                        onChange={e=>{setPhone(phoneFormat(e.target.value))}}
                        placeholder='Số điện thoại mới' className={s.input}  />}
                    </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Địa chỉ email</div>
                    <div className="md:col-span-8">
                    
                    {!changeEmail &&  <div className="mt-2"> 
                      <span className="mr-2">{hideEmail(email)}</span>  
                      <button onClick={e=>setChangeEmail(true)} className={s.btnLink}>Thay đổi</button>
                      </div> }
                   
                    {changeEmail === true && <input value={email} 
                        onChange={e=>{setEmail(e.target.value)}}
                        placeholder='Địa chỉ email mới' className={s.input}  />}
                   
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

export default Profile
