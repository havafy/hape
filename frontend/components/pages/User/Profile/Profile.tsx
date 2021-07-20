import { FC, useState, ChangeEvent,useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { Form, Input, message as Message } from 'antd'
import s from './Profile.module.css'

const Profile: FC = () => {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<any>({})
  const [shop, setShop] = useState<any>({})
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const siteName = process.env.NEXT_PUBLIC_SITE
  const onFinish = async (values: any) => {
    try{
        setIsLoading(true)
        const { data: { status, user, message } } = await axios.put('/users/profile', {
                ...values, 
            }, headerApi)
          if(status === 404){
            Message.error(message);
          }
          if(user){
            setProfile(user)
          }
        setIsLoading(false)
      }catch(err){
        console.log(err)
      }
  }

  const onFinishFailed = (errorInfo: any) => {
    // console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    (async () => {
      setReady(false)
      try{
        let { data: { user, shop} } = await axios.get('/users/profile', headerApi)

        if(user){
          setProfile(user)
          setShop(shop)
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
          { ready && <Form name="basic" initialValues={{ ...profile, shopName: shop.shopName }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed} >
                <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                  <div className={s.labelColumn}>
                    Tên đăng nhập
                  </div>
                  <div className="md:col-span-8 self-center">
                    <Form.Item name="username"
                        rules={[
                          { required: true, message: 'Vui lòng thêm tên đăng nhập!' },
                          { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                          ]} >
                      <Input placeholder='Tên đăng nhập' className={s.input}  />
                    </Form.Item>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                  <div className={s.labelColumn}>Họ tên</div>
                  <div className="md:col-span-8">
                    <Form.Item name="name"
                        rules={[
                          { required: true, message: 'Vui lòng thêm tên của bạn.' },
                          { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                          ]} >
                      <Input placeholder='Họ tên của bạn' className={s.input}  />
                    </Form.Item>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Tên shop<br/></div>
                    <div className="md:col-span-8">
                      <Form.Item name="shopName"
                          rules={[
                            { required: true, message: 'Vui lòng thêm tên shop của bạn.' },
                            { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                            ]} >
                        <Input placeholder='Tên shop của bạn' className={s.input}  />
                      </Form.Item> (không khoảng trắng)
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Số điện thoại</div>
                    <div className="md:col-span-8 pt-2">
                   {profile.phone !== null && <span className="mr-2">{profile.phone}</span> }
                      <button className={s.btnLink}>{profile.phone === null ? 'Thêm': 'Thay đổi'}</button>
                    </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}>Địa chỉ email</div>
                    <div className="md:col-span-8 pt-2">
                      <span className="mr-2">{profile.email} </span>  <button className={s.btnLink}>Thay đổi</button>
                      
                    </div>

                 
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-12 md:gap-6">
                    <div  className={s.labelColumn}></div>
                    <div className="md:col-span-8 pt-2">
                      <button className={s.button} type="submit" >Lưu</button>
                    </div>
                  </div>

            </Form> }
          </div>

        </div>
  )
}

export default Profile
