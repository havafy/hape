import { FC , useState} from 'react'
import Link from 'next/link'
import cn from 'classnames'
import axios from 'axios'
import s from './RegisterForm.module.css'
import { Form, Input, Button, Checkbox } from 'antd'
const TextInput: FC<Props> = ({ title, name, required = false, type = 'text' }) => (
  <div className="relative w-full mb-6">
    <label className={s.label}>{title}</label>
   {/* <input type={type} placeholder={title} className={s.input} /> */}
    <Form.Item name={name}
        rules={[{ required, message: 'Please input ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input}  />
     </Form.Item>
</div>
)

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false)

  const siteName = process.env.NEXT_PUBLIC_SITE
  const onFinish = async (values: any) => {
    setIsLoading(true)
    const { data: { status, error } } = await axios.post('customer-contact', {
            ...values, 
            options:{
              ...values, 
            },
            subject: '[' + siteName + '] Contact Page',
        })
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
<Form name="basic" initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}    >
      
              <TextInput name="full_name" title="Your name" type="text"  required />
              <div className="mt-8 md:grid md:grid-cols-2 md:gap-6">
                <div className="md:col-span-1">
                  <TextInput name="email" title="Your email"type="email" required />
                </div>
                <div className="md:col-span-1">
                  <TextInput name="phone_number" title="Your phone" type="text" required />
                </div>
              </div>

              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2 ml-1">
                Your project
                </label>
                <Form.Item name='message'  rules={[{ required: true, message: 'Please input your project!' }]}>
                  <Input.TextArea 
                        placeholder='Describe your project briefly *'
                        rows={8}
                        cols={40}
                        className={s.input} />
                </Form.Item>
              </div>

              <div className="relative w-full mb-3 justify-center">
                <button type="submit"  className={s.button} >
                  { !isLoading ? 'Submit' : 'Loading' }
                </button>
              </div>

            </Form>
    </>
  )
}
export default RegisterForm