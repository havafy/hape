import { FC, useState } from 'react'
import Link from 'next/link'
import IProduct from '@interfaces/product' 
import s from './ProductItem.module.css'
import { getProductUrl, currencyFormat } from '@lib/product'

interface Props {
    product: IProduct;
}
const PriceDiscountIncl: FC<Props> = ({product}) =>{
    return <div>
    <span className={s.price}>{currencyFormat(product.priceDiscount)}</span>
    <span className={s.priceOriginal}>{currencyFormat(product.price)}</span>
    </div>
}
const PriceOnly: FC<Props> = ({product}) =>{
  return <div>
  <div className={s.price}>{currencyFormat(product.price)}</div>
  </div>
}
const ProductItem: FC<Props> = ({product}) =>{
    return (
      <div className={s.root}>
          <div className={s.image}>
            <Link href={getProductUrl(product)}><a>
              <img src={product.images[0]} alt={product.name} width="200px" />
              </a></Link>
          </div>
          <div className={s.name}>
            <Link href={getProductUrl(product)}><a>{product.name}</a></Link>
            </div>

           { product.priceDiscount ? 
           <PriceDiscountIncl product={product} /> : 
           <PriceOnly product={product}/>    }
   
      </div>
    )
  }
  export default ProductItem