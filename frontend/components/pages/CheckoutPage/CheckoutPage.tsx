import { FC, useEffect, useState, useCallback} from 'react'
import Link from 'next/link'
import s from './CheckoutPage.module.css'
import axios from 'axios'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { QuantityBox } from '@components/common'
import { CgSpinner } from 'react-icons/cg'
import {AiOutlineShop} from 'react-icons/ai'

import {FaLocationArrow, FaRegEdit} from 'react-icons/fa'
import { RiAddFill } from 'react-icons/ri'
import {MdArrowBack} from 'react-icons/md'
import { AddressForm } from '@components/common'
import { Radio, Modal, Skeleton } from 'antd';
import { useAuth } from '@context/AuthContext'
import { getProductUrl, currencyFormat } from '@lib/product'
import { Hape } from '@components/icons'
interface Props {

}

const CheckoutPage: FC<Props> = ({}) => {
  const router = useRouter()
  const {accessToken, updateAction} = useAuth();
  const [ visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState<boolean>(false);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);
  const [changeAddress, setChangeAddress] = useState<boolean>(false);
  const [paymentInfo, setPaymentInfo] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [cartGroup, setCartGroup] = useState<{
    carts: any[], shippingTotal: number, subtotal: number,
     grandTotal: number, addresses: any[]}>({
    carts: [],
    grandTotal: 0,
    addresses: [],
    subtotal: 0,
    shippingTotal: 0
  })
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  useEffect(() => {
    initialLoad()
  }, [])
  const pullCart = async (address = '') =>{
    try{
      let {data} = await axios.get('/cart', { 
        ...headerApi,
        params: { collect: 'address,payments,shippings', address}
      })
      setReady(true) // show loading box
      setCartGroup(data)
      if(data.addresses.length ===0){
        setVisible(true)
        setChangeAddress(true)
      }
      if(data.addresses.length ===1){
        setSelectedAddress(data.addresses[0].id)
        setChangeAddress(false)
      }
      
      updateAction({event: 'CART_SUMMARY_UPDATE', payload: data })
      return data
    }catch(err){

    }
    return null
  }
  const initialLoad = async () =>{
    const data = await pullCart()
    if(!data.addresses){
      return
    }
    let found = false
    for (let address of data.addresses) {
        if(address.default){
          setSelectedAddress(address.id)
          found = true
        }
    }
    //IF don't found any default address
    if(!found){
      setSelectedAddress(data.addresses[0].id)
    }
  }
  const pickupAddress = useCallback(async (id:string) => {
      if(id !== '' && id !== 'goBack'){
          setSelectedAddress(id)
          if(id !== '')  await pullCart(id)
        }
        setChangeAddress(false)
        
      }, []) 

  const submitPlaceOrder = async () => {
    try{
      setLoading(true)
      let carts = cartGroup.carts.map((cart: any) => {
        return  {
            shopID: cart.shopID,
            shipping: "BY_SHOP",
            payment: "COD"
          }
      })
      let { data } = await axios.post('/checkout',
                {addressID: selectedAddress, carts}, 
                headerApi)
      await pullCart()
      if(data.statusCode === 200){
        setCreatedOrders(data.orders)
        setPaymentInfo(data.payments)
        window.scrollTo(0, 0)
      }
  
    }catch(err){
      console.log('submitPlaceOrder:', err)
    }
    setLoading(false)
  }

  const modalClose = useCallback(async (res:any) => {
        setVisible(false)
        // if created address, let refresh new data
        if(res?.data?.address.id ){
          await pullCart()
          //set select to new address
          setSelectedAddress(res.data.address.id)
        }
    }, [])  
  return (
    <>
    <LeanHeader />
    <main className="mt-18">
    {!ready ? <LoadingBox /> : 
      <div className={s.root}>
            <div>
              { cartGroup.grandTotal > 0 && <div>
                <div className={s.addressBox}>
                <div className="md:grid md:grid-cols-2">
                  <div className="md:col-span-1">
                    <div className={s.addressBoxLabel}>
                    <FaLocationArrow />
                    Địa Chỉ Nhận Hàng</div>
                    </div>
                    <div className="md:col-span-1 text-right">
                  {changeAddress ? <>                    
                    <button onClick={e=>setVisible(true)} className={cn(s.buttonNormal)}><RiAddFill /> Thêm</button>

                  </>:  <span className="inline-block"><button className={s.addressBoxButton} 
                      onClick={(e: any)=>setChangeAddress(true)}><FaRegEdit /> Đổi địa chỉ</button></span>  
                      }
                  <Modal title="Thêm địa chỉ" className="auth-form-modal"
                          width="750px"
                          visible={visible}
                          onCancel={e=>setVisible(false)}
                          okText="Create"
                        footer={null} >
                  <AddressForm address={{}} closeModal={modalClose}/>

                  </Modal>
                    </div>
                  </div>
                 {!changeAddress && <div className="md:grid md:grid-cols-12">
                    <div className="md:col-span-9">
                      <ShowsAddress selectedAddress={selectedAddress} addresses={cartGroup.addresses} />
                       </div>
                  </div> }

                  {changeAddress && 
                      <SelectAddressForm 
                      pickupAddress={pickupAddress}
                      selectedAddress={selectedAddress} 
                      addresses={cartGroup.addresses} />}

                </div>
                <div className={s.header}>
                  <div className="md:col-span-8">Sản Phẩm </div>
                  <div className="md:col-span-2 text-center">Số Lượng </div>
                  <div className="md:col-span-1">Đơn Giá </div>
       
                  <div className="md:col-span-1">Tổng</div>
                </div>
              {cartGroup?.carts?.map((cart: any, key: any) => {
                  return(<div key={key}>
                    <CartShopBox cart={cart} /> </div>
                    )
                })}
            <div className={s.footer}>
                <div className={s.summaryBox}>
                  <div className="flex justify-end ">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="md:col-span-1 w-40">Tổng tiền hàng: 
                      </div> 
                        <div className="md:col-span-1 text-right">
                          {currencyFormat(cartGroup.subtotal)}
                          </div>
                     <div className="md:col-span-1 w-40">Phí vận chuyển: </div> 
                        <div className="md:col-span-1 text-right">
                        {currencyFormat(cartGroup.shippingTotal)}
                          </div>
                          <div className="md:col-span-1 w-40">Tổng thanh toán:
                      </div> 
                        <div className="md:col-span-1 text-right">
                        <span className={s.grandTotal}>{currencyFormat(cartGroup.grandTotal)}</span>
                          </div>
                    </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-5">
                <div className="col-span-2 self-center">
                  Nhấn "Đặt Hàng" đồng nghĩa với việc
                      bạn đồng ý tuân theo Điều khoản Hape
                      </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={e=>submitPlaceOrder()} className={s.button}>
                  {loading && <CgSpinner className="animate-spin" />} Đặt Hàng
                  </button>
                </div>
                </div>
          </div>
              </div>
              }

      {createdOrders.length > 0 && <ThanksPage paymentInfo={paymentInfo} />}

      {createdOrders.length ===0 && cartGroup.carts.length === 0 && <CartIsEmpty />}
          
          </div>
 
      </div>}
    </main> 

    </>
  )
}
const ThanksPage: FC<{paymentInfo: any[] }> = ({paymentInfo}) =>{
console.log('paymentInfo:', paymentInfo)
  return (<div className={s.addressBox}>

    <h1 className="text-xl font-semibold mt-5 mb-8">Cảm ơn bạn đã đặt hàng!</h1>


     {
//      paymentInfo.map((payment: any, key: any) => {
//        /*
//        shopName: "2222"
//        order
//        accountName: "1111"
// accountNumber: "1111"
// payment: "222"*/
//       return (
//         <div key={key}>{payment.accountName}</div>
//       )
//     })
    }

    <div className="my-10">
      <Link href="/user/orders"><a>
      <button className={s.buttonBase}>Quản lý đơn hàng </button>
      </a></Link>
    </div> 
  </div>)
}
const LoadingBox = ()=>{

  return <div className={s.root}>
    <div className="bg-white px-10 pt-5 pb-20 shadow">
    <Skeleton />
    </div>

  </div>
  }
