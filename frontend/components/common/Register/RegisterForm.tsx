import React, { FC , useState, useEffect } from 'react'
import cn from 'classnames'
import axios from 'axios'
import s from './RegisterForm.module.css'
import { Form, Input, message, Modal } from 'antd'
import { useAuth } from '@context/AuthContext';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
interface Props {
  title?: string;
  name: string;
  type?: string;
  required: boolean;
}

const RegisterForm = () => {
  
  const { login, action: { event }, updateAction } = useAuth();
  const [visible, setVisible] = useState(false);
  const [step1, setStep1] = useState(false)
  const [emailExisting, setEmailExisting] = useState(false)
  const [email, setEmail] = useState<string>('')
  const [emailMessage, setEmailMessage] = useState<string>('')
  const [formMessage, setFormMessage] = useState([''])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if(event ==='LOGIN_OPEN'){
      setVisible(true)
      updateAction({event: '', payload: {}})
    }
  },[event])

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
    const reCapKey = process.env.NEXT_PUBLIC_RECAPTCHA_KEY
    const { grecaptcha } = window as any;
    grecaptcha.ready(async () => {
      const token = await grecaptcha.execute(reCapKey, { action: "submit" });
      await submitRegistration(values, token)
    });
  }
  const submitRegistration = async (values: any , reqToken: any) => {
    if(reqToken !== null){
      try {
        if(emailExisting){
         await submitLogin(values.password)
        }else{
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
        }
      } catch (err){
        const { data } = err.response
        console.log('err', data)
        setFormMessage(data.message)
        
      }
    }  
    setIsLoading(false)

  }
  const submitLogin = async (password: string) =>{
    try {
        //send register data to API
        const { data } = await axios.post('auth/login', { email, password })
            if(data?.accessToken){
            login(data.accessToken, data.user)
            }else{
              message.error('Sai thông tin đăng nhập')
            }
        } catch (err){
          message.error('Không đăng nhập được.')
        }
    
  }
  function validateEmail(email: string) {
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
    const status = await existingEmail(email)
    setEmailExisting(status)
    setStep1(true)
    
  }
  

  const responseGoogleOnFailure = (response: any) => {
    // console.log('responseGoogleOnFailure:', response);
   } 
   const handleGoogleSuccess = async (response: any) => {
     const { tokenObj, profileObj } = response
     if (tokenObj) {
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
    
  const responseFacebook = async (response: any) => {
    try {
      if(response?.accessToken){
        let { data } = await axios.post(`auth/loginByParty`,{
          party: 'facebook',
          accessToken: response.accessToken
        })
        if(data?.accessToken){
          login(data.accessToken, data.user)
        }
      }
    } catch (err){
          
    }
    setVisible(false);

  }
  const componentFBClicked = (response: any) => {

  }
  return (
    <>
      <button onClick={showModal} className={s.signUpButton}>Đăng nhập</button>

      <Modal title="Đăng ký & đăng nhập" className="auth-form-modal"
      visible={visible} onOk={handleOk} confirmLoading={false} onCancel={handleCancel} footer={null} >
  <div className={cn(s.step1,{"hidden": step1})}>
    <p className="text-gray-700">Đăng nhập hoặc đăng ký với email của bạn.</p>
        <div className="relative w-full my-6">
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
            <div className="mb-6">
            <span className="font-semibold">
              {emailExisting ? 'Đăng nhập' : 'Đăng ký'} với:
              </span>  {email}  </div>
            <TextInput name="password" title="Mật khẩu" type="password"  required />
            {!emailExisting && <TextInput name="username" title="Tên đăng nhập" type="text"  required/> }
            {!emailExisting &&  <TextInput name="phone" title="Số điện thoại"type="number" required /> }
            <div className="grid grid-cols-2  mt-10 ">
                <div className="col-span-1">
                <button type="submit" disabled={isLoading} className={s.button} >
                  { isLoading ?'Gởi đi...' : (emailExisting ? 'Đăng nhập' : 'Đăng ký')  }
                </button>
                </div>
                <div className="col-span-1 pt-3 text-right">
                  <span className="font-bold cursor-pointer" onClick={() => setStep1(false)}>Quay lại </span>
                  </div>
              </div>
                   
          </Form>
      </div>

          <div className="my-5 text-center text-gray-400"> - hoặc - </div>
           <div className="grid grid-cols-2 ">
                <div className="col-span-1">
                <GoogleLogin
                      clientId="333870013971-d8ncjpd1brc33asiiacr91tlq5n0gvqi.apps.googleusercontent.com"
                      buttonText="Tài khoản Google"
                      onSuccess={handleGoogleSuccess}
                      onFailure={responseGoogleOnFailure}
                      cookiePolicy={'single_host_origin'}   />
                </div>
                <div className="col-span-1">
                <FacebookLogin
                    appId={`${process.env.NEXT_PUBLIC_FACEBOOK_KEY}`}
                    autoLoad={false}
                    fields="name,email,picture"
                    icon="fa-facebook"
                    cssClass="facebook-login-btn"
                    onClick={componentFBClicked}
                    callback={responseFacebook} />
                  </div>
            </div>

      </Modal>
      </>
  )
}

const TextInput: FC<Props> = ({ title, name, required = false, type = 'text' }) => (
  <div className="relative w-full mb-6">
    <label className={s.label}>{title}</label>
    <Form.Item name={name}
        rules={[{ required, message: 'Vui lòng nhập ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input} type={type} />
     </Form.Item>
</div>
)
export default RegisterForm