import Head from 'next/head'
import { Layout } from '@components/common'
import { SearchPage } from '@components/pages'
import { useRouter } from 'next/router'

export default function Search() {
    const router = useRouter()
    const { keyword } = router.query
  return (
    <Layout>
        <SearchPage keyword={keyword} />
        
    </Layout>
  )
}
