import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './CategoryPage.module.css'
import axios from 'axios'
import { ProductItem } from '@components/common'
import {getName} from '@config/category'
import { Pagination } from 'antd';
import { useRouter } from 'next/router'
interface Props {
  pid: string;
}
const PAGE_SIZE = 30
const CategoryPage: FC<Props> = ({pid}) => {
  const router = useRouter()
  let { page } = router.query
  const [ total, setTotal ] = useState(1)
  const [ products, setProducts ] = useState([])
  const [ loading, setLoading ] = useState<boolean>(true)
  useEffect(() => {
    pullProducts()
  }, [pid, page])
  const pullProducts = async () =>{
    setLoading(true);
    (async () => {
        let {data: {products, count}} = await axios.get('/pages/category/'+ pid,  { 
          params: { pageSize: PAGE_SIZE, current: page ? page : 1 }
        })
        setProducts(products)
        setTotal(count)
        setLoading(false)
    })()
  }
  const onPageNumberChange = (pageRq: number) => {

    router.push({
          pathname: '/c/'+ pid,
          query: { page: pageRq},
        })
  };

  return (
    <main className="mt-24">
      <div className={s.root}>
      <div className="md:grid md:grid-cols-12 md:gap-6">
        {/* <div className="md:col-span-2">
            <Sidebar />
          </div> */}
          <div className="md:col-span-12"> 
          <h1 className={s.pageTitle}>{getName(pid)}</h1>
            { !loading && Array.isArray(products) && <div>
     
              <div className={s.productList}>
                {products.map((product: any, key) => {

                  return( 
                    <ProductItem product={product} key={key}/>
                    )
              
                    })}
            </div> 
            <div className="text-center">
            <Pagination current={Number(page)} 
                  onChange={onPageNumberChange} 
                  pageSize={PAGE_SIZE} total={total} />
                  </div>
            </div> }
        </div>
      </div>
      </div>
    </main>
  )
}

const Sidebar: FC = () => {
  return (
  <div className={s.sidebar}>
  Sidebar
</div>
)
  }

export default CategoryPage
