import Head from 'next/head'
import { Layout } from '@components/common'
import { StaticPage, React, About  } from '@components/pages'
import { useRouter } from 'next/router'
export default function Page() {
    const router = useRouter()
    const { pid, keyword } = router.query
   
  return (
    <Layout pid={pid}>
      {pid === 'about-us' ?  <About /> : <StaticPage pid={pid} />}
    </Layout>
  )
}
