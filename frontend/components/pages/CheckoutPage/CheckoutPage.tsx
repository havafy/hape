import { FC, useEffect, useState, useCallback} from 'react'
import Link from 'next/link'
import s from './CheckoutPage.module.css'
import axios from 'axios'
import { useRouter } from 'next/router'
import { QuantityBox } from '@components/common'
import {FaLocationArrow} from 'react-icons/fa'
import {MdArrowBack} from 'react-icons/md'

import { useAuth } from '@context/AuthContext'
import { getProductUrl, currencyFormat } from '@lib/product'
import { Hape } from '@components/icons'


interface Props {

}

const CheckoutPage: FC<Props> = ({}) => {
  const router = useRouter()
  const { accessToken, updateAction} = useAuth();
  const [cartGroup, setCartGroup] = useState<{carts: any[], grandTotal: number}>({
    carts: [],
    grandTotal: 0
  })
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const [ loading, setLoading ] = useState<boolean>(true)
  useEffect(() => {
   pullCart()
  }, [])
  const pullCart = async () =>{
    setLoading(true);
    try{
      let {data} = await axios.get('/cart', headerApi)
      setCartGroup(data)
      setLoading(false)
    }catch(err){

    }


  }
  const pushCart = async (productID:string, quantity: number) =>{
    try{
      let {data} = await axios.post('/cart',{
        productID, quantity, action: 'setQuantity'
      }, headerApi)
      setCartGroup(data)
      updateAction({event: 'CART_SUMMARY_UPDATE', payload: data })
    }catch(err){

    }
  }

  return (
    <>
    <LeanHeader />

    <main className="mt-18">
      <div className={s.root}>

            <div> 
    
              { cartGroup.grandTotal > 0 ? <div>
                <div className={s.addressBox}>
                  <div className={s.addressBoxLabel}>
                  <FaLocationArrow />
                  Địa Chỉ Nhận Hàng</div>
                  <div className="flex">
                    <div className={s.addressSelected}>aaaaa </div>
                    <div className="">Đổi địa chỉ</div>
                  </div>
                </div>
                <div className={s.header}>
                  <div className="md:col-span-8">Sản Phẩm </div>
                  <div className="md:col-span-1">Đơn Giá </div>
                  <div className="md:col-span-2 text-center">Số Lượng </div>
                  <div className="md:col-span-1">Tổng</div>
                </div>
                  {cartGroup?.carts?.map((cart: any, index: number) => {
                      return(
                        <div className={s.cartByShop} key={index}>
                          <div className={s.shopTitle}>{cart.shopID}</div>
                          <div className={s.itemBox}>
                          {cart.items.map((item: any, key: string) => {
                            return(
                              <div className={s.item} key={key}>
                                  <div className="md:col-span-8 flex">
                                    <span className="mr-5">
                                       <img src={item.thumb} className={s.thumb} />
                                    </span>
                                    <div className={s.nameWrap}>
                                      <span className={s.itemName}>
                                      {item.name}
                                      </span>
                                    </div>
                                    
                                  </div>
                                  <div className="md:col-span-1">{currencyFormat(item.price)}</div>
                                  <div className="md:col-span-2 text-center">
                                  {item.quantity}
                                   </div>
                                  <div className="md:col-span-1">
                                    <span className={s.itemTotal}>{currencyFormat(item.total)}</span>
                                    </div>
            
                              </div>)
                          })}
                          </div>
      
                          <div className={s.cartFooter}>
                            <span>
                              Tổng số tiền ({cart.quantityTotal} sản phẩm):
                              </span>
                            <span className={s.grandTotalCart}>{currencyFormat(cart.grandTotal)}</span>
                          </div>
                            
                        </div>)
                    })}
          <div className={s.footer}>
                  <div className="md:col-span-7">
                    Nhấn "Đặt hàng" đồng nghĩa với việc bạn đồng ý tuân theo Điều khoản Hape</div>
                  <div className="md:col-span-3 text-right">Tổng thanh toán 
                  <span className={s.grandTotal}>{currencyFormat(cartGroup.grandTotal)}</span>
                  </div>
                  <div className="md:col-span-2 text-right">
                    <button className={s.button}>
                      Đặt Hàng
                    </button>
                  </div>
                </div>
              </div> : 
               <CartIsEmpty />
              }


 
          </div>
 
      </div>
    </main>

    </>
  )
}
const CartIsEmpty = () =>{

  return (<div>Giỏ hàng của bạn chưa có sản phẩm nào!</div>)
}
const LeanHeader = () =>{
  return(
    <div className={s.leanHeaderWrap}>
    <div className={s.leanHeader}>
       <div className="md:col-span-8 flex">
        <span className={s.gotoCartWrap}>
            <Link href='/cart'><a className={s.gotoCart}><MdArrowBack /> Giỏ hàng</a></Link> 
          </span> 
         <h1 className={s.pageTitle}>Thanh Toán</h1>
      </div>
      <div className="md:col-span-4 text-right">
        <Hape className="inline-block" fill="#DB4140" width="60px" />
      </div>

    </div>
    </div>

  )
}

export default CheckoutPage
