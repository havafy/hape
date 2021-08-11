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

import { useEffect } from 'react'

export default function Page() {
    const router = useRouter()
    const { accessToken, updateAction} = useAuth()
    const { pid } = router.query
    useEffect(()=>{
      openLogin()
    
    },[pid])
    const openLogin = () =>{
      if(accessToken === undefined || accessToken === ''){
  
          updateAction({event: 'LOGIN_OPEN', payload: {} })   
      }
    }
  return (
     <Layout pid={pid}>
            <NextSeo title="Quản lý tài khoản" description="" />
         { accessToken !== '' &&
       <div className="mt-28">

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
         { accessToken === '' && <main className="mt-18 mb-60 sm:mt-60">
      <div className="mx-auto max-w-7xl text-center">
          <img src="/assets/empty-box.png" width="90px" className="my-10 mx-auto" />
        <h1 className="text-xl text-gray-700">Vui lòng đăng nhập hoặc đăng ký thành viên để try cập trang này.</h1>
          <div>
           <a className="button arrow mt-10 font-semibold" onClick={openLogin}>Đăng nhập</a>

          </div>
      </div>
    </main>}
    </Layout>
 
  )
}