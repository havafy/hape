import { Layout } from '@components/common'
import { Mobile, Magento, React, Hire, About, Demo } from '@components/pages'
import { useRouter } from 'next/router'
export default function Page() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout pid={pid}>
      {pid === 'register' &&  <Mobile /> }
      {pid === 'login' &&  <Magento /> }
      {pid === 'profile' &&  <React /> }
      {pid === 'forgot-password' &&  <Hire /> }
      {pid === 'change-password' &&  <About /> }
      {pid === 'products' &&  <Demo /> }
      
    </Layout>
  )
}
