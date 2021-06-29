import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import axios from 'axios'
import InputRange from 'react-input-range'
import { Form, Input, DatePicker, Upload, Switch  } from 'antd'
const { RangePicker } = DatePicker;
import { PlusOutlined } from '@ant-design/icons';
import s from './PostForm.module.css'
interface Props {
  title?: string;
  name: string;
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


const TextInput: FC<Props> = ({ title, name, required = false, type = 'text', tips}) => (
  <div className="relative w-full mb-6">
    <label className={s.label}>{title}</label>
   {/* <input type={type} placeholder={title} className={s.input} /> */}
    <Form.Item name={name}
        rules={[{ required, message: 'Vui lòng nhập ' + title?.toLowerCase() + '!' }]} >
       <Input placeholder={title} className={s.input}  />
       { tips && <div className="text-sm pt-3 text-gray-600">{tips}</div>}
     </Form.Item>
</div>
)
function getBase64(file: any) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
const PostForm: FC = () => {
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
    <main className="mt-20 sm:mt-20 md:mt-32">
      <div className="mx-auto max-w-7xl">
        <div className="md:grid md:grid-cols-6 md:gap-6">

          <div className="mt-5 sm:px-10 px-0 md:mt-0 md:col-span-5">

          <h1 className={s.h1}>Thêm sản phẩm</h1>
            <div className={s.formBox}>
            <Form name="basic" initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}    >
              <div className="mt-8 md:grid md:grid-cols-6 md:gap-6">
                  <div className="md:col-span-5">
                  <TextInput name="name" title="Tên sản phẩm" type="text"  required />
                  </div>
                  <div className="md:col-span-1">
                  <label className={s.label}>Trạng thái</label>
                  <Switch defaultChecked className="mt-2" />
                  </div>
              </div>

          
              <TextInput name="product_url" title="URL đặt hàng" type="text"
                tips="Link sản phẩm ở shop của bạn, ví dụ: https://shopee.vn/iphone12-red-128GB"
                required />
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <TextInput name="price"
                   title="Giá khuyến mãi"type="email"
                   tips="Giá khách hàng có thể mua được trong thời gian khuyến mãi."
                   required />
                </div>
                <div className="md:col-span-1">
                  <TextInput name="price_original" title="Giá bán lẻ" type="text" required />
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
                   message: 'Please input your project!' }]}>
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
          <div className="md:col-span-1">
            <div className="px-4 sm:px-0">

              <div className={s.infoBox}>

              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PostForm
