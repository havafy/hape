import { FC } from 'react'
import NextHead from 'next/head'


const Head: FC = () => {
  return (
    <>
      <NextHead>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/site.webmanifest" key="site-manifest" />
      </NextHead>
    </>
  )
}

export default Head
