import Head from 'next/head'
import { Layout } from '@components/common'
import { PostForm } from '@components/pages'
export default function Post() {
  return (
    <Layout>
        <PostForm />
    </Layout>
  )
}
