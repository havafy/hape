import Head from 'next/head'
import { Layout } from '@components/common'
import { CheckoutPage } from '@components/pages'
import { NextSeo } from 'next-seo'

export default function Cart() {
  return (
    <Layout hideHeader>
    <NextSeo title="Thanh toán" description="" />
        <CheckoutPage />
    </Layout>
  )
}
