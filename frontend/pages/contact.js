import Head from 'next/head'
import { Layout } from '@components/common'
import { Contact } from '@components/pages'
export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Home page</title>
      </Head>
        <Contact />
    </Layout>
  )
}
