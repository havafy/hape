import { FC, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import s from './ProductPage.module.css'
import axios from 'axios'
import { QuantityBox, ProductBox} from '@components/common'
import { Error } from '@components/pages'
import moment from 'moment'
import { useRouter } from 'next/router'
import IProduct from '@interfaces/product'
import { NextSeo, ProductJsonLd } from 'next-seo'
import { allowedTags, trimString,
  currencyFormat, filterChar, strip_tags, getProductUrl,
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
  found: boolean;
  isLoading: boolean;
}
interface ProductInfoProps {
  product: IProduct;
}


const ProductPage: FC<Props> = ({product, related, found, isLoading = true}) => {

  const router = useRouter()
  const { accessToken, updateAction } = useAuth();
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }

  const [ quantity, setQuantity ] = useState(1)

  const name = product ? filterChar(product.name) : ''
  const productID = product ? product.product_id : ''
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
      { (!isLoading && !found ) && <Error />}
      { isLoading &&  <div className={s.boxWrap}><LoadingBox /></div> }
      {  found && product &&       
            <div className={s.boxWrap}>
                    <SEO product={product} />
                  <div className="mb-3">
                  <div className={s.categoryMenu}>
                            {renderCategoryBreadcrumb(product.categoryRaw)}
                            <span className={s.productNameBreadcrumb}>{name}</span>
                        </div>
                    </div>
            <div className={s.productBox}>    
             <div className="md:grid md:grid-cols-12 md:gap-12">
                  <div className="md:col-span-5"> 
                        <div className={s.galleryBox}>
                        <Carousel effect="fade">
                          {
                            product.images.map((url: any, key: number) =>{
                              return <div key={key}> <img src={url} alt={product.name} /></div>
                            })

                          }
                        </Carousel>

                        </div>

                  </div>
                <div className="md:col-span-7">
                      <h1 className={s.pageTitle}>{name}</h1>
                      <div className={s.priceBox}>
                          { product.regular_price ? 
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
      <span className={s.price}>{currencyFormat(product.price)}</span>
      <span className={s.priceOriginal}>{currencyFormat(product.regular_price)}</span>


  </div>
}
const PriceOnly: FC<ProductInfoProps> = ({product}) =>{
  return <div>
      <div className={s.price}>{currencyFormat(product.price)}</div>
      </div>
}
const SEO: FC<{product: any}> = ({product}) => {
 const product_name = trimString(product.name, 65)
 const description = trimString(strip_tags(product.description, ''), 160)
const  url = process.env.NEXT_PUBLIC_SITE_URL + getProductUrl(product)
  return (
      <>
    <NextSeo
              title={product_name}
              description={description}
              openGraph={{
                type: 'website',
                url,
                title: product_name,
                description: description,
              images: [
                {
                  url: product.images[0],
                  width: 1000,
                  height: 1000,
                  alt: product_name,
                }
              ]
            }}
              />
    <ProductJsonLd
      productName={product_name}
      images={product.images}
      description={description}
      sku={product.sku}
      // brand="ACME"
       reviews={[
        /*{
          author: {
            type: 'Person',
            name: 'Jim',
          },
          datePublished: '2017-01-06T03:37:40Z',
          reviewBody:
            'This is my favorite product yet! Thanks Nate for the example products and reviews.',
          name: 'So awesome!!!',
          reviewRating: {
            bestRating: '5',
            ratingValue: '5',
            worstRating: '1',
          },
          publisher: {
            type: 'Organization',
            name: 'Hape',
          },
        },*/
      ]} 
      aggregateRating={{
        ratingValue: '0.0',
        reviewCount: '0',
        bestRating: "0",
        ratingCount: "0"
      }} 
    
      offers={[
        {
          price: product.price,
          priceCurrency: 'VND',
          priceValidUntil: '2021-12-30',
          itemCondition: 'http://schema.org/UsedCondition',
          availability: 'http://schema.org/InStock',
          // url: 'https://www.example.com/executive-anvil',
          seller: {
            name: 'HavaMall',
          },
        }
      ]}
      // mpn="925872"
    />
    </>
  )
}

export default ProductPage
