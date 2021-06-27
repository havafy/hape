import React, { FC , useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import axios from 'axios'
import s from './RegisterForm.module.css'
import ReCAPTCHA from 'react-google-recaptcha'
import { Form, Input, Button, Modal } from 'antd'
import { useAuth } from '@context/AuthContext';
import { GoogleLogin } from 'react-google-login';
interface Props {
  title?: string;
  name: string;
  type?: string;
  required: boolean;
}



const RegisterForm = () => {
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step1, setStep1] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [emailMessage, setEmailMessage] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const [formMessage, setFormMessage] = useState([''])
  const [isLoading, setIsLoading] = useState(false)
  const captchaRef: any = React.useRef();
  const showModal = () => {
    setVisible(true);
  };

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
    let reqToken = ''
    let count = 0
    while ( count < 3){
      // get a token from ReCaptcha
      if(typeof captchaRef.current !== undefined){
        try {
          reqToken = await captchaRef.current.executeAsync()
          if(reqToken !== ''){
            break
          }
          if(token !== ''){
            reqToken = token
            break
          }
        } catch (err){
          // console.log('captchaRef_err', err)
        }
      }
      count++
    }
    if(reqToken !== ''){
      try {
        //send register data to API
        const { data } = await axios.post('auth/register', {
          ...values,
          token: reqToken,
          email,
          })
          if(data?.accessToken){
            login(data.accessToken, data.user)
            setVisible(false);
          }
      } catch (err){
        const { data } = err.response
        console.log('err', data)
        setFormMessage(data.message)
        
      }
    }  

    setIsLoading(false)

  }
  function validateEmail(email: string) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
  const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo)
  }
  const handleEmailChange = (event: any) => {
    setEmail(event.target.value)
  }
  const existingEmail = async (email: string) => {
    try {
      //send register data to API
      const { data } = await axios.post('auth/checkEmail', { email })
      return data?.status
    } catch (err){
      return true
    }
  }
  // 
  const completedStep1 = async () => {
    if(!validateEmail(email)){
      setEmailMessage('Vui lòng nhập đúng email!')
      return
    }
    const existing = await existingEmail(email)
    if(existing){
      setEmailMessage('Email này đã tồn tại.')
      return
    }
      
    setStep1(true)
    
  }
  
  const onReCAPTCHAChange = (captchaCode: string) => {
    // If the reCAPTCHA code is null or undefined indicating that
    // the reCAPTCHA was expired then return early
    if(!captchaCode) {
      return;
    }
    // Else reCAPTCHA was executed successfully so proceed with the 
    setToken(captchaCode)
    // Reset the reCAPTCHA so that it can be executed again if user 
    // submits another email.
    captchaRef.current.reset();
  }

  const responseGoogleOnFailure = (response: any) => {
    console.log('responseGoogleOnFailure:', response);
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
  return (
    <>
      <button onClick={showModal} className="button arrow">Đăng ký</button>

      <Modal title="Đăng ký thành viên" className="auth-form-modal"
      visible={visible} onOk={handleOk} confirmLoading={false} onCancel={handleCancel} footer={null} >
  <div className={cn(s.step1,{"hidden": step1})}>
        <div className="relative w-full mb-6">
           <label className={s.label}>Địa chỉ email</label> 
            <input onChange={handleEmailChange} name="email"
             placeholder="Địa chỉ email" className={s.input} type="email" />
             <div className="pt-2 text-sm text-red">{emailMessage}</div>
          </div>
      <button type="submit" onClick={completedStep1} className={s.button}>Tiếp tục</button>
    </div>
    <div className={cn(s.step2, {"hidden": !step1})}> 
        <Form name="register-user"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}>
              <div className={s.formMessage}>
                    {Array.isArray(formMessage) && formMessage.map((item: string, i:any) => {     
                          return (<div key={i}>{item}</div>) 
                        })}
                </div>
            <TextInput name="username" title="Tên đăng nhập" type="text"  required />
            <TextInput name="phone" title="Số điện thoại"type="number" required />
            <TextInput name="password" title="Mật khẩu" type="password"  required />
            <div className="grid grid-cols-2  mt-10 ">
                <div className="col-span-1">
                <button type="submit" disabled={isLoading} className={s.button} >
                  { isLoading ?'Loading...' :  'Đăng ký'  }
                </button>
                </div>
                <div className="col-span-1 pt-3 text-right">
                  <span className="font-bold cursor-pointer" onClick={() => setStep1(false)}>Quay lại </span>
                  </div>
              </div>
              <ReCAPTCHA ref={captchaRef} size="invisible" 
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
                onChange={onReCAPTCHAChange}  />
          </Form>
      </div>

          <div className="my-5 text-center text-gray-400"> -- hoặc -- </div>
      <GoogleLogin
                clientId="333870013971-d8ncjpd1brc33asiiacr91tlq5n0gvqi.apps.googleusercontent.com"
                buttonText="Tài khoản Google"
                onSuccess={handleGoogleSuccess}
                onFailure={responseGoogleOnFailure}
                cookiePolicy={'single_host_origin'}
            />

      </Modal>
      </>
  )
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
export default RegisterForm