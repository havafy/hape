import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './Home.module.css'
import axios from 'axios'
import { ProductBox } from '@components/common'

const HomeContent: FC<{data: any[]}>= ({data}) => {

  return (
    <main className="md:mt-16 mt-12">
      {  Array.isArray(data) && <>
          {data.map((block: any, key) => {
                if(block.type === 'MainBanners')
                  return <Banners data={block} key={key}/>
                if(block.type === 'productSlide')
                  return <ProductBox products={block.data.products} title={block.title} key={key} />
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
  <div className="md:grid md:grid-cols-2 ">
    <div className="md:col-span-1">
      <div className="md:px-4 px-0">
        <Link href={data.bannerBig.link}>
          <a><img src={data.bannerBig.src} /></a>
        </Link>
      </div>
    </div>
    <div className="md:col-span-1">
    <div className="md:grid md:grid-cols-2 md:gap-3 hidden">
        <div className="md:col-span-1">
        <Link href={data.banner1.link}>
          <a><img className="w-full" src={data.banner1.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner2.link}>
          <a><img className="w-full" src={data.banner2.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner3.link}>
          <a><img className="w-full" src={data.banner3.src} /></a>
        </Link>
        </div>
        <div className="md:col-span-1">
        <Link href={data.banner4.link}>
          <a><img className="w-full" src={data.banner4.src} /></a>
        </Link>
        </div>
      </div>
    </div>
  </div>
</div>
)
  }

export default HomeContent
