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
  const [pagination, setPagination ]= useState({current: 1, pageSize: 1})
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
    console.log({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination,
      ...filters,
    });
  };

const pullProducts = async ()=>{
    let { data: { products} } = await axios.get('/products', headerApi)
    products = products.map((product: any) => {
      return{
        key: product.id,
        ...product
      }
    })
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
          <h1 className={s.h1}>Danh sách sản phẩm</h1>
            <div className={s.formBox}>
            <div>
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
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}  >
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
                        <Link href={'/user/shop-product-form?id=' + record.id }>
                          <a className={s.productName}>{text}</a>
                        </Link>
                      )} />
                      <Column title="SKU" dataIndex="sku" render={(text, record: any) => (
                        <Link href={'/user/shop-product-form?id=' + record.id }>
                          <a>{text}</a>
                        </Link>
                      )} />
                      <Column title="Giá" dataIndex="price" render={(text, record: any) => (
                          <span>{text} ₫</span>
                      )} />
                      <Column title="Số lượng" dataIndex="quantity"/>
                      <Column title="Danh mục" dataIndex="category"/>
                </Table>
              </div>
            </div>

        </div>
  )
}

export default ShopProducts
