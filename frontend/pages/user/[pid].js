import { Layout, UserSidebar} from '@components/common'
import { Mobile, ProductForm, React, Hire, About, Demo } from '@components/pages'
import { useRouter } from 'next/router'
export default function Page() {
    const router = useRouter()
    const { pid } = router.query
  return (
    <Layout pid={pid}>
       <main className="mt-28">
       <div className="mx-auto max-w-7xl">
        <div className="md:grid md:grid-cols-12">
          <div className="mt-5 md:col-span-2">
          <UserSidebar />
          </div>
          <div className="mt-5 md:col-span-10 ml-10">
                {pid === 'shop_products' &&  <Mobile /> }
                {pid === 'shop_product_create' &&  <ProductForm /> }
                {pid === 'profile' &&  <React /> }
                {pid === 'forgot-password' &&  <Hire /> }
                {pid === 'change-password' &&  <About /> }
                {pid === 'products' &&  <Demo /> }

          </div>
          </div>
          </div>
      </main>
    </Layout>
  )
}