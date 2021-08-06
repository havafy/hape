import { FC, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import axios from 'axios'
import { 
  Form, Input, DatePicker, 
  Upload, Switch, 
  ConfigProvider, InputNumber,
  Popconfirm, message, Select, Tabs
  } from 'antd'
  const { TabPane } = Tabs
import cn from 'classnames'
import { IoMdArrowRoundBack } from 'react-icons/io'
import { AiOutlineSave } from 'react-icons/ai'
import { RiDeleteBin6Line, RiSearchLine, RiCloseFill} from 'react-icons/ri'

import moment from 'moment'
import locale from 'antd/lib/locale/vi_VN';
// const { RangePicker } = DatePicker;
import { useAuth } from '@context/AuthContext'
import s from './ShopProductForm.module.css'


const ShopProductForm: FC = () => {
  const router = useRouter()
  const { id } = router.query
  const { accessToken } = useAuth();
  const [ready, setReady] = useState(false)
  const [product, setProduct] = useState({})
  const [status, setStatus] = useState(true)
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState<string>('')
  const [categoryID, setCategoryID] = useState<number>(0)
  const [categoryResults, setCategoryResults] = useState<any[]>([])
  const [fileList, setFileList] = useState<any>([]);
  const [expiryDate, setExpiryDate] = useState<string>()
  //const [discountDate, setDiscountDate] = useState<string[]>(['', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [formMessage, setFormMessage] = useState<string[]>([])
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }

  useEffect(() => {
    (async () => {
      if(id){
        let { data: { found, product, categoryRaw} } = await axios.get('/products/' + id, headerApi)
        if(found){
          updateProduct(product, categoryRaw)

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
  const updateProduct = (product: any, categoryRaw: any) => {
    setProduct(product)
    setCategoryID(product.category)
    setCategory(getFullCategoryName(categoryRaw))

    // setDiscountDate([product.discountBegin, product.discountEnd])
    // set images to review
    setFileList(product.images.map((url: string, key:string)=> {
          return {
            uid: key,
            name: url,
            status: 'done',
            url
          }
        }))
    setTags(product.tags)
    setExpiryDate(product.expiryDate)
  }
  const onFinish = async (values: any) => {

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
    if(categoryID ===0 ){
      message.error('Vui lòng chọn danh mục.')
      return
    }
    if(fileList.length ===0 ){
      message.error('Vui lòng cung cấp hình sản phẩm.')
      return
    }
    setIsLoading(true)
    try{
        // const discountBegin = discountDate[0] !== '' ? discountDate[0] : null
        // const discountEnd= discountDate[1] !== '' ? discountDate[1] : null
        const postData = {
          ...values, 
          status,
          category: categoryID,
          // discountBegin,
          // discountEnd,
          images,
          tags,
          expiryDate
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
          updateProduct(response.data.product, response.data.categoryRaw)
          message.success(id ?  'Cập nhật thành công': 'Thêm sản phẩm thành công')
        }else{
          message.error(response.data.message)
        }

    } catch (err){
      if(err?.response?.data){
        // setFormMessage(err.response.data.message)
        message.error(err.response.data.message.join(', '))
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

  const changeTags = (value: string[]) =>{
      setTags(value)
  }
  const onExpiryDateChange = (date: any, dateString: string) => {
    setExpiryDate(dateString);
  }
  const typingCategoryInput = (event: any) =>{
    const keyword = event.target.value
    setCategory(keyword)
    collectCategorySearch(keyword)
    
  }
  const collectCategorySearch = async (keyword: string) =>{
    if(keyword!==''){
      let { data: {categories} } = await axios.get('/categories?keyword=' + keyword, headerApi)
      setCategoryResults(categories)
     }
    if(keyword ===''){
      setCategoryResults([])
    }
  }
  const pickupCategory = (category: any) =>{
    setCategoryID(category.id)

    setCategory(getFullCategoryName(category, false))
    setCategoryResults([])
  } 
  const getFullCategoryName = (category: any, reverse = true) =>{
    if(category?.display_name){
      let name = category.display_name
      if(category.parentName.length > 0){
        if(reverse){
          name = category.parentName.reverse().join(' / ') + ' / ' + name 
        }else{
          name = category.parentName.join(' / ') + ' / ' + name 
        }

      }
      
      return name
    }
    return ''
  }
  const cleanCategoryInput = () =>{
    setCategory('')
    setCategoryID(0)
  }


  return (
    <>
    {ready && <Form name="product-form" initialValues={product}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}  >


        <div  className={s.formBox}>
 
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
            <div>

             <div className={s.formMessage}>
                    {Array.isArray(formMessage) && formMessage.map((item: string, i:any) => {     
                          return (<div key={i}>• {item}</div>) 
                        })}
                </div>
              <Tabs defaultActiveKey="1">
                  <TabPane tab="Chung" key="1">
          
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
                <label className={s.label}>Giá thường</label>
                    <Form.Item name="regular_price"   
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá.', }]}>
                    <InputNumber min={1000} max={90000000} placeholder='Giá sản phẩm' className={s.input}  />
                    </Form.Item>
                </div>
      
              <div className="md:col-span-1">
                  <label className={s.label}>Giá khuyến mãi</label>
                    <Form.Item name="sale_price"   
                    rules={[
                      { required: true, message: 'Vui lòng nhập giá khuyến mãi.', }]}>
                    <InputNumber min={1000} max={90000000} placeholder='Giá sản phẩm' className={s.input}  />
                    </Form.Item>
                    </div>

                </div>
                <div className="mt-8 md:grid md:grid-cols-2 md:gap-6">
                <div className="md:col-span-1">
                 <label className={s.label}>Mã sản phẩm(SKU)</label>
                  <Form.Item name="sku"
                      rules={[
                        { required: true, message: 'Vui lòng nhập SKU sản phẩm!' },
                        { min: 3, message: 'Yêu cầu dài hơn 3 ký tự.' },
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
      
                </div>
                <div className="mt-8 relative">
                  <label className={s.label}>Danh mục</label>
                  <div className={s.categoryInput}>
                    <RiSearchLine />
                    <input type="text" value={category}
                      onChange={typingCategoryInput} 
                    /> 

                    <RiCloseFill 
                    className={cn(s.categoryClose, category === '' ? 'invisible' : '')} 
                    onClick={e=>cleanCategoryInput()}/>
                  </div>
                  {categoryResults.length > 0 && <div className={cn(s.dropdownBox,category === '' ? 'hidden' : '')}>
                    {categoryResults.map((category: any)=>{
                      if(category.parentName){
                        return (<div 
                          onClick={e=>pickupCategory(category)}
                        className={s.dropdownItem}>
                         
                         <span className={s.categoryParent}>{category.parentName.length > 0 &&
                         category.parentName.reverse().join(' / ') + ' / '}</span> {category.display_name}
                          </div>)
                      }

                    })}  
                  </div>}
                </div>
              <div className="mt-8 md:grid md:grid-cols-3 md:gap-6">

                {/* <div className="md:col-span-1">
                  <label className={s.label}>Giá khuyến mãi(₫)</label>
                   <Form.Item name="sale_price" >
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
                
                </div> */}
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
    
              </TabPane>
                <TabPane tab="Đặc tính" key="2">
                      <div>
                        <div className="flex my-3">
                        <label className={s.labelRow}>Từ khoá(#hashtag)<span>(giúp tìm sản phẩm)</span></label>
                          <Select mode="tags" className={s.inputRow}
                                defaultValue={tags}
                            onChange={changeTags} tokenSeparators={[',']}></Select>

                
                          </div>
                          <div className="flex my-3">
                                  <label className={s.labelRow}>Trọng lượng(gram)
                        
                                  <span>(Sau khi đóng gói)</span></label>
                                  <Form.Item name="weight" className={s.inputRow}>
                                    <InputNumber min={100} max={50000} placeholder='Cân nặng sản phẩm(gram)' className={s.input}  />
                                </Form.Item>
                        </div>
                        <div className="flex my-3">
                              <label className={s.labelRow}>Kích thước đóng gói(cm)</label>
                              <div className="w-96 flex">
                                  <Form.Item name="length" className="w-44 mr-5">
                                    <InputNumber min={10} max={50000} placeholder='Dài' className={s.input}  />
                                </Form.Item>
                                <Form.Item name="width" className="w-44 mr-5">
                                    <InputNumber min={10} max={50000} placeholder='Rộng' className={s.input}  />
                                </Form.Item>
                                <Form.Item name="height" className="w-44 mr-5">
                                    <InputNumber min={10} max={50000} placeholder='Cao' className={s.input}  />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="flex my-3">
                                  <label className={s.labelRow}>Thương hiệu</label>
                                  <Form.Item name="brand" className={s.inputRow}>
                                    <Input placeholder='Thuơng hiệu' className={s.input}  />
                                </Form.Item>
                        </div>
                        <div className="flex my-3">
                                  <label className={s.labelRow}>Xuất xứ 
                                  <span>(Quốc gia sản xuất)</span></label>
                                  <Form.Item name="countryOrigin" className={s.inputRow}>
                                    <Input placeholder='Xuất xứ' className={s.input}  />
                                </Form.Item>
                        </div>
                        <div className="flex my-3">
                                  <label className={s.labelRow}>Hạn sử dụng
                                  <span>(Áp dụng cho hàng thực phẩm)</span></label>
                                  <Form.Item name="expiryDate" className={s.inputRow}>
                                    <ConfigProvider locale={locale}>
                                       <DatePicker defaultValue={moment(expiryDate)} onChange={onExpiryDateChange} />
                                    </ConfigProvider>
                                </Form.Item>
                        </div>
                      </div>
                </TabPane>
      
              </Tabs>
            </div>

        </div>
  
     </Form> }
     </>
  )
}

export default ShopProductForm
