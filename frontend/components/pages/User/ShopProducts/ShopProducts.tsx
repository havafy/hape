import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'

import s from './ShopProducts.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
import {getName} from '@config/category'
import { getProductUrl, currencyFormat } from '@lib/product'
import { Table, Button  } from 'antd'
const { Column } = Table
const PAGE_SIZE = 30
const ShopProducts: FC = () => {
  const { user, accessToken } = useAuth();
  const [current, setCurrent]= useState<number>(1)
  const [productTotal, setProductTotal] = useState(0)
  const [products, setProducts] = useState([])
  const [ selectedRowKeys, setSelectedRowKeys] = useState([])
  const [ loading, setLoading] = useState(false)
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    pullProducts()
  }, [])

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setLoading(true)
    pullProducts(pagination.current)
    setLoading(false);
  };


const pullProducts = async (currentPage = 1)=>{
    let { data: { products, count} } = await axios.get('/products',
     { 
       params:   { current: currentPage, pageSize: PAGE_SIZE } , ...headerApi 
    } )
    products = products.map((product: any) => {
      return{
        key: product.id,
        ...product
      }
    })

    setProductTotal(count)
    setCurrent(currentPage)
    setProducts(products)
}
const deleteProducts = async () => {
  setLoading(true)
  // ajax request after empty completing
  for (const productID of selectedRowKeys){
     await axios.delete('/products/' + productID, headerApi)
  }
  setSelectedRowKeys([])
  await pullProducts()
  setLoading(false)
}

const onSelectChange = (selectedRowKeys: any) => {

  setSelectedRowKeys(selectedRowKeys)
};
const rowSelection = {
  selectedRowKeys,
  onChange: onSelectChange,
};
const hasSelected = selectedRowKeys.length > 0;
return (
        <div className="">

            <div className={s.formBox}>
            <div>
              <h1 className={s.h1}>Danh sách sản phẩm</h1>
              <div className="mb-3 grid grid-cols-2">
                  <div className="col-span-1">
                    <Button type="primary" onClick={deleteProducts} disabled={!hasSelected} loading={loading}>
                      <RiDeleteBin6Line />
                    </Button>
                    <span className="ml-3 text-sm text-gray-500"> {hasSelected ? `Chọn ${selectedRowKeys.length} sản phẩm` : ''}
                    </span>
                  </div>
                    <div className="col-span-1 text-right">
                      <Link href="/user/shop-product-form"><a>
                      <Button type="primary" className="addButton"><RiAddFill className={s.addButtonSvg} /> Thêm</Button>
                        </a></Link>
                    </div>
                  </div>
          
                <Table 
                dataSource={products}  
                rowSelection={rowSelection}
                pagination={{total: productTotal, current, pageSize: PAGE_SIZE}}
                loading={loading}
                onChange={handleTableChange}  >
                    <Column
                        title="Hình ảnh"
                        key="id"
                        render={(text, record: any) => (
                          <div>
                             
                             { record.images[0] && 
                              <Link href={'/user/shop-product-form?id=' + record.id }>
                                <a><img className="max-h-8" src={record.images[0]} /> </a> 
                                </Link>}
 
                           
                            </div>
                        )}
                      />
                      <Column title="Tên sản phẩm" dataIndex="name"
                      render={(text, record: any) => (
                        <Link href={'/user/shop-product-form?id=' + record.id }>
                          <a className={s.productName}>{text}</a>
                        </Link>
                      )} />
                      <Column title="SKU" dataIndex="sku" render={(text, record: any) => (
                        <Link href={'/user/shop-product-form?id=' + record.id }>
                        <span>{text}</span>
                        </Link>
                      )} />
                      <Column title="Giá" dataIndex="price" render={(text, record: any) => (
                          <span>{currencyFormat(text)}</span>
                      )} />
                      <Column title="Số lượng" dataIndex="quantity"/>
                      <Column title="Danh mục" dataIndex="category" render={(text, record: any) => (
                          <span>{getName(text)}</span>
                      )} />
                </Table>
              </div>
            </div>

        </div>
  )
}

export default ShopProducts
