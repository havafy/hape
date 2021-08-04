import { FC, useState } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import IProduct from '@interfaces/product' 
import Link from 'next/link'
export const getProductUrl = (product: {name: string, product_id: string}) =>{
    let url = '/l/' + 
    trimString(getSlug(product.name), 40) 
    + '.' + product.product_id
    return url
  }
export const getSlug = (str: string) =>{
    return str.trim().replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '')
    .replace(/\s/g, '-').replace('---', '-').replace('--', '-').trim()
}

export const currencyFormat = (number: number) => {
    return (
        <span>
    <span>₫</span>
    {Number(number).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}
    </span>)
}
export const trimString = function (string: string, length: number) {
    string = filterChar(string)
    return string.length > length ? 
           string.substring(0, length) :
           string;
}
export const renderCategoryBreadcrumb = (category: any) =>{
    if(category?.display_name){
    return <>
    {category.parentName.reverse().map((name: string, key: number)=>{
        return <><Link href={getCategoryUrl({display_name: name, id: category.parents[key]})}>
      <a key={key}>{name}</a>
      </Link>     <IoIosArrowForward /> </>})}
      <Link href={getCategoryUrl(category)}><a>{category.display_name}</a></Link> 
      <IoIosArrowForward /> 
      </>
    }
    return <></>
  
} 
export const getCategoryUrl = (category: any) =>{
    if(category?.display_name){
      let name = getSlug(category.display_name)
      
      return '/c/' + name + '.' + category.id
    }
    return ''
  
}
export const filterChar = (text: string) => {
    return text.replace(/&quot;/g, '"').replace(/&amp;/g, '&')
}
export const allowedTags = function (str:string, more = ''){
    let allows = '<div><ul><li><h2><h3><h4><b><i><span><img><p><br><tr><table><td><th>'
    if(more !== '') allows += more
  return strip_tags(str, allows)
}
export const strip_tags =  function (str:string, allow:string){
    // making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
    allow = (((allow || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')

    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi
    return str.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
        return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 :''
    })
}

