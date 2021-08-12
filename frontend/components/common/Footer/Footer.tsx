import { FC } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import getSlug from '@lib/get-slug'
import { Hape } from '@components/icons'
import { RiInstagramFill, RiYoutubeFill, RiFacebookCircleFill } from 'react-icons/ri'
import { Logo, Container } from '@components/ui'
import { I18nWidget } from '@components/common'
import s from './Footer.module.css'

const Footer: FC = () => (

  <footer className={s.footer}>
    <Container>
      <div className="px-5 grid grid-cols-2 md:grid-cols-12 gap-8 pt-20 md:pb-20 transition-colors duration-150">
      <div className="col-span-1 md:col-span-3 ">
      <h3 className={s.title}>Chăm sóc khách hàng</h3>
      <ul className="flex flex-initial flex-col md:flex-1">
        <li className={s.menu}> <Link href="/page/thanh-toan"><a>Thanh Toán</a></Link></li>
        <li className={s.menu}> <Link href="/page/phi-van-chuyen"><a>Phí Vận Chuyển</a></Link></li>
        <li className={s.menu}> <Link href="/page/tra-hang-hoan-tien"><a>Trả Hàng & Hoàn Tiền</a></Link></li>
        <li className={s.menu}> <Link href="/page/chinh-sach-bao-hanh"><a>Chính Sách Bảo Hành</a></Link></li>
          </ul>
        </div>
        <div className="col-span-1 md:col-span-3 ">
      <h3 className={s.title}>Về Hape</h3>
      <ul className="flex flex-initial flex-col md:flex-1">
        <li className={s.menu}> <Link href="/page/about-us"><a>Giới thiệu Hape</a></Link></li>
        <li className={s.menu}> <Link href="/page/chinh-sach-bao-mat"><a>Chính sách bảo Mật</a></Link></li>
        <li className={s.menu}> <Link href="/page/dieu-khoan-su-dung"><a>Điều khoản sử dụng</a></Link></li>
          </ul>
        </div>
        <div className="col-span-3">
        <h3 className={s.title}>Thanh toán</h3>
        <div className={s.partnerIcons}>
          <img src="/assets/payments/visa.png" width="50px" />
          <img src="/assets/payments/american-express.png" width="60px" />
          <img src="/assets/payments/jcb.png" />
          <img src="/assets/payments/mastercard.svg" />
          <img src="/assets/payments/momo.png" />
          <img src="/assets/payments/vnpay.png" />

        </div>
        <h3 className={s.title}>Vận chuyển</h3>
        <div className={s.partnerIcons}>
          <img src="/assets/shippings/ghn.png"   width="50px"/>
          <img src="/assets/shippings/ghtk.png" />
    
          <img src="/assets/shippings/jt.svg"  width="60px" />
          <img src="/assets/shippings/grab.png"  />
          {/* <img src="/assets/shippings/ninjavan.svg" /> */}
          <img src="/assets/shippings/viettel_post.png" />
          </div>
          </div>
        <div className="col-span-3 mr-5">
        <div>
        <h3 className={s.title}>Luôn giữ kết nối.</h3>
          <div className="mt-10 flex items-start ">
            <div className={s.iconSocial}>
              <a
                aria-label="Hape Fanpage"
                href="https://www.facebook.com/hapevn"
                target="_blank"
                className={s.menu}
              >
                <RiFacebookCircleFill  />
              </a>
              <a
                aria-label="Hape on Instagram"
                href="https://www.instagram.com/hape.vn/"
                target="_blank"
                className={s.menu}
              >
                <RiInstagramFill  />
              </a>
              <a
                aria-label="Hape on Youtube"
                href="https://www.youtube.com/channel/UCNqfpB0YbNUOP7ggI6tXgIA"
                target="_blank"
                className={s.menu}
              >
                <RiYoutubeFill  />
              </a>

            </div>
          </div>
          </div> 
        <div className="my-5">
          <b><a href="https://www.havafy.vn" title="Thiết kế web bán hàng" className="text-xs text-gray-700">
            Thiết kế web và xây dựng bởi Havafy</a></b></div>
        </div>

      </div>

    </Container>
    <div className={s.copyright}>
      <div>
      Công ty TNHH IMEX GLOBAL ENTERPRISES <br/>
Địa chỉ đăng ký kinh doanh: 254 Nguyễn Hoàng, Phường An Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh.<br/>
Giấy chứng nhận Đăng ký Kinh doanh số 0315138097 do Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 29/06/2018
<br/>    <span>© 2017 - Bản quyền thuộc về Hape.vn</span>
      </div>

    </div>
  </footer>
)

export default Footer
