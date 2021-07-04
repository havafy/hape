import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Table, Button  } from 'antd'
import s from './ShopProducts.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
const { Column } = Table
const ShopProducts: FC = () => {
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    (async () => {
      let { data: { products} } = await axios.get('/products', { 
        headers: { 'Authorization': `Bearer ${accessToken}` } 
      })
      products = products.map((product: any) => {
        return{
          key: product.id,
          ...product
        }
      })
      setProducts(products)
    })()
  
  }, [])

 const [ selectedRowKeys, setSelectedRowKeys] = useState([])
 const [ loading, setLoading] = useState(false)

const start = () => {
  setLoading(true)
  // ajax request after empty completing
  setTimeout(() => {
    setSelectedRowKeys([])
    setLoading(false)
  }, 1000);
}

const onSelectChange = (selectedRowKeys: any) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  setSelectedRowKeys(selectedRowKeys)
};
const rowSelection = {
  selectedRowKeys,
  onChange: onSelectChange,
};
const hasSelected = selectedRowKeys.length > 0;
return (
        <div className="">
          <h1 className={s.h1}>Danh sách sản phẩm</h1>
            <div className={s.formBox}>
            <div>
              <div className="mb-3 grid grid-cols-2">
                  <div className="col-span-1">
                    <Button type="primary" onClick={start} disabled={!hasSelected} loading={loading}>
                      <RiDeleteBin6Line />
                    </Button>
                    <span className="ml-3 text-sm text-gray-500"> {hasSelected ? `Chọn ${selectedRowKeys.length} sản phẩm` : ''}
                    </span>
                  </div>
                    <div className="col-span-1 text-right">
                      <Link href="/user/shop-product-create"><a>
                      <Button type="primary"><RiAddFill /></Button>
                        </a></Link>
                    </div>
                  </div>
          
                <Table dataSource={products}  rowSelection={rowSelection}>
                    <Column
                        title="Hình ảnh"
                        key="id"
                        render={(text, record: any) => (
                          <div>
                              { record.images[0] && <img className="max-h-8" src={record.images[0]} />}
                            </div>
                        )}
                      />
                      <Column title="Tên sản phẩm" dataIndex="name"
                      render={(text, record: any) => (
                        <Link href={'/user/shop-product-update?id=' + record.id }>
                          <a>{text}</a>
                        </Link>
                      )} />
                      <Column title="SKU" dataIndex="sku" render={(text, record: any) => (
                        <Link href={'/user/shop-product-update?id=' + record.id }>
                          <a>{text}</a>
                        </Link>
                      )} />
                      <Column title="Giá" dataIndex="price" render={(text, record: any) => (
                          <span>{text}₫</span>
                      )} />
                      <Column title="Số lượng" dataIndex="quantity"/>
                      <Column title="Danh mục" dataIndex="name"/>
                </Table>
              </div>
            </div>

        </div>
  )
}

export default ShopProducts
