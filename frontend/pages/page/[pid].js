import React from 'react'
import { Layout } from '@components/common'
import { About, StaticPage } from '@components/pages'
import axios from 'axios'

class Page extends React.Component {
  render () {
    const { page, slug} = this.props
   return( <Layout>
            {slug === 'about-us' ?  <About /> : <StaticPage page={page} /> }
        </Layout>
   )
  }

}

Page.getInitialProps = async (context) => {
    let page = {}
    // pid is slug of page
    const { pid }  = context.query
    try {
      let { data } = await axios.get('/pages/' + pid)
      page = data.page
    }catch(err){
        console.log('Page:' ,err)
    }
    return { page, slug: pid }
}


export default Page


// const pullPageContent = async ()=>{
//   try{
//     let { data: { page, status } } = await axios.get('/pages/' + pid)
//     if(status === 200){
//       setPageContent(page)
//       return
//     }

//   }catch(err){

//   }
//   setPageContent(null)
// }
// export default function Page() {
//     const router = useRouter()
//     const { pid, keyword } = router.query
   
//   return (
//     <Layout pid={pid}>
//       {pid === 'about-us' ?  <About /> : <StaticPage pid={pid} />}
//     </Layout>
//   )
// }
