import Head from 'next/head'
import { Layout } from '@components/common'
import {  BlogHome } from '@components/pages'
import { useRouter } from 'next/router'
export default function Blog() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout>
      <Head>
        <title>Blog</title>
      </Head>
     <BlogHome />
    </Layout>
  )
}
