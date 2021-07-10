import Head from 'next/head'
import { Layout } from '@components/common'
import { ProductPage } from '@components/pages'
import { useRouter } from 'next/router'
export default function Category() {
  const router = useRouter()
  const { pid } = router.query
  return (
    <Layout>
        <ProductPage pid={pid}/>
    </Layout>
  )
}
