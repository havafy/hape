import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Error.module.css'
import Head from 'next/head'
const Error: FC = () => {

  return (
    <>
    <Head><title>Không tìm thấy đường dẫn này!</title></Head>
    <main className="mt-30 mb-60 sm:mt-60">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl text-gray-400">Không tìm thấy đường dẫn này!</h1>
          
      </div>
    </main>
    </>
  )
}

export default Error
