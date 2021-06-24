import Head from 'next/head'
import { Layout } from '@components/common'
import { HomeContent } from '@components/pages'
import { useAuth } from "../context/AuthContext";
export default function Home() {
  const { user, login, logout } = useAuth();

  return (
    <Layout>
      <Head>
        <title>Home page</title>
      </Head>
        <HomeContent />

    </Layout>
  )
}
