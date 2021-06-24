import Head from 'next/head'
import { Layout } from '@components/common'
import { Mobile, Magento, React, Hire, About, Demo } from '@components/pages'
import { useRouter } from 'next/router'
export default function Page() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout pid={pid}>
      <Head>
        <title>Page</title>
      </Head>
      {pid === 'Mobile-Application-Development-Services' &&  <Mobile /> }
      {pid === 'Magento-Development-Services' &&  <Magento /> }
      {pid === 'ReactJs-Development-Services' &&  <React /> }
      {pid === 'Hire-Magento-ReactJs-Developers' &&  <Hire /> }
      {pid === 'about-us' &&  <About /> }
      {pid === 'demo' &&  <Demo /> }
      
    </Layout>
  )
}
