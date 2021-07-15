import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './CartPage.module.css'
import axios from 'axios'
import { ProductItem } from '@components/common'
import {getName} from '@config/category'
import { Pagination } from 'antd';
import { useRouter } from 'next/router'
import { useAuth } from '@context/AuthContext'
import { getProductUrl, currencyFormat } from '@lib/product'


interface Props {

}

const CartPage: FC<Props> = ({}) => {
  const router = useRouter()
  const { accessToken, action: { event, payload }, updateAction} = useAuth();
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const [ loading, setLoading ] = useState<boolean>(true)
  useEffect(() => {
   pullCart()
  }, [])
  const pullCart = async () =>{
    setLoading(true);
    let {data} = await axios.get('/cart', headerApi)
    updateAction({event: 'CART_ONCHANGE', payload: data})
    setLoading(false)
  }


  return (
    <main className="mt-24">
      <div className={s.root}>

        {event ==='CART_ONCHANGE' && 
            <div> 
            <h1 className={s.pageTitle}>Giỏ hàng</h1>
              { !loading && Array.isArray(payload.carts) && <div>
    
                <div className={s.header}>
                  <div className="md:col-span-7">Sản Phẩm </div>
                  <div className="md:col-span-1">Đơn Giá </div>
                  <div className="md:col-span-2">Số Lượng </div>
                  <div className="md:col-span-1">Tổng</div>
                  <div className="md:col-span-1">Thao Tác</div>
                </div>
                  {payload.carts.map((cart: any, key: string) => {
                      return(
                        <div className={s.cartByShop} key={key}>
                          <div className={s.shopTitle}>{cart.shopID}</div>
                          <div className={s.itemBox}>
                          {cart.items.map((item: any, key: string) => {
                            return(
                              <div className={s.item} key={key}>
                                  <div className="md:col-span-7 flex">
                                    <span>
                                      <img src={item.thumb} className={s.thumb} />
                                    </span>
                                    <span className="itemName">
                                    <Link href={getProductUrl({
                                            name: item.name,
                                            id: item.productID
                                          })}><a>{item.name}</a></Link>
                                    </span>
                                    
                                  </div>
                                  <div className="md:col-span-1">{currencyFormat(item.price)}</div>
                                  <div className="md:col-span-2">{item.quantity}</div>
                                  <div className="md:col-span-1">
                                    <span className={s.itemTotal}>{currencyFormat(item.total)}</span>
                                    </div>
                                  <div className="md:col-span-1">Xoá</div>
                              </div>)
                          })}
                          </div>
                            
                        </div>)
                    })}
  
              </div> }
          </div>}
 
      </div>
    </main>
  )
}


export default CartPage
