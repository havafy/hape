import { FC, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import s from './ProductPage.module.css'
import axios from 'axios'
import { QuantityBox, ProductBox} from '@components/common'

import moment from 'moment'
import { useRouter } from 'next/router'
import IProduct from '@interfaces/product'
import { NextSeo } from 'next-seo'
import { allowedTags, trimString,
  currencyFormat, filterChar, 
  renderCategoryBreadcrumb} from '@lib/product'
import { BiCart } from 'react-icons/bi'
import { message as Message } from 'antd'
import { GiReturnArrow } from 'react-icons/gi'
import cn from 'classnames'
import { FaCertificate, FaShippingFast } from 'react-icons/fa'
import { Carousel, Skeleton } from 'antd' 
import { useAuth } from '@context/AuthContext'
interface Props {
  product: any;
  related: {products: any[]};
}
interface ProductInfoProps {
  product: IProduct;
}


const ProductPage: FC<Props> = ({product, related}) => {
  const name = filterChar(product.name)
  const productID = product.id 
  const router = useRouter()
  const { accessToken, updateAction } = useAuth();
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }

  const [ quantity, setQuantity ] = useState(1)
  // useEffect(() => {
  //   pullProducts()
  // }, [pid, page])

  const addToCart = async (goto: string = '') => {
    try{
      let {data } = await axios.post('/cart' , { 
            productID,
            quantity,
            action: 'addToCart'
              }, headerApi)
      if(data.statusCode === 500){
        Message.error("Đây là sản phẩm trong shop của bạn.");
      }else{
        updateAction({event: 'CART_SUMMARY_UPDATE', payload: data })
        Message.success("Đã thêm sản phẩm")
        if(goto!==''){
          router.push('/checkout')
        }
      }

    }catch(err){
      if(err?.response?.data){
        if(err.response.data.statusCode == 401){
          updateAction({event: 'LOGIN_OPEN', payload: {} })
        }
      }
    }

 
  }
  const buyNow = async () => {
    await addToCart('checkout')
 
  }
  const changeQuantity = useCallback((number: number) => {
      setQuantity(number)
    }, [])  
  return (
    <main className="mt-12 md:mt-20">
      { product.id === undefined && <LoadingBox /> }
      {  product &&       
            <div className={s.boxWrap}>
                 <NextSeo
                    title={trimString(name, 65)}
                    description={trimString(product.description, 160)}
                    />
                  <div className="mb-3">
                  <div className={s.categoryMenu}>
                            {renderCategoryBreadcrumb(product.categoryRaw)}
                            {name} 
                        </div>
                    </div>
            <div className={s.productBox}>    
             <div className="md:grid md:grid-cols-12 md:gap-12">
                  <div className="md:col-span-5"> 
                        <div className={s.galleryBox}>
                        <Carousel effect="fade">
                          {
                            product.images.map((url: any) =>{
                              return <div> <img src={url} alt={product.name} /></div>
                            })

                          }
                        </Carousel>

                        </div>

                  </div>
                <div className="md:col-span-7">
                      <h1 className={s.pageTitle}>{name}</h1>
                      <div className={s.priceBox}>
                          { product.sale_price ? 
                            <PriceDiscountIncl product={product} /> : 
                            <PriceOnly product={product}/>    }
                      </div>
                      <div className={s.addToCartBox}>
                            <div className="my-5">
                              <span className={s.actionLabel}>Số Lượng: </span>
                              <QuantityBox 
                              productID={product.id} defaultQty={1} onChange={changeQuantity} />
                            </div>
                
                            <button 
                            onClick={buyNow}
                            className={s.addNowButton}>Mua Ngay</button>
                            <button onClick={e=>addToCart('')} className={s.addToCartButton}><BiCart />Thêm Giỏ Hàng</button>
                  
                        </div>

                        <PromoBox />

                  </div>

            </div>      
            </div>    
 
            <div className={cn(s.productBox,product.weight ? '': 'hidden')}>  
              <div className={s.contentTitle}>THÔNG TIN CHI TIẾT</div>
              <div className="my-3 mr-10">
                <AttributeList product={product} />
              </div>
            </div>
            <div className={s.productBox}>  
              <div className={s.contentTitle}>Mô Tả Sản phẩm {product.name}</div>
              <div className={cn('my-5 m-auto md:w-3/4', 'content-description')}  
              dangerouslySetInnerHTML={{ __html: allowedTags(product.description) }} />
            </div>
                            
            {Array.isArray(related) && <ProductBox title="Sản phẩm tương tự" products={related} />}
       </div>
  }

 
    </main>
  )
}
const LoadingBox = ()=>{

  return <div className={s.loadingBox}>

    <Skeleton />
  </div>
  }
const AttributeList: FC<ProductInfoProps> = ({product})=>{

  let attributes: {label: string, value: string}[] = []
  if(product.weight){
    attributes.push({
      label: 'Cân nặng',
      value: product.weight + ' gram'
    })
  }
  if(product.length && product.width){
    attributes.push({
      label: 'Kích thước',
      value: product.length + ' x ' + product.width + ' x ' + product.height + ' cm'
    })
  }
  if(product.countryOrigin){
    attributes.push({
      label: 'Xuất xứ',
      value: product.countryOrigin 
    })
  }
  if(product.expiryDate){
    attributes.push({
      label: 'Ngày hết hạn',
      value: moment(product.expiryDate).format('D-M-Y')
    })
  }
  return (
    <div className={s.attributeList}>
      {attributes.map((attr, key)=>{
        return(<div className={s.attributeRow} key={key}>
          <label>{attr.label}</label>
           <div className={s.attributeValue}>{attr.value}</div>
           </div>)
      })}
    
 
       </div>
  )
}
const PromoBox: FC<any> = ()=>{
  return (
    <div className={s.promoBox}>
       <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <GiReturnArrow /> 
            <label>7 ngày miễn phí trả hàng</label>
            </div>
            <div className="md:col-span-1"> <FaCertificate />
            <label>Hàng chính hãng 100%</label>
            </div>
            <div className="md:col-span-1"> 
            <FaShippingFast />
            <label>Miễn phí vận chuyển</label>
            </div>

          </div>
       </div>
  )
}
const PriceDiscountIncl: FC<ProductInfoProps> = ({product}) =>{
  return <div>
      <span className={s.priceOriginal}>{currencyFormat(product.price)}</span>
  <span className={s.price}>{currencyFormat(product.sale_price)}</span>

  </div>
}
const PriceOnly: FC<ProductInfoProps> = ({product}) =>{
  return <div>
      <div className={s.price}>{currencyFormat(product.price)}</div>
      </div>
}
const Sidebar: FC = () => {
  return (
      <div className={s.sidebar}>
      Sidebar
    </div>
  )
}

export default ProductPage
