import { FC, useState } from 'react'
import Link from 'next/link'
import IProduct from '@interfaces/product' 
import cn from 'classnames'
import s from './ProductItem.module.css'
import { getProductUrl, currencyFormat, filterChar } from '@lib/product'

interface Props {
    product: IProduct;
}
const PriceDiscountIncl: FC<Props> = ({product}) =>{
    return <div>
    <span className={s.price}>{currencyFormat(product.price)}</span>
    <span className={s.priceOriginal}>{currencyFormat(product.regular_price)}</span>
    </div>
}
const PriceOnly: FC<Props> = ({product}) =>{
  return <div>
  <div className={s.price}>{currencyFormat(product.price)}</div>
  </div>
}
const ProductItem: FC<Props> = ({product}) =>{
    const name = filterChar(product.name)
    return (
      <div className={cn(s.root,'product-item')}>
          <div className={s.image}>
            <Link href={getProductUrl(product)}><a>
              <img src={product.images[0]} alt={name} width="200px" />
              </a></Link>
          </div>
          <div className={s.name}>
            <Link href={getProductUrl(product)}><a>{name}</a></Link>
            </div>

           { product.regular_price ? 
           <PriceDiscountIncl product={product} /> : 
           <PriceOnly product={product}/>    }
   
      </div>
    )
  }
  export default ProductItem