import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import s from './ProductBox.module.css'
import { ProductItem } from '@components/common'
import product from 'next-seo/lib/jsonld/product'
import IProduct from '@interfaces/product' 
interface Props {
    products: IProduct[];
    title: string;
  }
  const ProductBox: FC<Props> = ({products, title}) =>{
    return (
      <div className={s.root}>
          <h3>{title}</h3>
            <div className="grid grid-flow-col grid-cols-3 grid-rows-6 gap-6">
                {products.map((product: IProduct) => (
                    <ProductItem product={product} />
                ))}
               
            </div>
           </div>
    )
  }
  export default ProductBox