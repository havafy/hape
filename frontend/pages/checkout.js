import Head from 'next/head'
import { Layout } from '@components/common'
import { CheckoutPage } from '@components/pages'

export default function Cart() {
  return (
    <Layout hideHeader>
        <CheckoutPage />
    </Layout>
  )
}
