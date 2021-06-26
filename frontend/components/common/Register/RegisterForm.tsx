import React, { FC , useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import axios from 'axios'
import s from './RegisterForm.module.css'
import ReCAPTCHA from 'react-google-recaptcha'
import { Form, Input, Button, Modal } from 'antd'
import { useAuth } from '@context/AuthContext';
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

const RegisterForm = () => {
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string>('')
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
    // sleep about 2 seconds
    let count = 0
    while (!recaptchaToken && count < 3){
      await new Promise(f => setTimeout(f, 1500))
      // get a token from ReCaptcha
      if(!recaptchaToken && typeof captchaRef.current !== undefined){
        setRecaptchaToken(await captchaRef.current.executeAsync())
      }
      count++
    }
    if(recaptchaToken){
      try {
        //send register data to API
        const { data } = await axios.post('auth/register', {
          token: recaptchaToken,
          ...values
          })
          if(data?.accessToken){
            login(data.accessToken, data.user)
            setVisible(false);
          }
      } catch (err){
  
      }
    }  

    setIsLoading(false)

  }
  const onFinishFailed = (errorInfo: any) => {
  }

  const onReCAPTCHAChange = (captchaCode: string) => {
    // If the reCAPTCHA code is null or undefined indicating that
    // the reCAPTCHA was expired then return early
    if(!captchaCode) {
      return;
    }
    // Else reCAPTCHA was executed successfully so proceed with the 
    setRecaptchaToken(captchaCode)
    // Reset the reCAPTCHA so that it can be executed again if user 
    // submits another email.
    captchaRef.current.reset();
  }
  return (
    <>
      <button onClick={showModal} className="button arrow">Đăng ký</button>

      <Modal
      title="Đăng ký thành viên"
      className="auth-form-modal"
      visible={visible}
      onOk={handleOk}
      confirmLoading={false}
      onCancel={handleCancel}
      footer={null}
      >

      <Form name="basic" initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}>
                    <TextInput name="username" title="Tên đăng nhập" type="text"  required />
                    <div className="mt-8 md:grid md:grid-cols-2 md:gap-6">
                      <div className="md:col-span-1">
                        <TextInput name="phone" title="Số điện thoại"type="number" required />
                      </div>
                      <div className="md:col-span-1">
                        <TextInput name="email" title="Địa chỉ email" type="email" required />
                      </div>
                    </div>
                    <TextInput name="password" title="Mật khẩu" type="password"  required />
                    <div className="relative w-full mt-10 justify-center">
                      <button type="submit" disabled={isLoading} className={s.button} >
                        { !isLoading ? 'Đăng ký' : 'Loading...' }
                      </button>

                      <ReCAPTCHA
                        ref={captchaRef}
                        size="invisible"
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
                        onChange={onReCAPTCHAChange}
                      />
                    </div>

                  </Form>
          
      </Modal>
      </>
  )
}
export default RegisterForm