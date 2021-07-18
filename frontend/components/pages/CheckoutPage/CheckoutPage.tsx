import { FC, useEffect, useState, useCallback} from 'react'
import Link from 'next/link'
import s from './CheckoutPage.module.css'
import axios from 'axios'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { QuantityBox } from '@components/common'
import {FaLocationArrow, FaRegEdit} from 'react-icons/fa'
import { RiAddFill } from 'react-icons/ri'
import {MdArrowBack} from 'react-icons/md'
import { AddressForm } from '@components/common'
import { Radio, Modal } from 'antd';
import { useAuth } from '@context/AuthContext'
import { getProductUrl, currencyFormat } from '@lib/product'
import { Hape } from '@components/icons'
interface Props {

}

const CheckoutPage: FC<Props> = ({}) => {
  const router = useRouter()
  const {accessToken, updateAction} = useAuth();
  const [ visible, setVisible] =useState(false)
  const [changeAddress, setChangeAddress] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [cartGroup, setCartGroup] = useState<{carts: any[], grandTotal: number, addresses: any[]}>({
    carts: [],
    grandTotal: 0,
    addresses: []
  })
  const headerApi = { 
    headers: { 'Authorization': `Bearer ${accessToken}` } 
  }
  const [ loading, setLoading ] = useState<boolean>(true)
  useEffect(() => {+
   pullCart()
  }, [])
  const pullCart = async () =>{
    setLoading(true);
    try{
      let {data} = await axios.get('/cart', { 
        ...headerApi,
        params: { collect: 'address,payments,shippings' }
      })
      setCartGroup(data)

      for (let address of data.addresses) {
          if(address.default){
            setSelectedAddress(address.id)
          }
      }
      setLoading(false)
    }catch(err){

    }

  }
  const pickupAddress = useCallback((id:string) => {
      if(id !== '' && id !== 'goBack'){
          setSelectedAddress(id)
        }
        setChangeAddress(false)
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

  const modalClose = useCallback((e:any) => {
        setVisible(false)
        // pullAddress()

    }, [])  
  return (
    <>
    <LeanHeader />

    <main className="mt-18">
      <div className={s.root}>

            <div> 
    
              { cartGroup.grandTotal > 0 ? <div>
                <div className={s.addressBox}>
                <div className="md:grid md:grid-cols-2">
                  <div className="md:col-span-1">
                    <div className={s.addressBoxLabel}>
                    <FaLocationArrow />
                    Địa Chỉ Nhận Hàng</div>
                    </div>
                    <div className="md:col-span-1 text-right">
                  {changeAddress && <>                    
                    <button onClick={e=>setVisible(true)} className={cn('mr-3',s.buttonNormal)}><RiAddFill /> Thêm</button>
                  <button className={s.buttonNormal} >Danh sách</button>
                  </>}
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
                    <div className="md:col-span-3 pt-6">
                      <button className={s.addressBoxButton} 
                      onClick={(e: any)=>setChangeAddress(true)}><FaRegEdit /> Đổi địa chỉ</button>
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
                  <div className="md:col-span-1">Đơn Giá </div>
                  <div className="md:col-span-2 text-center">Số Lượng </div>
                  <div className="md:col-span-1">Tổng</div>
                </div>
              {cartGroup?.carts?.map((cart: any, index: number) => {
                  return(
                    <CartShopBox cart={cart} index={index}/>
                    )
                })}
            <div className={s.footer}>
                <div className={s.summaryBox}>
                  <div className="flex justify-end ">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="md:col-span-1 w-40">Tổng tiền hàng: 
                      </div> 
                        <div className="md:col-span-1 text-right">
                          {currencyFormat(cartGroup.grandTotal)}
                          </div>
                     <div className="md:col-span-1 w-40">Phí vận chuyển: </div> 
                        <div className="md:col-span-1 text-right">
                        {currencyFormat(0)} - {currencyFormat(30000)}
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
                  <button className={s.button}>
                    Đặt Hàng
                  </button>
                </div>
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
const ShowsAddress: FC<{addresses: any[], selectedAddress: string}> = ({ addresses, selectedAddress }) =>{
  return(<div className="my-5 ml-5">
    {addresses.map((address: any) =>{
      return (<>
        {address.id === selectedAddress && <div>

        <b> {address.fullName}  {address.phoneNumber}</b>
          <span className="mx-3">  {address.address}, {address.regionFull}</span>
          {address.default && <span className="label">Mặc định</span>}
        </div>   }
        </>     
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
    <div className="mt-3 mb-3">
      <button className={s.buttonPrimary} onClick={e=>pickupAddress(selected)}>Chọn</button>
      <button className={s.buttonNormal} onClick={e=>pickupAddress('goBack')}>Trở về</button>
      </div>
    </div>     
  )
}


const CartShopBox: FC<{cart: any; index: number}> = ({cart, index}) => {


  return (  <div className={s.cartByShop} key={index}>
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
    <div className={s.cartInputColumn}>
      <label>Lời nhắn:</label>
      <input className={s.textInput} type="text" placeholder="Lời nhắn cho chủ shop" />
      </div>
      <div className={s.cartShippingColumn}>
      Phí giao hàng:  
      <span className="ml-2">
        {currencyFormat(0)} - {currencyFormat(30000)}</span> 
        (Giao bởi chủ shop)
      </div>
      <div className={s.cartPaymentColumn}>
      Phương thức thanh toán: <span className="text-green-600">Thanh toán khi nhận hàng</span>
      </div>
    <div className="md:col-span-12 text-right mt-3 self-center">
       <span>
        Tổng số tiền ({cart.quantityTotal} sản phẩm):
        </span>
      <span className={s.grandTotalCart}>{currencyFormat(cart.grandTotal)}</span>

      </div>
    </div>
      
  </div>)
}
export default CheckoutPage
