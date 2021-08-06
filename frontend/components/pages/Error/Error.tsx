import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Error.module.css'
import Head from 'next/head'
interface Props {
  title?: string;
  statusCode?: number;
}
const Error: FC<Props> = ({title = ''}) => {

  return (
    <>
    <Head><title>{title}</title></Head>
    <main className="mt-20 mb-60 sm:mt-60">
      <div className="mx-auto max-w-7xl text-center">
          <img src="/assets/empty-box.png" width="100px" className="my-10 mx-auto" />
        <h1 className="text-xl text-gray-700">Không tìm thấy đường dẫn này!</h1>
          <div>
            <Link href="/"><a className="button arrow bg-yellow-500 mt-10 font-semibold">Về Trang chủ</a></Link>

          </div>
      </div>
    </main>
    </>
  )
}

export default Error
