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
    <Form.Item name={name}
        rules={[{ required, message: 'Please input ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input} type={type} />
     </Form.Item>
</div>
)

const RegisterForm = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const siteName = process.env.NEXT_PUBLIC_SITE
  const captchaRef: any = createRef();

  const onFinish = async (values: any) => {
    setIsLoading(true)
    const token = await captchaRef.current.executeAsync();
    if(token){
        try {
          const { data } = await axios.post('auth/register', {
            token,
            ...values
            })
            if(data?.accessToken){
              login(data.accessToken, data.user)
            }
        } catch (err){

        }
    }
    setIsLoading(false)

  }
  const onFinishFailed = (errorInfo: any) => {
  }
  const onChange = (value: any) => {

  }
  return (
    <>
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