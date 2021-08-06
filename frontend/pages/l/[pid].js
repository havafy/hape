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
    const { product, found, related } = await pullProduct(extractID(pid))

    if(found){
      const pathUrl = getProductUrl(product)
      // redirect to right url
      if(pathUrl !== '/l/' + pid){
          if (context.res) { // server
            context.res.writeHead(302, {  Location: encodeURI(pathUrl) })
            context.res.end();
          } else { // client
            Router.push(pathUrl);
          }
      }
    }
    return {
      product, related, pid, found, isLoading: false
    }
 
  }catch(err){
    console.log('Product: ', err.message)
  }
  return{
    pid,
    product: null,
    found: false, isLoading: false
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
