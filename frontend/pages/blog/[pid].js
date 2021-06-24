import Head from 'next/head'
import { Layout } from '@components/common'
import { BlogDetail } from '@components/pages'
import { useRouter } from 'next/router'
export default function Blog() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout>
      <Head>
        <title>Blog</title>
      </Head>
      {pid ? <BlogDetail pid={pid} /> : <div />   }
    </Layout>
  )
}
