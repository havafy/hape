import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import s from './ProductBox.module.css'
import { ProductItem } from '@components/common'
import product from 'next-seo/lib/jsonld/product'
import IProduct from '@interfaces/product' 
interface Props {
    data: { 
      title: string, 
      data:{ 
        products: IProduct[]
      }
    };
  }
  const ProductBox: FC<Props> = ({data: { title, data:{ products }}}) =>{
    return (
     <> 
     {Array.isArray(products) && products.length > 0 && <div className={s.root}>
          <h3>{title}</h3>
            <div className="grid grid-flow-col grid-cols-6 grid-rows-1 gap-6">
                { products.map((product: IProduct, key) => (
                    <ProductItem product={product} key={key}/>
                ))}
               
            </div>
           </div>}
      </>
    )
  }
  export default ProductBox