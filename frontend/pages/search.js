import React from 'react'
import { Layout } from '@components/common'
import { SearchPage } from '@components/pages'
import axios from 'axios'
const isServer = typeof window !== 'object'

class Search extends React.Component {

  render () {
    let { products, keyword, count} = this.props
   return( <Layout>
            <SearchPage products={products} keyword={keyword} count={count}/>
        </Layout>
   )
  }

}
Search.getInitialProps = async (context) => {
  try {
    const { keyword } = context.query
    const { products, count } = await pullProduct(keyword)

    return{
        products, count, keyword
    }
  }catch(err){
    console.log('Search:' ,err)
  }
}

const pullProduct = async (keyword) =>{
    let {data: { products, count}} = await axios.get('/search?keyword='+ keyword)
    return { products, count }

}
export default Search
