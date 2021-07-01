import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Form, Input, DatePicker, Upload, Switch  } from 'antd'
import s from './ShopSettings.module.css'

const ShopSettings: FC = () => {
  
  const [isLoading, setIsLoading] = useState(false)

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

  return (

        <div className="">
          <h1 className={s.h1}>ShopSettings</h1>
            <div className={s.formBox}>
            <Form name="basic" initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}    >
              ShopSettings
              </Form>
            </div>

        </div>
  )
}

export default ShopSettings
