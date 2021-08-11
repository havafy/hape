import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './About.module.css'
import Head from 'next/head'

const About: FC = () => {
  return (
    <main className="">
      <Head>
        <title>Hape.vn tự hào là kênh thương mại điện tử chuyên về thực phẩm hữu cơ, thực phẩm chay</title>
      </Head>
      <div className={s.headBox}>

      </div>
      <div className="px-5 mx-auto max-w-7xl">
        <div className={s.headTitle}>
         Giới Thiệu Hape
        </div>
        <p className={s.introText}>
       Hape.vn tự hào là kênh thương mại điện tử chuyên về thực phẩm hữu cơ, thực phẩm chay, sản phẩm thủ công mỹ nghệ, đồ dùng nhà cửa, mỹ phẩm sử dụng nguyên vật liệu thân thiện với môi trường. 
       Sứ mệnh chúng tôi mang đến sản phẩm an toàn, thân thiện môi trường, giúp kết nối và xây dựng thương hiệu Nông Trại và Nghệ Nhân đến người tiêu dùng. 

        <br /> Chúng tôi luôn tập trung áp dụng những công nghệ tiên tiến nhất, kiểm định chất lượng cao, tập trung phát triển các dịch vụ bảo mật, nhằm cung ứng cho doanh nghiệp các giải pháp toàn diện, chất lượng ưu việt, đem đến trải nghiệm tốt cho người dùng với chi phí hợp lí nhất.

           </p>
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1">
          <img src="/pages/about/why_us.jpeg" className="container" />
        </div>
        <div className="md:col-span-1 pl-10 lg:pl-20 mt-20 ">
          <h3 className="text-4xl">Chất lượng sản phẩm là cốt lõi</h3>
          <p className="text-xl text-gray-600 my-10 w-9/12">
          Khi mua hàng online tại Hape, bạn hoàn toàn yên tâm về chất lượng sản phẩm, mẩu mã và giá cả. Nếu mua hàng trực tuyến một sản phẩm bất kỳ, bạn sẽ được tích lũy điểm thưởng để có thể mua hàng online với mức giá rẻ hơn ở những lần sau.
          <br/><br/> Chưa hết Bạn sẽ thường xuyên nhận được coupon giảm giá, quà tặng hàng tháng cũng như cập nhật các thông tin xu hướng mới nhất về thời trang, làm đẹp, giải trí…khi mua sắm trực tuyến tại Hape.
  </p>
        </div>
      </div>
      <div className="mt-20 lg:mt-52 md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1 ">
          <div className=" flex justify-end">
            <div className="lg:w-9/12 mx-10 lg:mx-0">
              <h3 className="text-4xl">Chất lượng hơn số lượng</h3>
              <p className="text-xl text-gray-600 my-10">
              Chúng tôi dốc toàn lực nhằm phục vụ khách hàng để chiếm được lòng tin và sự hài lòng với dịch vụ của chúng tôi. Sự hài lòng của khách hàng là động lực to lớn để chúng tôi phát triển thêm những dịch vụ hậu mãi đi kèm khác biệt, tạo giá trị lợi ích xứng đáng so với chi phí của khách hàng bỏ ra.
              <br/><br/>
Quý khách có thể tìm hiểu thêm thông tin về quy trình mua hàng, cách thức hoạt động của dịch vụ của chúng tôi hoặc gọi số hotline để yêu cầu tư vấn trực tiếp.


                </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 lg:pl-20">

          <img src="/pages/about/why_us2.jpeg" className="container" />
        </div>
      </div>

      <div className="bg-gray-100 lg:mt-20 py-24 hidden">
        <div className="mx-auto max-w-7xl">
          <div className="text-3xl font-bold m-auto max-w-2xl text-center text-gray-800">
            Each of our values is aligned with what will guide us to achieve our mission
          </div>
          <div className="my-12 md:grid md:grid-cols-3 md:gap-8">
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Mission</h3>
              <p className="text-base text-gray-600">We are purpose-driven people,
              dedicated to serving something beyond ourselves.
              Having mission as a value also allows us
              to continually ground ourselves in why we’re building Hape.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Do great things, fast</h3>
              <p className="text-base text-gray-600">We commit to being great at the things we do and doing them fast, without sacrificing one for the other.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Mindfulness</h3>
              <p className="text-base text-gray-600">We focus on the present and aim to give ourselves time to reflect and space to integrate what we learn. These practices allow us to collectively learn from and improve in all that we do, and to continually evolve our culture.
            </p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
          </div>
        </div>

      </div>
    </main>
  )
}

export default About
