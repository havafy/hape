import { FC, useState, ChangeEvent,useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@context/AuthContext'
import { Form, Input, DatePicker, Upload, Switch  } from 'antd'
import s from './Profile.module.css'

const Profile: FC = () => {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState({})
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const siteName = process.env.NEXT_PUBLIC_SITE
  const onFinish = async (values: any) => {
    setIsLoading(true)
    const { data: { status, error } } = await axios.post('customer-contact', {
            ...values, 

        })
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    (async () => {
      setReady(false)
      let { data: { user} } = await axios.get('/users/profile', headerApi)
      if(user){
        setProfile(user)
      }
      setReady(true)
    })()
  
  }, [])
  return (

        <div className="user-profile">

          <div className={s.formBox}>
          <h1 className={s.h1}>Hồ Sơ Của Tôi</h1>
          <p>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          { ready && <Form name="basic" initialValues={{ ...profile }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}    >
                <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                  <div className={s.labelColumn}>
                    Tên đăng nhập
                  </div>
                  <div className="md:col-span-5 self-center">
                    <Form.Item name="username"
                        rules={[
                          { required: true, message: 'Vui lòng thêm tên đăng nhập!' },
                          { min: 10, message: 'Yêu cầu dài hơn 10 ký tự.' },
                          ]} >
                      <Input placeholder='Tên đăng nhập' className={s.input}  />
                    </Form.Item>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                  <div className={s.labelColumn}>Họ tên</div>
                  <div className="md:col-span-5">
                    <Form.Item name="name"
                        rules={[
                          { required: true, message: 'Vui lòng thêm tên của bạn.' },
                          { min: 10, message: 'Yêu cầu dài hơn 10 ký tự.' },
                          ]} >
                      <Input placeholder='Họ tên của bạn' className={s.input}  />
                    </Form.Item>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                    <div  className={s.labelColumn}>Tên shop</div>
                    <div className="md:col-span-5">
                      <Form.Item name="shopName"
                          rules={[
                            { required: true, message: 'Vui lòng thêm tên shop.' },
                            { min: 10, message: 'Yêu cầu dài hơn 10 ký tự.' },
                            ]} >
                        <Input placeholder='Tên shop của bạn' className={s.input}  />
                      </Form.Item>
                  </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                    <div  className={s.labelColumn}>Số điện thoại</div>
                    <div className="md:col-span-5 pt-2">
                      222222
                    </div>
                  </div>
                  <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                    <div  className={s.labelColumn}>Địa chỉ email</div>
                    <div className="md:col-span-5 pt-2">
                      222222
                    </div>
                  </div>
            </Form> }
          </div>

        </div>
  )
}

export default Profile
