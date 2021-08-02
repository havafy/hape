import React from 'react'
import { Layout } from '@components/common'
import { ProductPage } from '@components/pages'
import axios from 'axios'
import { getProductUrl} from '@lib/product'
const isServer = typeof window !== 'object'
import Router from 'next/router'

class Product extends React.Component {

  render () {
    let { product, pid} = this.props
    if(!isServer && product){
      const pathUrl = getProductUrl(product)
      if( pathUrl !== '/l/' + pid){
        Router.replace(pathUrl)
      }

    }
   return( <Layout>
            <ProductPage {...this.props}/>
        </Layout>
   )
  }

}
Product.getInitialProps = async (context) => {
  try {
    const { pid } = context.query

    return{
      ...await pullProduct(extractID(pid)),
      pid
    }
  }catch(err){
    console.log(err)
  }
}
const extractID = (pid) =>{
  if(!pid) return ''
  const urlSlipt = pid.split('.');
  return urlSlipt[urlSlipt.length-1]
}
const pullProduct = async (productID) =>{
    let { data } = await axios.get('/pages/product/'+ productID)
    return data

}
export default  Product
