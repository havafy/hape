import { FC, useState, ChangeEvent, Component, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import InputRange from 'react-input-range'
import { Form, Input, DatePicker, Upload, Switch, TreeSelect  } from 'antd'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { AiOutlineSave } from 'react-icons/ai'

const { RangePicker } = DatePicker;
import { useAuth } from '@context/AuthContext'
import { default as categoryTree } from '@config/category'
import s from './ShopProductForm.module.css'
import product from 'next-seo/lib/jsonld/product'

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
  const router = useRouter()
  const { id } = router.query
  const { accessToken } = useAuth();
  const [ready, setReady] = useState(false)
  const [product, setProduct] = useState({})
  const [status, setStatus] = useState(true)
  const [category, setCategory] = useState()
    
  const [fileList, setFileList] = useState<any>([]);
  const [discountDate, setDiscountDate] = useState<string[] | null[]>([null, null])
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<string[]>([])
  
  useEffect(() => {
    (async () => {
      if(id){
        let { data: { found, product} } = await axios.get('/products/' + id, { 
          headers: { 'Authorization': `Bearer ${accessToken}` } 
        })
        if(found){
          updateProduct(product)

        }
      }
      setReady(true)
    })()
  
  }, [])

  const updateProduct =  (product: any) => {
    setProduct(product)
    setCategory(product.category)
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
        const discountBegin = discountDate[0]
        const discountEnd= discountDate[1]
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
        }
        if(response.data.status){
          updateProduct(response.data.product)
        }else{
          setFormMessage([response.data.message])
        }

    } catch (err){
      console.log('response.data:', err.response.data)
      if(err?.response?.data){
        setFormMessage(err.response.data.message)
      }
 
      
    }
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
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
                    <a className={s.backButton}><IoMdArrowRoundBack className="inline" /> Quay lại</a>
                    </Link>
                    </span>
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
                    />  </div>
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
                    <RangePicker  onChange={(value:any, dateString: string[]) => setDiscountDate(dateString)} />
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
