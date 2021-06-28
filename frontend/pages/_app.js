import 'antd/dist/antd.css'
import axios from 'axios'
import React from 'react'
import 'react-input-range/lib/css/index.css'
import '@assets/main.scss'
import '@assets/chrome-bug.css'
import { AuthProvider } from "../context/AuthContext";
import 'keen-slider/keen-slider.min.css'
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API
axios.defaults.timeout = 30000 // 30 seconds
const isServer = typeof window !== 'object'

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