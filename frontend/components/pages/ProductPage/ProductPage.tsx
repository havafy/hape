import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './ProductPage.module.css'
import axios from 'axios'
import { ProductItem } from '@components/common'
import {getName} from '@config/category'
import moment from 'moment'
import { useRouter } from 'next/router'
import IProduct from '@interfaces/product'
import { getProductUrl, currencyFormat } from '@lib/product'
import { BiCart } from 'react-icons/bi'
import { IoIosArrowForward } from 'react-icons/io'
import { GiReturnArrow } from 'react-icons/gi'
import { FaCertificate, FaShippingFast } from 'react-icons/fa'
import { Carousel } from 'antd'
interface Props {
  pid: string;
}
interface ProductInfoProps {
  product: IProduct;
}
const extractID = (pid: string) =>{
  if(!pid) return ''
  const urlSlipt = pid.split('--');
  return urlSlipt[urlSlipt.length-1]
}
const PAGE_SIZE = 30
const ProductPage: FC<Props> = ({pid}) => {
  const productID = extractID(pid)
  const router = useRouter()
  let { page } = router.query
  const [ total, setTotal ] = useState(1)
  const [ quantity, setQuantity ] = useState(1)
  const [ product, setProduct ] = useState<IProduct | null>(null)
  const [ loading, setLoading ] = useState<boolean>(true)
  useEffect(() => {
    pullProducts()
  }, [pid, page])
  const pullProducts = async () =>{
    setLoading(true);
    (async () => {
        let {data: {product, count}} = await axios.get('/pages/product/'+ productID,  { 
          params: { pageSize: PAGE_SIZE, current: page ? page : 1 }
        })
        setProduct(product)
        setTotal(count)
        setLoading(false)
    })()
  }

  return (
    <main className="mt-24">
      { !loading &&   product &&       
            <div className={s.boxWrap}>
                  <div className="mb-3">
                  <div className={s.categoryMenu}>
                          <Link href={'/category/'+ product.category}>
                            <a>{getName(product.category)}</a>
                            </Link> 
                            <IoIosArrowForward />
                            {product.name} 
                        </div>
                    </div>
            <div className={s.productBox}>    
             <div className="md:grid md:grid-cols-12 md:gap-12">
                  <div className="md:col-span-5"> 
                        <div className={s.galleryBox}>
                        <Carousel effect="fade">
                          {
                            product.images.map((url) =>{
                              return <div> <img src={url} alt={product.name} /></div>
                            })

                          }
                        </Carousel>

                        </div>

                  </div>
                <div className="md:col-span-7">
                      <h1 className={s.pageTitle}>{product?.name}</h1>
                      <div className={s.priceBox}>
                          { product.priceDiscount ? 
                            <PriceDiscountIncl product={product} /> : 
                            <PriceOnly product={product}/>    }
                      </div>
                      <div className={s.addToCartBox}>
                            <div className="my-5">
                              <span className={s.actionLabel}>Số Lượng: </span>
                              <input 
                                value={quantity} type="text"
                                onChange={(e:any)=> setQuantity(e.target.value)} />
                            </div>
                
                            <button className={s.addNowButton}>Mua Ngay</button>
                            <button className={s.addToCartButton}><BiCart />Thêm Giỏ Hàng</button>
                  
                        </div>

                        <PromoBox />

                  </div>

            </div>      
            </div>    
 
            <div className={s.productBox}>  
              <div className={s.contentTitle}>THÔNG TIN CHI TIẾT</div>
              <div className="my-5 mr-10">
                <AttributeList product={product} />
              </div>
            </div>
            <div className={s.productBox}>  
              <div className={s.contentTitle}>Mô Tả Sản phẩm</div>
              <div className="my-5 mr-10">{product.description}</div>
            </div>
  
       </div>
  }

 
    </main>
  )
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
  <span className={s.price}>{currencyFormat(product.priceDiscount)}</span>

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
