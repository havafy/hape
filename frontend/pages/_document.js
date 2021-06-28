import Document, { Html, Head, Main, NextScript } from 'next/document'
const recaptchaScriptSource = `https://www.google.com/recaptcha/api.js?render=` + process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
        <script src={recaptchaScriptSource}></script>
        </Head>
        <body className="layout">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument