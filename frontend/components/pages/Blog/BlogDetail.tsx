import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Blog.module.css'
interface Props {
    pid?: string
}

const BlogDetail: FC<Props>= ({pid}) => {
  return (
    <main className="mt-20 sm:mt-20 md:mt-32">
      <div className="mx-auto max-w-7xl">
  
      BlogDetail: {pid}
      </div>
    </main>
  )
}

export default BlogDetail
