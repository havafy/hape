import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Mobile.module.css'
import Head from 'next/head'

const SectionRecentWorks: FC = () => (
  <div className="mt-20">
    <div className="m-auto">
    
    </div>
  </div>

)
const SectionWorkflow: FC = () => (
  <div className="mt-20 py-24 bg-gray-100">
    <div className="max-w-7xl m-auto">
      <h3 className="max-w-2xl text-4xl text-center m-auto">
        We deliver top quality
          <br />mobile apps with <span className="heading-red">React Native</span></h3>
      <p className="max-w-xl m-auto mt-5 text-base text-center">
        Our startup partnership program is all about a real understanding of your innovative idea.
        To stay competitive utilizing advance technologies we serve as
        a technology translator to global businesses.
          </p>
      <div className="stepsBox">
        <div className="item">
          <div className="stepNum">1</div>
          <div>
            <h3 className="title">Requirements meet</h3>
            <p className="des">Here, we conduct a thorough discussion with the client to understand his requirements,
          goals, and business objectives  </p>
          </div>
        </div>
        <div className="item">
          <div className="stepNum">2</div>
          <div>
            <h3 className="title">SRS Documentation</h3>
            <p className="des">
              A comprehensive software requirements specification (SRS) document is signed that
              carefully enlists the purpose, description, and detailed requirements of the product.

            </p></div>
        </div>
        <div className="item">
          <div className="stepNum">3</div>
          <div>
            <h3 className="title">Project Structure Creation</h3>
            <p className="des">
              Our team of advisors develop a wide-ranging strategy that maps out the use of latest tools and technologies to create a robust product.

            </p></div>
        </div>
        <div className="item">
          <div className="stepNum">4</div>
          <div>
            <h3 className="title">Development</h3>
            <p className="des">

              Our React Native developers ensure a smooth and seamless implementation using advanced tools and technologies.

            </p></div>
        </div>

        <div className="item">
          <div className="stepNum">5</div>
          <div>
            <h3 className="title">Design Creation</h3>
            <p className="des">
              This stage involves creating wireframes of the app that
              demonstrate the structure of the app and every part of its screen.
            </p></div>
        </div>
        <div className="item">
          <div className="stepNum">6</div>
          <div>
            <h3 className="title"> QA Testing</h3>
            <p className="des">
              Every sprint is accompanied by a testing phase that helps to measure the functionality and performance of the app.
            </p></div>
        </div>

      </div>
    </div>
  </div>
)
const SectionWhyUs: FC = () => (
  <div className="bg-gray-100 mt-20 py-24">
    <div className="mx-auto max-w-5xl  text-center">
      <div className="headTitleTop tracking-wider font-semibold text-xl m-auto max-w-2xl text-gray-800">
        WHY CHOOSE HAVAFY?
          </div>
      <p className="max-w-2xl text-3xl m-auto">
        Havafy is recognized for serving modern business needs and delivering the <span className="heading-red font-bold">best-in-class solutions </span> at a competitive cost across the globe.</p>

      <div className="iconItems my-12 md:grid md:grid-cols-3 md:gap-8">
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/development/web-traffic.svg" />
          <h3 className="title">Customer Satisfaction</h3>
          <p className="des">
            leverages a variety of frameworks and the latest technology to transform your application idea.
            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/development/experience.svg" />
          <h3 className="title">Boosting Your Brand Reputation</h3>
          <p className="des">
            taken the world by storm, and staying up-to-date with your audience is the key.
            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/development/customer-service.svg" />
          <h3 className="title">Evolve Your Business</h3>
          <p className="des">
            Our passion for learning and adopting has led us to develop applications that transform your business
            </p>
        </div>
      </div>
      <div className="text-base m-auto max-w-2xl text-gray-600">
        Why do we claim so? Well, we know cross-platform app development at its core. With our team of multi-disciplined talents and the latest technology, we bring your application ideas to life.
          </div>
      <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
    </div>

  </div>
)
const SectionIntegration: FC = () => (

  <div className={s.technicalSection}>
    <div className="mt-24 px-5 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-1 ">
        <div className=" flex justify-end">
          <div className="w-18/12">
            <div className="headTitleTopLeft heading-red font-bold text-base uppercase">Integration Solutions</div>

            <p className="text-base text-gray-600 my-10">


              <p className="mb-5 lg:mr-20">
                By fusing the caliber of Native Platform along with App Integration embracing connecting and sharing with Cloud and Automation service, we, at Havafy, offer our clients a high-end Native application. Our clients get scalable API integration services from us. Our React Native developers are all set with remarkable API integration solutions that render great customer experience.</p>

            </p>
          </div>
        </div>
      </div>
      <div className="md:col-span-1 ">

        <div className="grid grid-cols-2 gap-3">

            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/credit-card.png" alt="Payment Gateway" /></div>
               <h4 className="ml-4 mt-5 font-semibold">Payment Gateway</h4>
            </div>
 
            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/bluetooth.png" alt="BLE Integration" /></div>
               <h4 className="ml-4 mt-5 font-semibold">BLE Integration</h4>
            </div>
            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/smartphone.png" alt="MDM Integration" /></div>
               <h4 className="ml-4 mt-5 font-semibold">MDM Integration</h4>
            </div>

            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/wearable.png" alt="Wearable Integration" /></div>
               <h4 className="ml-4 mt-5 font-semibold">Wearable Integration</h4>
            </div>

            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/speak.png" alt="Chat Server Integration" />  </div>
               <h4 className="ml-4 mt-5 font-semibold">Chat Server Integration</h4>
            </div>
            <div className="col-span-1 flex mb-8">
              <div className="w-14"><img src="/pages/mobile/integration/compass.png" alt="GPS, Navigation Integration" /></div>
               <h4 className="ml-4 mt-5 font-semibold">GPS, Navigation Integration</h4>
            </div>
          </div>


      </div>
    </div>
  </div>

)
const SectionWhyReact: FC = () => (
  <div className="mt-24 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
    <div className="md:col-span-1 ">
      <div className=" flex justify-end">
        <div className="lg:w-11/12 px-5">
          <h3 className="text-4xl ">
            Why Shoud You Opt React Native<br /> Mobile Application Development
          </h3>
          <p className="text-xl text-gray-600 my-10">

            <p>React Native for Android and iOS application development is skyrocketing
            as developers worldwide are swiftly adopting this programming language.
<br /> <br />
The effortless development of React Native saves up significant time by creating
Android and iOS app simultaneously, and that too with a native experience.
<br /><br />
We develop mobile apps for startups by launching products within 3 months and budget constraints.
We leverage existing API and bring mobile presence to already functioning web applications
</p>

          </p>
        </div>
      </div>
    </div>
    <div className="md:col-span-1 lg:pl-20">

      <img src="/pages/mobile/app_demo1.png" className="container" />
    </div>
  </div>

)
const Mobile: FC = () => {
  return (
    <main className="">
      <Head>
        <title>Mobile Development  to build innovative experiences</title>
      </Head>
      <div className={s.headBox}>
        <div className={s.headBox_wrap}>
          <h1>  Mobile Development<br />  to build innovative experiences </h1>
          <p>
            In a mobile-first world, customers and workers
            want more ways to engage with your brand.
            Build apps to meet their needs, faster </p>
        </div>
      </div>
      <SectionWhyReact />
      <SectionWorkflow />
      <SectionIntegration />
      <SectionRecentWorks />
      <SectionWhyUs />
    </main>
  )
}

export default Mobile
