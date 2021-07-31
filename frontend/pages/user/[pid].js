import { Layout, UserSidebar} from '@components/common'
import { 
  Orders, AddressBook, 
  ShopProductForm, ShopProducts, ShopOrders, ShopSettings,
  Profile, ChangePassword, OrderDetail, ShopOrderDetail
} from '@components/pages'
import { Error } from '@components/pages'
import { useAuth } from '@context/AuthContext'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

export default function Page() {
    const router = useRouter()
    const { accessToken } = useAuth();
    const { pid } = router.query

  return (
     <Layout pid={pid}>
         { accessToken !== '' &&
       <div className="mt-28">
       <NextSeo title="Quản lý tài khoản" description="" />
       <div className="mx-auto max-w-7xl">
        <div className="md:grid md:grid-cols-12">
          <div className="mt-5 md:col-span-2">
          <UserSidebar pid={pid}/>
          </div>
          <div className="mt-5 md:col-span-10 ml-10">
                {pid === 'orders' &&  <Orders /> }
                {pid === 'order-detail' &&  <OrderDetail /> }
                
                {pid === 'address-book' &&  <AddressBook /> }

                {pid === 'shop-products' &&  <ShopProducts /> }

                {pid === 'shop-product-form' &&  <ShopProductForm /> }
                
                {pid === 'shop-orders' &&  <ShopOrders /> }
                {pid === 'shop-order-detail' && <ShopOrderDetail /> }
                {pid === 'shop-settings' &&  <ShopSettings /> }

                {pid === 'profile' &&  <Profile /> }
                {pid === 'change-password' &&  <ChangePassword /> }
           

          </div>
          </div>
          </div>
      </div>
         }
         { accessToken === '' && <Error /> }
    </Layout>
 
  )
}