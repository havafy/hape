import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import s from './Orders.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
import {getName} from '@config/category'
import {AiOutlineShop} from 'react-icons/ai'
import { getProductUrl, currencyFormat } from '@lib/product'
import { renderPaymentLabel, renderStatusLabel} from '@lib/orders'

const PAGE_SIZE = 30
const Orders: FC = () => {
  const { user, accessToken } = useAuth();
  const [current, setCurrent]= useState<number>(1)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [orders, setOrders] = useState([])
  const [ loading, setLoading] = useState(false)
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    pullOrders()
  }, [])


const pullOrders = async (currentPage = 1)=>{
    let { data: { orders, count} } = await axios.get('/orders',
     { 
       params:   { current: currentPage, pageSize: PAGE_SIZE } , ...headerApi 
    } )
    orders = orders.map((order: any) => {
      return{
        key: order.id,
        ...order
      }
    })

    setOrdersTotal(count)
    setCurrent(currentPage)
    setOrders(orders)
}

return (
        <div className="order-page">
            <div className={s.formBox}>
            <div>
                {orders.map((order:any)=> {
                  return (<div className={s.orderBox}>
                        <div className="mb-3 grid grid-cols-12">
                          <div className="col-span-6">
                          <div className={s.shopTitle}>
                           {order.shop && <Link href={'/shop/'+order.shop.shopName}>
                              <a><AiOutlineShop />{order.shop.shopName}</a>
                              </Link> }
                              </div>
                          </div>
                            <div className="col-span-3 ">
                              <span className={s.orderNumber}>Mã đơn hàng: {order.orderNumber}</span>
                              </div>
                              <div className="col-span-3 text-right">
                              {order.status &&  <> {renderStatusLabel(order.status)} </> }
                                {order.paymentStatus && 
                                <> {renderPaymentLabel(order.paymentStatus)} </> }
                            </div>
                        </div>
                     
                        {order.items && order.items.map((item:any)=> { 
                          return(<div className={s.orderItem}>
                              <div className="col-span-2">
                              <Link href={'/user/order-detail?id=' + order.id }>
                                <a><img className="h-28" src={item.thumb} /> </a> 
                                </Link>
                              </div>
                                <div className="col-span-8">
                                <Link href={'/user/order-detail?id=' + order.id }><a>
                                  <div>{item.name}</div>
                                  <div>x{item.quantity}</div>
                                  </a> 
                                </Link>
                                </div>
                                <div className="col-span-2 text-right">
                                  {currencyFormat(item.price)}
                                </div>
                            </div>)
                        })}
                  <div className={s.orderFooter}>
                  <div className="col-span-6">
                    </div>
                  <div className="col-span-6"> 
                        <div className={s.grandTotalWrap}>
                        <span>Tổng đơn hàng:</span>
                          <span className={s.grandTotal}>
                            {currencyFormat(order.grandTotal)}
                            </span>
                         </div> 
                    </div>
                    </div>
                  </div>)
                })}  
                
              </div>
            </div>

        </div>
  )
}

export default Orders
