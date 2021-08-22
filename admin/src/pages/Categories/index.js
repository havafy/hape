import React, { useEffect, useState } from 'react';
import s from './categories.module.css';
import axios from 'axios'
import Layout from '../../components/Layout'
import { useAuthState } from '../../context';

import { Table  } from 'antd'

const { Column } = Table

const PAGE_SIZE = 30
function Categories(props) {
	const [current, setCurrent]= useState<number>(1)
	const [categoriesTotal, setCategoriesTotal] = useState(0)
	const [ selectedRowKeys, setSelectedRowKeys] = useState([])
	const [categories, setCategories] = useState([])
	const [ loading, setLoading] = useState(false)
	const userDetails = useAuthState();
	const headerApi = { 
	  headers: { 'Authorization': `Bearer ${userDetails.token}` } 
	}
	useEffect(() => {
		pullCategories()
	})
  
  
  const pullCategories = async (currentPage = 1)=>{
	  let { data: { orders, count} } = await axios.get('/categories',
	   { 
		 params:   { current: currentPage, pageSize: PAGE_SIZE } , ...headerApi 
	  } )
	  orders = orders.map((order) => {
		return{
		  key: order.id,
		  ...order
		}
	  })
  
	  setCategoriesTotal(count)
	  setCurrent(currentPage)
	  setCategories(orders)
  }
  
  const handleTableChange = (pagination, filters, sorter) => {
	setLoading(true)
	pullCategories(pagination.current)
	setLoading(false);
  };
  
  const onSelectChange = (selectedRowKeys) => {
	setSelectedRowKeys(selectedRowKeys)
  };
  const rowSelection = {
	selectedRowKeys,
	onChange: onSelectChange,
  };
	return (
		<Layout {...props}>
<div className="categories-page">
            <div className={s.categoriesBox}>
              <h1 className={s.pageTitle}>Đơn hàng của shop</h1>
            <div>

            <Table 
                dataSource={categories}  
                rowSelection={rowSelection}
                pagination={{total: categoriesTotal, current, pageSize: PAGE_SIZE}}
                loading={loading}
                onChange={handleTableChange}  >

                      <Column title="Tên danh mục" dataIndex="name"
                      render={(text, category) => (
						<>{category.name}</>
                      )} />
              
        
                </Table>
                
                
              </div>
            </div>

        </div>
		</Layout>
	);
}

export default Categories;
