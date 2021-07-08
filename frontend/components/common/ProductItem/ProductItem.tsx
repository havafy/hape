import { FC, useState } from 'react'
import Link from 'next/link'
import IProduct from '@interfaces/product' 
import s from './ProductItem.module.css'

interface Props {
    product: IProduct;
}
const ProductItem: FC<Props> = ({product}) =>{
    return (
      <div className={s.root}>
          <div className={s.productName}>{product.name}</div>
22222
      </div>
    )
  }
  export default ProductItem