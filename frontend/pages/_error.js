import Head from 'next/head'
import { Layout } from '@components/common'
import { Error } from '@components/pages'
import { NextSeo } from 'next-seo'

  function ErrorPage({ statusCode }) {
    return (
      <Layout>
      <NextSeo title="Không tìm thấy đường dẫn này!" description="" />
      <Error statusCode={statusCode} title="Không tìm thấy đường dẫn này!" />
    </Layout>
    )
  }
  
  export default ErrorPage