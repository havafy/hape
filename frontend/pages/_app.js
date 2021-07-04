import 'antd/dist/antd.css'
import axios from 'axios'
import Router from 'next/router'
import React from 'react'
import NProgress from 'nprogress'
import { loadProgressBar } from 'axios-progress-bar'
import 'react-input-range/lib/css/index.css'
import '@assets/main.scss'
import '@assets/chrome-bug.css'
import { AuthProvider } from "../context/AuthContext";
import 'keen-slider/keen-slider.min.css'
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API
axios.defaults.timeout = 30000 // 30 seconds
const isServer = typeof window !== 'object'
if (!isServer) {
    loadProgressBar()
    Router.events.on('routeChangeStart', () => NProgress.start())
    Router.events.on('routeChangeComplete', () => NProgress.done())
    Router.events.on('routeChangeError', () => NProgress.done())
  }
function MyApp({ Component, pageProps }) {
    React.useEffect(() => {

      }, []);

  return (
      <>
          <AuthProvider>
              <Component {...pageProps} />
          </AuthProvider>
      </>
  );
}

export default MyApp