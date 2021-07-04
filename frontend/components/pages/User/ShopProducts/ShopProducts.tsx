import React, { FC, useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Table, Button  } from 'antd'
import s from './ShopProducts.module.css'
import { RiDeleteBin6Line, RiAddFill } from 'react-icons/ri'
import { useAuth } from '@context/AuthContext'
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];
const data = [];
for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  });
}
class ProductTable extends React.Component {
  state = {
    selectedRowKeys: [], // Check here to configure the default column
    loading: false,
  };

  start = () => {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  };

  onSelectChange = (selectedRowKeys: any) => {
    console.log('selectedRowKeys changed: ', selectedRowKeys);
    this.setState({ selectedRowKeys });
  };

  render() {
    const { loading, selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div>
       <div className="mb-3 grid grid-cols-2">
          <div className="col-span-1">
            <Button type="primary" onClick={this.start} disabled={!hasSelected} loading={loading}>
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

        <Table rowSelection={rowSelection} columns={columns} dataSource={data} />
      </div>
    );
  }
}
const ShopProducts: FC = () => {
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    (async () => {
      const { data: { products} } = await axios.get('/products', { 
        headers: { 'Authorization': `Bearer ${accessToken}` } 
      })
      console.log(products)

      setProducts(products)
    })()
  
  }, [])
  const onFinish = async (values: any) => {
    setIsLoading(true)
    const { data: { status, error } } = await axios.post('products', {
            ...values, 

        })
    setIsLoading(false)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (

        <div className="">
          <h1 className={s.h1}>Danh sách sản phẩm</h1>
            <div className={s.formBox}>
            <ProductTable />
            </div>

        </div>
  )
}

export default ShopProducts
