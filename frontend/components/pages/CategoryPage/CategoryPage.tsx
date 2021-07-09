import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './CategoryPage.module.css'
import axios from 'axios'
import { ProductBox } from '@components/common'
interface Props {
  pid: string;
}
const CategoryPage: FC<Props> = ({pid}) => {
  const [ data, setData ] = useState([])
  const [ ready, setReady ] = useState<boolean>(false)
  useEffect(() => {
    (async () => {
        let {data: {products}} = await axios.get('/pages/category/'+ pid)
        setData(products)
     
        setReady(true)
    })()
  }, [])
  return (
    <main className="mt-16">
      { ready && Array.isArray(data) && <>
          {data.map((block: any, key) => {
                if(block.type === 'MainBanners')
                  return <Banners data={block} key={key}/>
                if(block.type === 'productSlide')
                  return <ProductBox data={block}key={key} />
              })
    
            }
         </>
      }
    </main>
  )
}

const Banners: FC<{data: any}> = ({data: {data}}) => {
  return (
  <div className="mx-auto max-w-7xl">
  <div className="md:grid md:grid-cols-2 md:gap-6">
    <div className="md:col-span-1">
      <div className="px-4 sm:px-0">
        <Link href={data.bannerBig.link}>
          <a><img src={data.bannerBig.src} /></a>
        </Link>
      </div>
    </div>
    <div className="md:col-span-1">
    <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1">
        <Link href={data.banner1.link}>
          <a><img src={data.banner1.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner2.link}>
          <a><img src={data.banner2.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner3.link}>
          <a><img src={data.banner3.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner4.link}>
          <a><img src={data.banner4.src} /></a>
        </Link>
        </div>
      </div>
    </div>
  </div>
</div>
)
  }

export default CategoryPage