const CartIsEmpty = () =>{

  return (<div className={s.addressBox}>
  <h1 className="text-xl mt-5 mb-8">  Giỏ hàng của bạn chưa có sản phẩm nào!</h1>
  <br/>
  <Link href="/"><a>
    <button className={s.button}>Quay lại trang chủ</button>

    </a></Link>

    <br/>
    <br/>
</div>)
}
const LeanHeader = () =>{
  return(
    <div className={s.leanHeaderWrap}>
    <div className={s.leanHeader}>
       <div className="col-span-8 md:col-span-8 flex">
        <span className={s.gotoCartWrap}>
            <Link href='/cart'><a className={s.gotoCart}><MdArrowBack /> Giỏ hàng</a></Link> 
          </span> 
         <h1 className={s.pageTitle}>Thanh Toán</h1>
      </div>
      <div className="col-span-4 md:col-span-4 text-right">
        <Hape className="inline-block" fill="#DB4140" width="60px" />
      </div>

    </div>
    </div>

  )
}
const ShowsAddress: FC<{addresses: any[], selectedAddress: string}> = ({ addresses, selectedAddress }) =>{
  return(<div className="my-5 ml-5">
    {addresses.map((address: any, index: number) =>{
      return (<div key={index}>
        {address.id === selectedAddress && <div>

        <b> {address.fullName}  {address.phoneNumber}</b>
          <span className="mx-3">  {address.address}, {address.regionFull}</span>
          {address.default && <span className="label">Mặc định</span>}
        </div>   }
        </div>     
      )
    })}
    </div>     
  )
}
const SelectAddressForm: FC<{
  addresses: any[]
  selectedAddress: string
  pickupAddress: any
}> 
= ({ addresses, selectedAddress, pickupAddress }) =>{
  const [selected, setSelected] = useState<string>(selectedAddress)
  useEffect(() => {
    setSelected(selectedAddress)

  },[selectedAddress])
  const onChange = (e: any) =>{
      setSelected(e.target.value)
  }

  return(<div className="mt-6 ml-5">
      <Radio.Group onChange={e=>onChange(e)} value={selected}>
    {addresses.map((address: any) =>{
      return (<>
       <div className="mb-5">
       <Radio value={address.id}>
        <b> {address.fullName}  {address.phoneNumber}</b>
          <span className="mx-3">  {address.address}, {address.regionFull}</span>
          {address.default && <span className="label">Mặc định</span>}
          </Radio>
        </div>   
        </>     
      )
    })}    </Radio.Group>
    {addresses.length >0 && <div className="mt-3 mb-3">
      <button className={s.buttonPrimary} onClick={e=>pickupAddress(selected)}>Chọn</button>
      <button className={s.buttonNormal} onClick={e=>pickupAddress('goBack')}>Trở về</button>
      </div> }
    </div>     
  )
}


