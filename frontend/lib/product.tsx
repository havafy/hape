import { FC, useState } from 'react'
import IProduct from '@interfaces/product' 
export const getProductUrl = (product: {name: string, id: string}) =>{
    let url = '/l/' + 
    trimString(product.name.replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '').replace(/\s/g, '-').trim(), 40) 
    + '--' + product.id
    return url
  }
 export const currencyFormat = (number: number) => {
    return (
        <span>
    <span>₫</span>
    {Number(number).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
    </span>)
}
export const trimString = function (string: string, length: number) {
    return string.length > length ? 
           string.substring(0, length) :
           string;
  };