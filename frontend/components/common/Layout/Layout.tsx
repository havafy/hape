import cn from 'classnames'
import dynamic from 'next/dynamic'
import s from './Layout.module.css'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useUI } from '@components/ui/context'
import { Navbar, Footer } from '@components/common'
import { DefaultSeo } from 'next-seo'
import config from '@config/seo.json'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
interface Props {
  hideHeader?: boolean;
}

const Layout: FC<Props> = ({
  children,
  hideHeader
}) => {
  const {
    displaySidebar,
    displayModal,
    closeSidebar,
    closeModal,
    modalView,
  } = useUI()
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies()
  const { locale = 'en-US' } = useRouter()

  let darkMode = true

  return (
    <div id="App">

      <DefaultSeo {...config} />

      <header>
      <Navbar hideHeader={hideHeader}  darkMode={darkMode} />
  
      </header>

      {children}

      <Footer />
    </div>
  )
}

export default Layout
