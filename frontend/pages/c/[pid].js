import Head from 'next/head'
import { Layout } from '@components/common'
import { useRouter } from 'next/router'
import { CategoryPage } from '@components/pages'

export default function Category() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout>
        <CategoryPage pid={pid}/>
    </Layout>
  )
}
