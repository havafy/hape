import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './About.module.css'
import Head from 'next/head'

const About: FC<any> = () => {
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


<div className="mt-20 mx-auto max-w-7xl my-10 text-base">
  <div className="mx-28">
<p>Quý khách có nhu cầu liên lạc, trao đổi hoặc đóng góp ý kiến, vui lòng tham khảo các thông tin sau:
</p>
Liên lạc qua điện thoại: 028 6650 0660<br />
Liên lạc qua email: contact@hape.vn <br />
Fanpage: https://facebook.com/hapevn <br />
Đối tác có nhu cầu hợp tác quảng cáo hoặc kinh doanh: contact@hape.vn<br />
Văn phòng: 65/2H Giải Phóng, phường 4, quận Tân Bình, Thành phố Hồ Chí Minh. <br />

<p className="mt-10">
  <h3 className="text-xl"> Thông tin về công ty</h3>

Công ty TNHH IMEX GLOBAL ENTERPRISES <br />
Địa chỉ đăng ký kinh doanh: 254 Nguyễn Hoàng, Phường An Phú, Thành phố Thủ Đức, Thành phố Hồ Chí Minh. <br />
Giấy chứng nhận Đăng ký Kinh doanh số 0315138097 do Sở Kế hoạch và Đầu tư Thành phố Hồ Chí Minh cấp ngày 29/06/2018
</p>
</div>
</div>
      </main>
  )
}

export default About
