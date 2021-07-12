import React, { FC, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Button, Modal } from 'antd'
import s from './AddressBook.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
import { AddressForm } from '@components/common'
const AddressBook: FC = () => {
  const { user, accessToken } = useAuth();
  const [ visible, setVisible] =useState(false)
  const [addresses, setAddresses] = useState([])
  const [ loading, setLoading] = useState(false)
  const handleClose = useCallback((e:any) => {
      setVisible(false)
  }, [])  
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    pullAddress()
  }, [])


const pullAddress = async (currentPage = 1)=>{
    // let { data: { addresses } } = await axios.get('/users/address', { ...headerApi } )
    // setAddresses(addresses)
}
const deleteProducts = async () => {
  setLoading(true)
  // ajax request after empty completing
  // for (const productID of selectedRowKeys){
  //    await axios.delete('/products/' + productID, headerApi)
  // }

  await pullAddress()
  setLoading(false)
}

const handleOk = () => {
  setVisible(false);
};

const onCancel = () => {
  setVisible(false);
}
const onFinish = async (values: any) => {
}
const onAddressCreate = async (values: any) => {
}

return (<>
        <div className="">
          <h1 className={s.h1}>Địa Chỉ Của Tôi</h1>
            <div className={s.formBox}>
            <div>
              <div className="mb-3 grid grid-cols-2">
                  <div className="col-span-1">
       
                  </div>
                    <div className="col-span-1 text-right">
            
                      <Button type="primary" 
                      onClick={e=>setVisible(true)} className="addButton">
                      <RiAddFill className={s.addButtonSvg} /> Thêm Địa Chỉ Mới</Button>

                      <Modal title="Thêm địa chỉ" className="auth-form-modal"
                          visible={visible}
                          onOk={onAddressCreate}
                          onCancel={onCancel}
                          maskClosable={false}
                          okText="Create"
                        footer={null} >
                        <AddressForm closeModal={handleClose}/>

                        </Modal>
                     

                    </div>
                  </div>
          
              
              </div>
            </div>

        </div>
        
        </>
  )
}

export default AddressBook
