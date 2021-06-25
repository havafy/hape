import { FC , useState, createRef} from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import axios from 'axios'
import s from './RegisterForm.module.css'
import ReCAPTCHA from 'react-google-recaptcha'
import { Form, Input, Button, Checkbox } from 'antd'
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
   {/* <input type={type} placeholder={title} className={s.input} /> */}
    <Form.Item name={name}
        rules={[{ required, message: 'Please input ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input} type={type} />
     </Form.Item>
</div>
)

const RegisterForm = () => {
  const { login, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const siteName = process.env.NEXT_PUBLIC_SITE
  const captchaRef = createRef();

  const onFinish = async (values: any) => {
    const token = await captchaRef.current.executeAsync();
    setIsLoading(true)
    const { data } = await axios.post('auth/register', {
      token,
      ...values
      })
    if(data?.accessToken){
      localStorage.setItem('accessToken', data.accessToken);
      login(data.accessToken)
    }
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onChange = (value: any) => {
    console.log("Captcha value:", value);
  }
  return (
    <>
<Form name="basic" initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}    >
      
              <TextInput name="name" title="Tên hiển thị" type="text"  required />
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
                <button type="submit"  className={s.button} >
                  { !isLoading ? 'Đăng ký' : 'Loading' }
                </button>

                <ReCAPTCHA
                  ref={captchaRef}
                  size="invisible"
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY}
                  onChange={onChange}
                />
              </div>

            </Form>
    </>
  )
}
export default RegisterForm