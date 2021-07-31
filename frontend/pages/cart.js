import Head from 'next/head'
import { Layout } from '@components/common'
import { CartPage } from '@components/pages'
import { NextSeo } from 'next-seo'

export default function Cart() {
  return (
    <Layout>
        <NextSeo title="Giỏ hàng" description="" />
        <CartPage />
    </Layout>
  )
}
