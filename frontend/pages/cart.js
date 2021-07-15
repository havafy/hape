import Head from 'next/head'
import { Layout } from '@components/common'
import { CartPage } from '@components/pages'

export default function Cart() {
  return (
    <Layout>
        <CartPage />
    </Layout>
  )
}
