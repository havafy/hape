import React, { FC , useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import axios from 'axios'
import s from './LoginForm.module.css'
import { Form, Input, Button, Modal } from 'antd'
import { useAuth } from '@context/AuthContext';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
interface Props {
  title?: string;
  name: string;
  type?: string;
  required: boolean;
}

const TextInput: FC<Props> = ({ title, name, required = false, type = 'text' }) => (
  <div className="relative w-full mb-6">
    <label className={s.label}>{title}</label>
    <Form.Item name={name}
        rules={[{ required, message: 'Please input ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input} type={type} />
     </Form.Item>
</div>
)

const LoginForm = () => {
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const showModal = () => {
    setVisible(true);
  }

  const handleOk = () => {
    setTimeout(() => {
      setVisible(false);

    }, 400);
  };

  const handleCancel = () => {
    setVisible(false);
  }
  const onFinish = async (values: any) => {
    // let disabled the submit button
    setIsLoading(true)
    await sendToApi(values)
    setIsLoading(false)
    setVisible(false);

  }
  const sendToApi =  async (postData: any) =>{
    try {
        //send register data to API
        const { data } = await axios.post('auth/login', {
            ...postData
            })
            if(data?.accessToken){
            login(data.accessToken, data.user)
            }
        } catch (err){
    
        }
    
  }
  const onFinishFailed = (errorInfo: any) => {
  }
  const responseGoogleOnFailure = (response: any) => {
   // console.log('responseGoogleOnFailure:', response);
  }
  

  const handleGoogleSuccess = async (response: any) => {
    const { tokenObj, profileObj } = response
    if (tokenObj) {
        console.log(tokenObj, profileObj)
        try {
            //send register data to API
            const { data } = await axios.post('auth/loginByParty', {
                    party: 'google',
                    accessToken: tokenObj.access_token,
                })
                if(data?.accessToken){
                login(data.accessToken, data.user)
                }
            } catch (err){
        
            }
    }
    setVisible(false);
  }

 
  const responseFacebook = (response: any) => {
    console.log(response);
  }
  const componentFBClicked = (response: any) => {
    console.log(response);
  }
     return (
    <>
      <button onClick={showModal} className="font-bold mr-5 outline-none">Đăng nhập</button>
      <Modal
      title="Đăng nhập" className="auth-form-modal" visible={visible}
      onOk={handleOk} confirmLoading={false} onCancel={handleCancel} footer={null} >
           <div className="grid grid-cols-2 ">
                <div className="col-span-1">
                <GoogleLogin
                clientId="333870013971-d8ncjpd1brc33asiiacr91tlq5n0gvqi.apps.googleusercontent.com"
                buttonText="Tài khoản Google"
                onSuccess={handleGoogleSuccess}
                onFailure={responseGoogleOnFailure}
                cookiePolicy={'single_host_origin'}
            />
                </div>
                <div className="col-span-1">
                <FacebookLogin
                    appId={process.env.NEXT_PUBLIC_FACEBOOK_KEY}
                    autoLoad={false}
                    fields="name,email,picture"
                    icon="fa-facebook"
                    cssClass="facebook-login-btn"
                    onClick={componentFBClicked}
                    callback={responseFacebook} />
                  </div>
            </div>

        <div className="my-5 text-center text-gray-800"> -- hoặc đăng nhập với -- </div>
      <Form name="basic" initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}>
        <TextInput name="email" title="Email" type="text"  required />
        <TextInput name="password" title="Mật khẩu" type="password"  required />
        <div className="relative w-full mt-10 justify-center">
            <button type="submit" disabled={isLoading} className={s.button} >
            { !isLoading ? 'Đăng ký' : 'Xử lý...' }
            </button>
        </div>

        </Form>
          
      </Modal>
      </>
  )
}
export default LoginForm