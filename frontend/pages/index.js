import React from 'react'
import { Layout } from '@components/common'
import { HomeContent } from '@components/pages'
import axios from 'axios'
const isServer = typeof window !== 'object'
class Home extends React.Component {

  render () {
    let { data } = this.props
   return( <Layout>
           <HomeContent data={data}/>
        </Layout>
   )
  }

}
Home.getInitialProps = async (context) => {
    let data = {}
    try {
      let {data: {blocks}} = await axios.get('/pages/home')
      data = blocks

    }catch(err){
        // console.log('Home:' ,err)
    }
    return { data}
}


export default Home
