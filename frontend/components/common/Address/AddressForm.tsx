import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Form, Input, Radio, Checkbox, TreeSelect} from 'antd'
import s from './AddressForm.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { phoneFormat} from '@lib/get-slug'
import { CgSpinner } from 'react-icons/cg'

import { useAuth } from '@context/AuthContext'

const AddressForm: FC<{closeModal: any, address: any}>= ({closeModal, address}) => {
const { accessToken, action } = useAuth();
const headerApi = { 
  headers: { 'Authorization': `Bearer ${accessToken}` } 
}
const [ready, setReady] = useState(false)
const [loading, setLoading] = useState(false);
const [selectedProvince, setSelectedProvince] = useState('');
const [selectedDistrict, setSelectedDistrict] = useState('');
const [selectedWard, setSelectedWard] = useState('');
const [provinces, setProvinces] = useState([]);
const [wards, setWards] = useState([]);
const [districts, setDistricts] = useState([]);
const [phone, setPhone] = useState<string>('')
const [isDefault, setIsDefault] = useState(false);
const [typeAddress, setTypeAddress] = useState('home')
const [formMessage, setFormMessage] = useState<string[]>([])


useEffect(() => {

  if(address?.id){
    fillAddress(address)
  }else{
    resetForm()
  }

},[address])

useEffect(() => {
  pullProvinces()
},[])
useEffect(() => {
  pullDistricts()
},[selectedProvince])
useEffect(() => {
  pullWards()
},[selectedDistrict])
const pullWards = async () => {
  setWards(await getRegions(selectedDistrict))
}
const pullDistricts = async () => {
  setDistricts(await getRegions(selectedProvince))
}
const pullProvinces = async () => {
  setProvinces(await getRegions('VN'))
}
const fillAddress = async (address: any) => {
  setReady(false)
  setTimeout(function() { //Start the timer
    setReady(true)
    }.bind(this), 100)
  setFormMessage([])
  setPhone(address.phoneNumber)
  setSelectedProvince(address.province)
  setSelectedDistrict(address.district)
  setSelectedWard(address.ward)
  setIsDefault(address.default)
  setTypeAddress(address.addressType)
  
  await pullDistricts()
  await pullWards()


}
const resetForm = () =>{

  setSelectedProvince('')
  setSelectedDistrict('')
  setSelectedWard('')
  setIsDefault(false)
  setReady(false)
  setTimeout(function() { //Start the timer
    setReady(true)
    }.bind(this), 100)
}

const getRegions = async (parent: string) => {
  if(parent === '') return []
  try {
    //send register data to API
    const { data:{regions} } = await axios.get('regions',{ 
      ...headerApi,
      params: { parent }
    }) 
   return regions.map((item: any) => {

      return  {
        value: item.id,
        title: item.name
      }
    })
    
  } catch (err){
  }
  return []
}
const onChangeProvince = (value:string) => {
  setSelectedProvince(value)
  setSelectedDistrict('')
  setSelectedWard('')
}
const onChangeDistrict = (value:string) => {
  setSelectedDistrict(value)
  setSelectedWard('')
}
const onFinish = async (values: any) => {
  setLoading(true)
  setFormMessage([])
  if(!selectedWard){
    setFormMessage(['Vui lòng chọn phường hoặc xã.'])
    return
  }
  try {
    const submitData = {
      ...values,
      phoneNumber: phone,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      default: isDefault,
      addressType: typeAddress,
    }
    //send data to API
    let res 
    if(address?.id){
      res = await axios.put('address', { ...submitData, id: address.id }, headerApi) 
    }else{
      res = await axios.post('address', submitData, headerApi) 
    }
   
    closeModal(res)
    setLoading(false)
  } catch (err){
    if(err?.response?.data){
      setFormMessage(err.response.data.message)
    }
  }
} 
const onFinishFailed = (errorInfo: any) => {
    console.log(errorInfo)
}    

const changeType = (e:any )  =>{
  setTypeAddress(e.target.value)
}
const onSetDefaultChange = (e:any )  =>{
  setIsDefault(e.target.checked)
}

return (<>
     { ready && <Form name="address-user-form"
         onFinish={onFinish}
          onFinishFailed={onFinishFailed} initialValues={{ ...address }} >
                <div className={s.formMessage}>
                    {Array.isArray(formMessage) && formMessage.map((item: string, i:any) => {     
                          return (<div key={i}>• {item}</div>) 
                        })}
                </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-1 pb-3 md:pb-0">
              <Form.Item name="fullName"
                  rules={[
                    { required: true, message: 'Vui lòng nhập họ tên!' },
                    { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                    ]} >
                <Input placeholder='Họ tên người nhận' className={s.input}  />
              </Form.Item>
              </div>
              <div className="col-span-1">
              <input value={phone} 
                        onChange={e=>{setPhone(phoneFormat(e.target.value))}}
                        placeholder='Số điện thoại' className={s.input}  />
              </div>
            </div>
            <div className="mt-5">
            <div className="mb-2">Tỉnh thành/Quận Huyện/Phường:</div>
            <div className="flex">
            <TreeSelect className="mr-3"
                    showSearch
                    treeNodeFilterProp='title'
                      style={{ width: '33%' }}
                      value={selectedProvince}
                      dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                      treeData={provinces}
                      placeholder="Tỉnh thành"
                      treeDefaultExpandAll
                      onChange={(value: any) => onChangeProvince(value)}
                    /> 
              <TreeSelect className="mr-3"
                    showSearch
                    treeNodeFilterProp='title'
                      style={{ width: '33%' }}
                      value={selectedDistrict}
                      dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                      treeData={districts}
                      placeholder="Quận huyện"
                      treeDefaultExpandAll
                      onChange={(value: any) => onChangeDistrict(value)}
                    /> 
              <TreeSelect
                    showSearch
                    treeNodeFilterProp='title'
                      style={{ width: '33%' }}
                      value={selectedWard}
                      dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                      treeData={wards}
                      placeholder="Xã phường"
                      treeDefaultExpandAll
                      onChange={(value: any) => setSelectedWard(value)}
                    /> 
               </div>
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
                <Radio.Group value={typeAddress}
                    onChange={changeType}
                    buttonStyle="solid">
                    <Radio.Button value="office">Văn phòng</Radio.Button>
                    <Radio.Button value="home">Nhà riêng</Radio.Button>
             
                  </Radio.Group>
                </div>
                <div className="mt-7">
      
                <Checkbox defaultChecked={isDefault} onChange={onSetDefaultChange}>Đặt làm địa chỉ mặc định</Checkbox>
                </div>
                <div className="mt-7 text-right">
                <button onClick={e=>closeModal(null)} className="mr-6">Trở về</button>
                    <button type="submit" className={s.button}>{loading && <CgSpinner className="animate-spin" />} Hoàn thành</button>
                  </div>          
    </Form>
}</>)
 }
export default AddressForm