const CartShopBox: FC<{cart: any;}> = ({cart}) => {

  return (  <div className={s.cartByShop}>
    <div className={s.shopTitle}>
    {cart.shop && <>
      <AiOutlineShop />{cart.shop.shopName}
      </> }
      </div>
    <div className={s.itemBox}>

    {cart.items.map((item: any, keyIndex: any) => {
      return(
        <div className={s.item} key={keyIndex}>
            <div className="col-span-12 md:col-span-8 flex">
              <span className="mr-5">
                 <img src={item.thumb} className={s.thumb} />
              </span>
              <div className={s.nameWrap}>
                <span className={s.itemName}>
                {item.name}
                </span>
              </div>
              
            </div>
            <div className="col-span-2 md:col-span-2 text-center">
             x{item.quantity}
             </div>
            <div className="col-span-6 md:col-span-1 hidden md:block">{currencyFormat(item.price)}</div>
            <div className="col-span-2 md:col-span-1">
              <span className={s.itemTotal}>{currencyFormat(item.total)}</span>
              </div>

        </div>)
    })}
    </div>

    <div className={s.cartFooter}>
    <div className={s.cartInputColumn}>
      <label>Lời nhắn:</label>
      <input className={s.textInput} type="text" placeholder="Lời nhắn cho chủ shop" />
      </div>
      <div className={s.cartPaymentColumn}>
      Phương thức thanh toán: <span className="text-green-600">Thanh toán khi nhận hàng</span>
      </div>
      <div className={s.cartShippingColumn}>
      Phí giao hàng<span className="text-gray-400 ml-2">(Giao bởi chủ shop)</span>:  
      {cart.shipping && <span className="ml-2">
        {currencyFormat(cart.shipping.fee)}</span> } 
        
      </div>

    <div className="md:col-span-12 md:text-right mt-3 self-center">
       <span>
        Tổng số tiền ({cart.quantityTotal} sản phẩm):
        </span>
      <span className={s.grandTotalCart}>{currencyFormat(cart.grandTotal)}</span>

      </div>
    </div>
      
  </div>)
}
export default CheckoutPage
