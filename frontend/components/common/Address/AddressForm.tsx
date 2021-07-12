import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Cascader, Form, Input, Radio, Checkbox } from 'antd'
import s from './AddressForm.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
interface Props {
    title?: string;
    name: string;
    type?: string;
    required: boolean;
  }
const AddressForm: FC<any>= ({closeModal }) => {
    const { login } = useAuth();
    const [options, setOptions] = React.useState([]);
    const [parentID, setParentID] = React.useState('VN');
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
      getVNProvince()
    },[])
    const getVNProvince = async () => {
      try {
        //send register data to API
        const { data:{regions} } = await axios.get('regions',{ 
          params: { parent: parentID }
        }) 
        setOptions(regions.map((item: any) => {
          console.log('---', item)
          return  {
            value: item.id,
            label: item.name,
            isLeaf: false,
          }
        }))
       
      } catch (err){
      }
    }
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
      const loadData = async (selectedOptions: any) => {
        console.log('-->', selectedOptions)
        const parent = selectedOptions[0].value
        const targetOption = selectedOptions[selectedOptions.length - 1];
        targetOption.loading = true;
    
        try {
          //send register data to API
          const { data:{regions} } = await axios.get('regions',{ 
            params: { parent }
          }) 
    
          targetOption.loading = false;
          targetOption.children = regions.map((item: any) => {
            return  {
              value: item.id,
              label: item.name
            }
          })
          setOptions([...options]);
        } catch (err){
        }
      };
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
                      loadData={loadData}
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