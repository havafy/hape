import React, { FC, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Button, Modal, Popconfirm } from 'antd'
import s from './AddressBook.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
import { AddressForm } from '@components/common'

const AddressBook: FC = () => {
  const { accessToken, updateAction } = useAuth();
  const [ visible, setVisible] =useState(false)
  const [updateAddress, setUpdateAddress] = useState<any>()
  const [addresses, setAddresses] = useState([])
  const [ loading, setLoading] = useState(false)
  const handleClose = useCallback((e:any) => {
      setVisible(false)
      pullAddress()

  }, [])  
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    pullAddress(0)
  }, [])


const pullAddress = async (timeout = 1000)=>{
  setTimeout(async function() { //Start the timer
    let { data: { addresses } } = await axios.get('/address', { ...headerApi } )
    setAddresses(addresses)
    }.bind(this), timeout)

}


const createNewAddress = () =>{
  setUpdateAddress({})
  setVisible(true);
}

const editAddress = (address: any) => {
  // updateAction({event: 'ADDRESS_EDIT', payload: id})
  setUpdateAddress(address)
  setVisible(true);
}
const onCancel = () => {
  setVisible(false);
}

const onAddressCreate = async (values: any) => {
}

const deleteAddress = async (id: string) => {
  await axios.delete('/address/' + id, headerApi)
  await pullAddress()

}
const setThisIsDefault = async (address: any) => {
  await axios.put('/address/action',{ id: address.id, 'action': 'setIsDefault' }, headerApi)
  await pullAddress()

}


return (<>
        <div className="">
            <div className={s.formBox}>
            <div>
              <div className="grid grid-cols-2">
                  <div className="col-span-1">
                  <h1 className={s.h1}>Địa Chỉ Của Tôi</h1>
                  </div>
                    <div className="col-span-1 text-right">
              
                      <Button type="primary" 
                      onClick={createNewAddress} className="addButton"
                      disabled={addresses.length >= 10}
                      >
                      <RiAddFill className={s.addButtonSvg} /> Thêm Địa Chỉ Mới</Button>

                      <Modal title={updateAddress?.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ" } className="auth-form-modal"
                          width="750px"
                          visible={visible}
                          onOk={onAddressCreate}
                          onCancel={onCancel}
                
                          okText="Create"
                        footer={null} >
                        <AddressForm address={updateAddress} closeModal={handleClose}/>

                        </Modal>
                     

                    </div>
                  </div>
          
              <div>
              {addresses.map((address: any) => {
                
                return (
                  <div className={s.addressItem}>
                <div className="grid grid-cols-3">
                  <div className="col-span-2">
                      <div className={s.fieldRow}>
                        <span className={s.label}>Họ Và Tên</span>
                        <span className={s.value}><b className="mr-5">{address.fullName}</b>  
                        <span className="label">
                              {address.addressType==='home'? 'Nhà riêng': "Văn phòng"} 
                              </span>
                        { address.default && <span className="label label-green">Mặc định</span> }
                        </span>
                        </div>
                        <div className={s.fieldRow}>
                          <span className={s.label}>Số Điện Thoại</span>
                          <span className={s.value}>{address.phoneNumber}</span>
                        </div>
                        <div className={s.fieldRow}>
                          <span className={s.label}>Địa Chỉ</span>
                          <span className={s.value}>
                            <span>     
                              {address.address} 
                              
                              <br/>
                              {address.regionFull}
                              </span>
                       
                            </span>
                        </div>   
                    </div>
                    <div className="col-span-1 ">
                      
                      <div className="mt-7 text-right">
                        <button className={s.linkBtn} onClick={e=>editAddress(address)}>Sửa</button>
              

                        { !address.default && 
                  <Popconfirm
                    title="Bạn muốn xoá?"
                    onConfirm={e=> deleteAddress(address.id)}
                    onCancel={e=>{}}
                    okText="Đúng, tôi muốn xoá."
                    cancelText="Bỏ qua" ><button className={s.linkBtn}>Xoá</button></Popconfirm>}
                        <div className="mt-3">
                          {!address.default && <button className={s.actionButton} onClick={e=>setThisIsDefault(address)}>Làm mặc định</button> }
                        </div>
                      </div>
                    </div>
                    </div>
                    </div>
                )

              })}

              </div>
              </div>
            </div>

        </div>
        
        </>
  )
}

export default AddressBook
