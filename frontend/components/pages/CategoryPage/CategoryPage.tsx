import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './CategoryPage.module.css'
import axios from 'axios'
import { ProductItem } from '@components/common'
import { NextSeo } from 'next-seo'
import { Pagination } from 'antd';
import { getCategoryUrl } from '@lib/product'

import { useRouter } from 'next/router'
interface Props {
  pid: string;
  products: any[];
  category: any;
  page: number;
  count: number;
}
const PAGE_SIZE = 30

const CategoryPage: FC<Props> = ({pid, products, category, page, count}) => {
  const router = useRouter()

  const onPageNumberChange = (pageRq: number) => {

    router.push({
          pathname: '/c/'+ pid,
          query: { page: pageRq},
        })
  };

  return (
    <main className="mt-24 category-page">
      <NextSeo title={category.display_name} description="" />
      <div className={s.root}>
      {products.length > 0 && <div className="md:grid md:grid-cols-12 md:gap-6">
        {/* <div className="md:col-span-2">
            <Sidebar />
          </div> */}
          <div className="md:col-span-12"> 
 
            { <h1 className={s.pageTitle}>{category.display_name}</h1> }
              { Array.isArray(products) && <div>
      
                <div className={s.productList}>
                  {products.map((product: any, key) => {

                    return( 
                      <div className="col-span-1" key={key}> 
                      <ProductItem product={product} key={key}/>
                      </div>
                      )
                
                      })}
              </div> 
              <div className="text-center">
              <Pagination current={Number(page)} 
                    onChange={onPageNumberChange} 
                    showSizeChanger={false}
                    pageSize={PAGE_SIZE} total={count} />
                    </div>
              </div> }      
  
        </div>
      </div> }
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
