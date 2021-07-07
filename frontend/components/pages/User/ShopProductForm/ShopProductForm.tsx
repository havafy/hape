import { FC, useState, ChangeEvent, Component, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { 
  Form, Input, DatePicker, 
  Upload, Switch, TreeSelect, 
  ConfigProvider, InputNumber,
  Popconfirm, message 
  } from 'antd'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { AiOutlineSave } from 'react-icons/ai'
import { RiDeleteBin6Line } from 'react-icons/ri'

import moment from 'moment'
import locale from 'antd/lib/locale/vi_VN';
const { RangePicker } = DatePicker;
import { useAuth } from '@context/AuthContext'
import { default as categoryTree } from '@config/category'
import s from './ShopProductForm.module.css'


const ShopProductForm: FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { accessToken } = useAuth();
  const [ready, setReady] = useState(false)
  const [product, setProduct] = useState({})
  const [status, setStatus] = useState(true)
  const [category, setCategory] = useState()
    
  const [fileList, setFileList] = useState<any>([]);
  const [discountDate, setDiscountDate] = useState<string[]>(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<string[]>([])
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }

  useEffect(() => {
    (async () => {
      if(id){
        let { data: { found, product} } = await axios.get('/products/' + id, headerApi)
        if(found){
          updateProduct(product)

        }
      }
      setReady(true)
    })()
  
  }, [])
  const deleteProduct = async ()=>{
    await axios.delete('/products/' + id, headerApi)
    setTimeout(function() { //Start the timer
        router.push('/user/shop-products')
    }.bind(this), 1200)

  }
  const updateProduct =  (product: any) => {
    setProduct(product)
    setCategory(product.category)
    setDiscountDate([product.discountBegin, product.discountEnd])
    // set images to review
    setFileList(product.images.map((url: string, key:string)=> {
          return {
            uid: key,
            name: url,
            status: 'done',
            url
          }
        }))
  }
  const onFinish = async (values: any) => {
    setIsLoading(true)
    setFormMessage([])
    const authConfig = { 
      headers: { 'Authorization': `Bearer ${accessToken}` } 
    }

    let images = fileList.map((item: any) =>{
      if(item.url){
        return item.url
      }
      return item.response.url 
    })
    try{
        const discountBegin = discountDate[0] !== '' ? discountDate[0] : null
        const discountEnd= discountDate[1] !== '' ? discountDate[1] : null
        const postData = {
          ...values, 
          status,
          category,
          discountBegin,
          discountEnd,
          images
        }
        // if product is existing, let call Update API
        let response: any = null

        if(id){ // Update Case: push product ID to the post data
          postData.id = id
          response= await axios.put('products', postData,authConfig)
        }else{// Create New One Case
          response = await axios.post('products', postData,authConfig)
          router.push('/user/shop-product-form?id=' + response.data.product.id)
        }
        if(response.data.status){
          updateProduct(response.data.product)
        }else{
          setFormMessage([response.data.message])
        }

    } catch (err){
      if(err?.response?.data){
        setFormMessage(err.response.data.message)
      }
    }
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
  };
  const onChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };
  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow:any = window.open(src);
    imgWindow.document.write(image.outerHTML);
  };



  return (
    <>
    {ready && <Form name="product-form" initialValues={product}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}  >
        <div className="">
 
          <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-2">
                <h1 className={s.h1}>{id ?  'Cập nhật sản phẩm': 'Thêm sản phẩm'}</h1>
                </div>
                <div className="md:col-span-1 text-right">
                  <span>
                  <Link href="/user/shop-products">
                    <a className={s.iconLink}><IoMdArrowRoundBack className="inline" /> Quay lại</a>
                    </Link>
                    </span>

                { id && <span className={s.iconAction}>
                  <Popconfirm
                    title="Bạn muốn xoá sản phẩm này?"
                    onConfirm={deleteProduct}
                    onCancel={e=>{}}
                    okText="Đúng, tôi muốn xoá."
                    cancelText="Bỏ qua" ><RiDeleteBin6Line /></Popconfirm></span> }
                  <button type="submit" className={s.button} > 
                  <AiOutlineSave className="inline mr-1" /> { !isLoading ? 'Lưu' : 'Xử lý....' }
                    </button>
                </div>
            </div>
            <div className={s.formBox}>

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
                  <Form.Item name="quantity">
                    <InputNumber min={1} max={1000} placeholder='Số lượng sản phẩm(nếu có)' className={s.input}  />
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
                  <label className={s.label}>Giá sản phẩm(₫)</label>
                   <Form.Item name="price"   
                   rules={[
                     { required: true, message: 'Vui lòng nhập giá.', }]}>
                   <InputNumber min={1000} max={90000000} placeholder='Giá sản phẩm' className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <label className={s.label}>Giá khuyến mãi(₫)</label>
                   <Form.Item name="priceDiscount" >
                    <InputNumber min={1000} max={90000000} placeholder='Giá sản phẩm' type="number" className={s.input}  />
                  </Form.Item>
                </div>
                <div className="md:col-span-1">
                  <div className="relative w-full mb-6">
                    <label className={s.label}>Thời hạn khuyến mãi</label>
         
                    <ConfigProvider locale={locale}>
                      <RangePicker 
                        onChange={(value:any, dateString: string[]) => setDiscountDate(dateString)}
                        defaultValue={discountDate[0] ? [
                          moment(discountDate[0]),
                          moment(discountDate[1]),
                      ]: null} />
                    </ConfigProvider>
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
                        name="file"
                        action={process.env.NEXT_PUBLIC_API+'/file'}
                        headers={{ Authorization: `Bearer ${accessToken}`}}
                        listType="picture-card"
                        fileList={fileList}
                        onChange={onChange}
                        onPreview={onPreview}
                      >
                        {fileList.length < 5 && '+ Upload'}
                      </Upload>
                  </div>
    

            </div>

        </div>
     </Form> }
     </>
  )
}

export default ShopProductForm
