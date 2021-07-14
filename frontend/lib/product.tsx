import { FC, useState } from 'react'
import IProduct from '@interfaces/product' 
export const getProductUrl = (product: IProduct) =>{
    let url = '/product/' + product.name.replace(/\s/g, '-') + '--' + product.id
    return url
  }
 export const currencyFormat = (number: number) => {
    return (
        <span>
    <span>₫</span>
    {Number(number).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
    </span>)
}