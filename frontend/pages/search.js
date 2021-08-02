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
    let count = 0
    let products = []
    const { keyword, page = 1} = context.query
     
  
    try {
        let { data } = await axios.get('/search', { params: { keyword, page} } )
        products = data.products
        count = data.count


    }catch(err){
        console.log('Search:' ,err)
    }
    return {products, count, keyword, page }
}


export default Search
