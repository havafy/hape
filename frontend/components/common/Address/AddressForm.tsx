import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Cascader, Form, Input, Radio, Checkbox } from 'antd'
import s from './AddressForm.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
const options = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
          {
            value: 'xiasha',
            label: 'Xia Sha',
            disabled: true,
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        label: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            label: 'Zhong Hua men',
          },
        ],
      },
    ],
  },
];

interface Props {
    title?: string;
    name: string;
    type?: string;
    required: boolean;
  }
const AddressForm: FC<any>= ({closeModal }) => {
    const { login } = useAuth();
  
    const [isLoading, setIsLoading] = useState(false)
   
    const onFinish = async (values: any) => {
    } 
    const onFinishFailed = (errorInfo: any) => {
        console.log(errorInfo)
      }    
      function onChange(value, selectedOptions) {
        console.log(value, selectedOptions);
      }
      
      function filter(inputValue, path) {
        return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
      }

      const onSetDefaultChange = (e)  =>{
        console.log(`checked = ${e.target.checked}`);
      }
      
      return (<>


          <Form name="address-user-form"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}>
                  <div className="md:grid md:grid-cols-2 md:gap-6">
                    <div className="md:col-span-1">
                      <Form.Item name="fullName"
                          rules={[
                            { required: true, message: 'Vui lòng nhập họ tên!' },
                            { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                            ]} >
                        <Input placeholder='Họ tên người nhận' className={s.input}  />
                      </Form.Item>
                      </div>
                      <div className="md:col-span-1">
                      <Form.Item name="phoneNumber"
                          rules={[
                            { required: true, message: 'Nhập số điện thoại!' },
                            { min: 10, message: 'Yêu cầu dài hơn 10 ký tự.' },
                            ]} >
                        <Input placeholder='Số điện thoại' className={s.input}  />
                      </Form.Item>
                      </div>
                    </div>
                    <div className="mt-2">
                    <Cascader style={{width: '100%'}}
                      options={options}
                      onChange={onChange}
                      placeholder="Thành phố - Tỉnh / Quận / Huyện"
                      showSearch={{ filter }}
                    />
                    </div>
                    <div className="mt-7">
                    <Form.Item name="address"
                          rules={[
                            { required: true, message: 'Vui lòng nhập.' },
                            { min: 8, message: 'Yêu cầu dài hơn 8 ký tự.' },
                            ]} >
                        <Input placeholder='Tên đường, số nhà, căn hộ' className={s.input}  />
                      </Form.Item>
                      </div>
                      <div className="mt-7">
                        <div className="mb-2">Loại địa chỉ:</div>
                        <Radio.Group defaultValue="home" buttonStyle="solid">
                            <Radio.Button value="home">Nhà riêng</Radio.Button>
                            <Radio.Button value="office">Văn phòng</Radio.Button>
                          </Radio.Group>
                        </div>
                        <div className="mt-7">
                
                        <Checkbox onChange={onSetDefaultChange}>Đặt làm địa chỉ mặc đinh</Checkbox>
                        </div>
                        
                  
                        <div className="mt-7 text-right">
                        <button onClick={closeModal} className="mr-6">Trở về</button>
                            <button type="button" className={s.button}>Hoàn thành</button>
                          </div>          
        </Form>
      </>)
 }
export default AddressForm