import Document, { Html, Head, Main, NextScript } from 'next/document'
const recaptchaScriptSource = `https://www.google.com/recaptcha/api.js?render=` + process.env.NEXT_PUBLIC_RECAPTCHA_KEY;
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

        </Head>
        <body className="layout">
          <Main />
          <NextScript />
        </body>


        <div id="fb-root"></div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.fbAsyncInit = function() {
              FB.init({
                xfbml            : true,
                version          : 'v11.0',
                appId : '786878948688637',
                status : false, 
                autoLogAppEvents : true
              });
            };
            (function(d, s, id) {
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) return;
              js = d.createElement(s); js.id = id;
              js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
            `,
          }}
        />

        <div className="fb-customerchat"
          attribution="page_inbox"
          page_id="105109347625874">
        </div>
        
      </Html>
    )
  }
}

export default MyDocument