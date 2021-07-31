import Head from 'next/head'
import { Layout } from '@components/common'
import { ContactForm } from '@components/pages'
import { NextSeo } from 'next-seo'

export default function Contact() {
  return (
    <Layout>
     <NextSeo title="Liên hệ" description="" />
        <ContactForm />
    </Layout>
  )
}
