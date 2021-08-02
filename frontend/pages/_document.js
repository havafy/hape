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


            <div id="fb-root"></div>
            <div id="fb-customer-chat" class="fb-customerchat">
            </div>
            <script dangerouslySetInnerHTML={{ __html: `
              var chatbox = document.getElementById('fb-customer-chat');
              chatbox.setAttribute("page_id", "105109347625874");
              chatbox.setAttribute("attribution", "biz_inbox");

              window.fbAsyncInit = function() {
                FB.init({
                  xfbml            : true,
                  version          : 'v11.0'
                });
              };

              (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = 'https://connect.facebook.net/vi_VN/sdk/xfbml.customerchat.js';
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));

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