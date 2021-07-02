import Head from 'next/head'
import { Layout } from '@components/common'
import { Error } from '@components/pages'


function ErrorPage({ statusCode }) {
    return (
        <Layout>
            <Error statusCode={statusCode} title="Không tìm thấy đường dẫn này!" />
          </Layout>
    )
  }
  
  ErrorPage.getInitialProps = ({ res, err }) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404
    return { statusCode }
  }
  
  export default ErrorPage