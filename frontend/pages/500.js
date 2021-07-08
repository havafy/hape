import Head from 'next/head'
import { Layout } from '@components/common'
import { Error } from '@components/pages'


function Error500({ statusCode }) {
    return (
        <Layout>
            <Error statusCode={statusCode} title="Không tìm thấy đường dẫn này!" />
          </Layout>
    )
  }
  
  
  export default Error500