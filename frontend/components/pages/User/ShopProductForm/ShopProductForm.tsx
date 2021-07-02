import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import InputRange from 'react-input-range'
import { Form, Input, DatePicker, Upload, Switch  } from 'antd'
const { RangePicker } = DatePicker;
import { useAuth } from '@context/AuthContext'

import s from './ShopProductForm.module.css'
interface Props {
  title?: string;
  inputName: string;
  type?: string;
  required: boolean;
  tips?: string;
}

interface Array<T> {
  /** Iterator */
  [Symbol.iterator](): IterableIterator<T>;

  /**
   * Returns an iterable of key, value pairs for every entry in the array
   */
  entries(): IterableIterator<[number, T]>;

  /**
   * Returns an iterable of keys in the array
   */
  keys(): IterableIterator<number>;

  /**
   * Returns an iterable of values in the array
   */
  values(): IterableIterator<T>;
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
  const [isLoading, setIsLoading] = useState(false)
  const onFinish = async (values: any) => {
    console.log('--->values', values)
    setIsLoading(true)
    const { data  } = await axios.post('products', {
            ...values, 
        },{ headers: {   'Authorization': `Bearer ${accessToken}` } })
        console.log('--->', data)
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
              <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                  <div className="md:col-span-5">
                    <label className={s.label}>Tên sản phẩm</label>
                    <Form.Item name="name"
                        rules={[{ required: true, message: 'Please input Tên sản phẩm!' }]} >
                      <Input placeholder='Tên sản phẩm' className={s.input}  />
                    </Form.Item>

                  </div>
                  <div className="md:col-span-1">
                  <label className={s.label}>Trạng thái</label>
                  <Switch defaultChecked className="mt-2" />
                  </div>
              </div>
              <div className="relative w-full mb-6">
                 <label className={s.label}>Mã sản phẩm(SKU)</label>
                  <Form.Item name="sku"
                      rules={[{ required: true, message: 'Vui lòng nhập SKU sản phẩm!' }]} >
                    <Input placeholder='Mã sản phẩm(SKU)' className={s.input}  />
                  </Form.Item>
                </div>
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <label className={s.label}>Giá sản phẩm</label>
                   <Form.Item name="price" >
                    <Input placeholder='Giá sản phẩm' type="number"  className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <label className={s.label}>Giá khuyến mãi</label>
                   <Form.Item name="price_discount" >
                    <Input placeholder='Giá sản phẩm' type="number" className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <div className="relative w-full mb-6">
                    <label className={s.label}>Thời hạn khuyến mãi</label>
                    <RangePicker />
                  </div>
               
              </div>
              </div>

              <div className="relative w-full mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2 ml-1">
               Mô tả
                </label>
                <Form.Item name='message'  rules={[{ required: true,
                   message: 'Cần nhập mô tả sản phẩm' }]}>
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
