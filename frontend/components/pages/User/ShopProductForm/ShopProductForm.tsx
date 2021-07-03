import { FC, useState, ChangeEvent, Component, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import InputRange from 'react-input-range'
import { Form, Input, DatePicker, Upload, Switch, TreeSelect  } from 'antd'
const { RangePicker } = DatePicker;
import { useAuth } from '@context/AuthContext'
import { categoryTree } from '@config/category.json'
import s from './ShopProductForm.module.css'

interface Props {
  title?: string;
  inputName: string;
  type?: string;
  required: boolean;
  tips?: string;
}


function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const ShopProductForm: FC = () => {
  const [ fileList, setFileList ] = useState([
    {
      uid: '-1',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    {
      uid: '-2',
      name: 'image.png',
      status: 'done',
      url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    },
    
    {
      uid: '-5',
      name: 'image.png',
      status: 'error',
    },
  ])
  const { user, accessToken } = useAuth();
  const [status, setStatus] = useState(true)
  const [category, setCategory] = useState()
  const [discountDate, setDiscountDate] = useState([null, null])
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState(false)

  useEffect(() => {
    console.log('discountDate:', discountDate)
  }, [discountDate])

  const onFinish = async (values: any) => {
    setIsLoading(true)
    try{
      const discountBegin = discountDate[0]
      const discountEnd= discountDate[1]
      const postData = {
        status,
        userID: user.id,
        category,
        discountBegin,
        discountEnd,
          ...values, 
      }
      console.log(postData)
      const { data } = await axios.post('products', postData,{ 
        headers: { 'Authorization': `Bearer ${accessToken}` } 
      })
      console.log('data:', data)
      } catch (err){
        const { data } = err.response
        console.log('err', data)
        setFormMessage(data.message)
        
      }
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  

 const handleCancel = () => {
   //setState({ previewVisible: false });
 }

 const  handlePreview = async (file :any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    // this.setState({
    //   previewImage: file.url || file.preview,
    //   previewVisible: true,
    //   previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    // });
  };

  const handleUploadChange = ({ fileList: any }) =>{
//this.setState({ fileList });
  } 

  return (

        <div className="">
          <h1 className={s.h1}>Thêm sản phẩm</h1>
            <div className={s.formBox}>
            <Form name="product-form" initialValues={{  }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}    >
             <div className={s.formMessage}>
                    {Array.isArray(formMessage) && formMessage.map((item: string, i:any) => {     
                          return (<div key={i}>• {item}</div>) 
                        })}
                </div>
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-2">
                    <label className={s.label}>Tên sản phẩm</label>
                    <Form.Item name="name"
                        rules={[
                          { required: true, message: 'Please input Tên sản phẩm!' },
                          { min: 10, message: 'Yêu cầu dài hơn 10 ký tự.' },
                          ]} >
                      <Input placeholder='Tên sản phẩm' className={s.input}  />
                    </Form.Item>

                  </div>
                  <div className="md:col-span-1">
                  <label className={s.label}>Trạng thái</label>
                  <Switch defaultChecked onChange={ value => setStatus(value)} className="mt-2" />
                  </div>
              </div>
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">
         
                <div className="md:col-span-1">
                 <label className={s.label}>Mã sản phẩm(SKU)</label>
                  <Form.Item name="sku"
                      rules={[
                        { required: true, message: 'Vui lòng nhập SKU sản phẩm!' },
                        { min: 5, message: 'Yêu cầu dài hơn 5 ký tự.' },
                      ]} >
                    <Input placeholder='Mã sản phẩm(SKU)' className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                 <label className={s.label}>Số lượng</label>
                  <Form.Item name="quantity" >
                    <Input placeholder='Số lượng sản phẩm(nếu có)' className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                <label className={s.label}>Danh mục</label>
                  <TreeSelect
                    showSearch
                      style={{ width: '100%' }}
                      value={category}
                      dropdownStyle={{ maxHeight: 500, overflow: 'auto' }}
                      treeData={categoryTree}
                      placeholder="Chọn danh mục"
                      treeDefaultExpandAll
                      onChange={(value: any) => setCategory(value)}
                    />
                              </div>
                </div>
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <label className={s.label}>Giá sản phẩm</label>
                   <Form.Item name="price"   
                   rules={[{ required: true, message: 'Vui lòng nhập giá.' }]}>
                    <Input placeholder='Giá sản phẩm' type="number"  className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <label className={s.label}>Giá khuyến mãi</label>
                   <Form.Item name="priceDiscount" >
                    <Input placeholder='Giá sản phẩm' type="number" className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <div className="relative w-full mb-6">
                    <label className={s.label}>Thời hạn khuyến mãi</label>
                    <RangePicker  onChange={(value:any, dateString) => setDiscountDate(dateString)} />
                  </div>
               
              </div>
              </div>

              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2 ml-1">
               Mô tả
                </label>
                <Form.Item name='description'  rules={[{ required: true,
                   message: 'Cần nhập mô tả sản phẩm' },
                   { min: 50, message: 'Yêu cầu dài hơn 50 ký tự.' }
                   ]}>
                  <Input.TextArea 
                        placeholder='Thông tin chi tiết sản phẩm'
                        rows={8}
                        cols={40}
                        className={s.input} />
                </Form.Item>
              </div>

              <div className="relative w-full mb-6">
                    <label className={s.label}>Hình ảnh</label>
                    <Upload
                        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleUploadChange} / >
                  </div>
              <div className="relative w-full mb-3 justify-center">
                <button type="submit"  className={s.button} >
                  { !isLoading ? 'Gởi đi' : 'Xử lý....' }
                </button>
              </div>

            </Form>
            </div>

        </div>
  )
}

export default ShopProductForm
