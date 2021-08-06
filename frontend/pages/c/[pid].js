import React from 'react'
import { Layout } from '@components/common'
import { CategoryPage } from '@components/pages'
import axios from 'axios'
const isServer = typeof window !== 'object'
const PAGE_SIZE = 30

class Category extends React.Component {

  render () {
    let { products, pid, category, count} = this.props
   return( <Layout>
            <CategoryPage pid={pid} products={products} category={category} count={count}/>
        </Layout>
   )
  }

}
const extractID = (pid) =>{
  if(!pid) return ''
  const urlSlipt = pid.split('.');
  return urlSlipt[urlSlipt.length-1]
}
Category.getInitialProps = async (context) => {
    let count = 0
    let products = []
    let category = {}
    const { pid, page = 1} = context.query
    const categoryID = extractID(pid)
    try {
      let {data} = await axios.get('/pages/category/'+ categoryID,  { 
        params: { pageSize: PAGE_SIZE, current: page ? page : 1 }
      })

        products = data.products

        category = data.category
        count = data.count
    }catch(err){
        console.log('Category:' ,err.message)
    }
    return {products, pid, category, count, page , }
}


export default Category
