import Document, { Html, Head, Main, NextScript } from 'next/document'
const recaptchaScriptSource = `https://www.google.com/recaptcha/api.js?render=` + process.env.NEXT_PUBLIC_RECAPTCHA_KEY;
const ChatraID = process.env.NEXT_PUBLIC_CHATRA
const GA_ID = process.env.NEXT_PUBLIC_GA
const GA_URL = `https://www.googletagmanager.com/gtag/js?id=` + GA_ID
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }


  render() {
    return (
      <Html>
        <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <script src={recaptchaScriptSource}></script>
        <script async src={GA_URL}></script>
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
              ` }} />
          
            <script dangerouslySetInnerHTML={{ __html: `
              (function(d, w, c) {
                      w.ChatraID = '${ChatraID}';
                      var s = d.createElement('script');
                      w[c] = w[c] || function() {
                          (w[c].q = w[c].q || []).push(arguments);
                      };
                      s.async = true;
                      s.src = 'https://call.chatra.io/chatra.js';
                      if (d.head) d.head.appendChild(s);
                  })(document, window, 'Chatra');
              ` }} />



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