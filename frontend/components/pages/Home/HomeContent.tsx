import { FC } from 'react'
import Link from 'next/link'
import s from './Home.module.css'
import { ProductBox } from '@components/common'
interface Props {
  products: any[];
  title: string;
}
const HomeContent: FC = () => {

  return (
    <main className="mt-16">

      <Banners />
      <ProductBox title="Sản phẩm Ưu Đãi" products={[]} />
    </main>
  )
}

const Banners: FC = () => (
  <div className="mx-auto max-w-7xl">
  <div className="md:grid md:grid-cols-2 md:gap-6">
    <div className="md:col-span-1">
      <div className="px-4 sm:px-0">
      <img src="/pages/home/banners/h1.gif" />
      </div>
    </div>
    <div className="md:col-span-1">
    <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1">
          <img src="/pages/home/banners/b1.png" />
        </div>
        <div className="md:col-span-1">
          <img src="/pages/home/banners/b2.png" />
        </div>
        <div className="md:col-span-1">
          <img src="/pages/home/banners/b3.png" />
        </div>
        <div className="md:col-span-1">
          <img src="/pages/home/banners/b4.png" />
        </div>
      </div>
    </div>
  </div>
</div>
)

export default HomeContent
