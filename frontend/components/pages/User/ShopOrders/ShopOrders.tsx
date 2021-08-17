import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import s from './ShopOrders.module.css'
import { Table, Button  } from 'antd'
const { Column } = Table
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
import {getName} from '@config/category'
import moment from 'moment'
import { getProductUrl, currencyFormat } from '@lib/product'
import { renderPaymentLabel, renderStatusLabel} from '@lib/orders'

const PAGE_SIZE = 30
const ShopOrders: FC = () => {
  const { user, accessToken } = useAuth();
  const [current, setCurrent]= useState<number>(1)
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [ selectedRowKeys, setSelectedRowKeys] = useState([])
  const [orders, setOrders] = useState([])
  const [ loading, setLoading] = useState(false)
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    pullOrders()
  }, [])


const pullOrders = async (currentPage = 1)=>{
    let { data: { orders, count} } = await axios.get('/shop/orders',
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

const handleTableChange = (pagination: any, filters: any, sorter: any) => {
  setLoading(true)
  pullOrders(pagination.current)
  setLoading(false);
};

const onSelectChange = (selectedRowKeys: any) => {
  setSelectedRowKeys(selectedRowKeys)
};
const rowSelection = {
  selectedRowKeys,
  onChange: onSelectChange,
};
return (
        <div className="order-page">
            <div className={s.ordersBox}>
              <h1 className={s.pageTitle}>Đơn hàng của shop</h1>
            <div>

            <Table 
                dataSource={orders}  
                rowSelection={rowSelection}
                pagination={{total: ordersTotal, current, pageSize: PAGE_SIZE}}
                loading={loading}
                onChange={handleTableChange}  >
                    <Column
                        title="Hình ảnh"
                        key="id"
                        render={(text, order: any) => (
                          <div>
                              <Link href={'/user/shop-product-form?id=' + order.id }>
                                <a><img className="max-h-8" src={order.items[0].thumb} /> </a> 
                                </Link>
                            </div>
                        )}
                      />
                      <Column title="Tình trạng" dataIndex="createdAt" render={(text, order: any) => (
                          <span>{renderStatusLabel(order.status)}</span>
                      )} />
                      <Column title="Tên sản phẩm" dataIndex="name"
                      render={(text, order: any) => (
                        <Link href={'/user/shop-order-detail?id=' + order.id }>
                          <a className={s.productName}>{order.items[0].name}</a>
                        </Link>
                      )} />
              
                      <Column title="Tổng giá" dataIndex="price" render={(text, order: any) => (
                          <span>{currencyFormat(order.grandTotal)}</span>
                      )} />
                      <Column title="Số lượng" dataIndex="quantityTotal"/>
                      <Column title="Ngày đặt" dataIndex="createdAt" render={(text, order: any) => (
                          <span>{moment(order.createdAt).format('H:M D-M-Y')}</span>
                      )} />
                </Table>
                
                
              </div>
            </div>

        </div>
  )
}

export default ShopOrders
