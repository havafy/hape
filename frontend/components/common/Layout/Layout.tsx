import cn from 'classnames'
import dynamic from 'next/dynamic'
import s from './Layout.module.css'
import { useRouter } from 'next/router'
import React, { FC } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useUI } from '@components/ui/context'
import { Navbar, Footer } from '@components/common'

import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
interface Props {

}

const Layout: FC<Props> = ({
  children
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


      <header>
      <Navbar darkMode={darkMode} />
  
      </header>

      {children}

      <Footer />
    </div>
  )
}

export default Layout
