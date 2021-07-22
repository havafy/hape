import { FC, useEffect, useState, useCallback} from 'react'
import Link from 'next/link'
import s from './CartPage.module.css'
import axios from 'axios'
import { useRouter } from 'next/router'
import { QuantityBox } from '@components/common'
import {RiDeleteBin7Line} from 'react-icons/ri'
import {AiOutlineShop} from 'react-icons/ai'

import { useAuth } from '@context/AuthContext'
import { getProductUrl, currencyFormat } from '@lib/product'
import cart from 'pages/cart'


interface Props {

}

const CartPage: FC<Props> = ({}) => {
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
  const changeQuantity = useCallback(async (quantity: number, productID) => {
    await pushCart(productID, quantity)

  }, [])  
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
  const removeItem = async (productID: string) =>{
    await pushCart(productID, 0)
  }
  return (
    <main className="mt-24">
      <div className={s.root}>

            <div> 
            <h1 className={s.pageTitle}>Giỏ hàng</h1>
              { cartGroup.grandTotal > 0 ? <div>
    
                <div className={s.header}>
                  <div className="md:col-span-7">Sản Phẩm </div>
                  <div className="md:col-span-1">Đơn Giá </div>
                  <div className="md:col-span-2 text-center">Số Lượng </div>
                  <div className="md:col-span-1">Tổng</div>
                  <div className="md:col-span-1 text-right">Thao Tác</div>
                </div>
                  {cartGroup?.carts?.map((cart: any, index: number) => {
                      return(
                        <div className={s.cartByShop} key={index}>
                          <div className={s.shopTitle}>
                           {cart.shop && <Link href={'/shop/'+cart.shop.shopName}>
                              <a><AiOutlineShop />{cart.shop.shopName}</a>
                              </Link> }
                              </div>
                          <div className={s.itemBox}>
                          {cart.items.map((item: any, key: string) => {
                            return(
                              <div className={s.item} key={key}>
                                  <div className="md:col-span-7 flex">
                                    <span className="mr-5">
                                    <Link href={getProductUrl({
                                            name: item.name,
                                            id: item.productID
                                          })}><a>
                                            <img src={item.thumb} className={s.thumb} />
                                            </a></Link>
                                    </span>
                                    <div className={s.nameWrap}>
                                      <span className={s.itemName}>
                                      <Link href={getProductUrl({
                                              name: item.name,
                                              id: item.productID
                                            })}><a>{item.name}</a></Link>
                                      </span>
                                    </div>
                                    
                                  </div>
                                  <div className="md:col-span-1">{currencyFormat(item.price)}</div>
                                  <div className="md:col-span-2 text-center">
                                    <QuantityBox 
                                    defaultQty={item.quantity} 
                                    productID={item.productID} onChange={changeQuantity} />
                                   </div>
                                  <div className="md:col-span-1">
                                    <span className={s.itemTotal}>{currencyFormat(item.total)}</span>
                                    </div>
                                  <div className="md:col-span-1 text-right">
                                    
                                    <span className={s.removeButton}
                                      onClick={e=>removeItem(item.productID)}
                                    ><RiDeleteBin7Line /></span>
                                  </div>
                              </div>)
                          })}
                          </div>
      
                          <div className={s.cartFooter}>
                            <span className="self-center">
                              Tổng số tiền ({cart.quantityTotal} sản phẩm):
                              </span>
                            <span className={s.grandTotalCart}>{currencyFormat(cart.grandTotal)}</span>
                          </div>
                            
                        </div>)
                    })}
          <div className={s.footer}>
                  <div className="md:col-span-7"></div>
                  <div className="md:col-span-3 text-right">Tổng thanh toán 
                  <span className={s.grandTotal}>{currencyFormat(cartGroup.grandTotal)}</span>
                  </div>
                  <div className="md:col-span-2 text-right">
               <Link href="/checkout"><a>
                 <button className={s.button}>
                      Mua Hàng
                    </button></a></Link>  
                  </div>
                </div>
              </div> : 
               <CartIsEmpty />
              }


 
          </div>
 
      </div>
    </main>
  )
}
const CartIsEmpty = () =>{

  return (<div>Giỏ hàng của bạn chưa có sản phẩm nào!</div>)
}


export default CartPage
