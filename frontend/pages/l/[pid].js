import React from 'react'
import { Layout } from '@components/common'
import { ProductPage } from '@components/pages'
import axios from 'axios'

class Product extends React.Component {

  render () {
    let { product } = this.props
    console.log('----', product)
   return( <Layout>
            <ProductPage product={product}/>
        </Layout>
   )
  }

}
Product.getInitialProps = async (context) => {
  try {
    const { pid } = context.query
    return{
      product: await pullProduct(extractID(pid))
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
    let {data: {product}} = await axios.get('/pages/product/'+ productID)
    // if(product){
    //   const pathUrl = getProductUrl(product)
    //   if( pathUrl !== '/l/' + pid){
    //     router.push(pathUrl)
    //   }
      
    // }
    return product

}
export default  Product
