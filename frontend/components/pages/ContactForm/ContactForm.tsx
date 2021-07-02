import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import InputRange from 'react-input-range'
import { Form, Input, Button, Checkbox } from 'antd'

import s from './ContactForm.module.css'
interface Props {
  title?: string;
  name: string;
  type?: string;
  required: boolean;
}

interface rangeInterface {
  min: number
  max: number
}

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

const ContactForm: FC = () => {
  const [rangeValue, setRangeValue] = useState({
    min: 5000,
    max: 10000,
  })
  const [isLoading, setIsLoading] = useState(false)

  const siteName = process.env.NEXT_PUBLIC_SITE
  const onFinish = async (values: any) => {
    setIsLoading(true)
    const { data: { status, error } } = await axios.post('customer-contact', {
            ...values, 
            options:{
              rangeValue,
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
    <main className="mt-20 sm:mt-20 md:mt-32">
      <div className="mx-auto max-w-7xl">
        <div className="md:grid md:grid-cols-6 md:gap-6">
          <div className="md:col-span-2">
            <div className="px-4 sm:px-0">

              <h1 className={s.h1}>Contact Us</h1>
              <div className={s.infoBox}>
                <label>10+ MAGENTO 2 CERTIFIED</label>
                <label>5 COUNTRIES</label>
                <label>10+ ECOMMERCE EXPERTS</label>
                <br />
                <p>Contact us today, so we can help your business to drive success in digital commerce!</p>
                <h3>Contact Support</h3>
                <a href="mailto:support@havafy.com">support@havafy.com</a>
              </div>

            </div>
          </div>
          <div className="mt-5 sm:px-10 px-0 md:mt-0 md:col-span-4">
            <div className={s.formBox}>
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
              <div className="relative w-full mb-3">
                <label className={s.label}>What’s your budget?</label>
                <div className="mt-16 mb-12">
                  <InputRange
                    maxValue={30000}
                    minValue={1000}
                    step={1000}
                    formatLabel={(value) => `$${value}`}
                    draggableTrack
                    value={rangeValue}
                    onChange={(value: any) => setRangeValue(value)}
                  />
                </div>
              </div>

              <div className="relative w-full mb-5">
                <label className={s.label}> What services are you interested in?</label>
                <div className="my-2 lg:grid lg:grid-cols-2 gap-8">
                  <div className={s.checkCard}>
                  <Form.Item name="EcommerceDevelopmentServices" valuePropName="checked">
                    <Checkbox>Ecommerce Development Services</Checkbox>
                  </Form.Item>
                  </div>
                  <div className={s.checkCard}>
                  <Form.Item name="MobileApplicationDevelopment" valuePropName="checked">
                    <Checkbox>Mobile Application Development Services</Checkbox>
                  </Form.Item>
                  </div>
                  <div className={s.checkCard}>
                  <Form.Item name="MagentoDevelopmentServices" valuePropName="checked">
                    <Checkbox>Magento Development Services</Checkbox>
                  </Form.Item>
  
                  </div>
                  <div className={s.checkCard}>
                    <Form.Item name="HireDedicatedDevelopers" valuePropName="checked">
                      <Checkbox>Hire Dedicated Developers</Checkbox>
                    </Form.Item>
                  </div>
                </div>
              </div>
              <div className="relative w-full mb-3 justify-center">
                <button type="submit"  className={s.button} >
                  { !isLoading ? 'Submit' : 'Loading' }
                </button>
              </div>

            </Form>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}

export default ContactForm
