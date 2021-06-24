import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './React.module.css'
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
      We make sure you stay <span className="heading-red">involved</span></h3>
      <p className="max-w-xl m-auto mt-5 text-base text-center">
      We are the best ReactJS development 
      company performing efficiently attaining our clients' business objectives.
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

      <div className="iconItems px-10 lg:px-0 my-12 md:grid md:grid-cols-3 md:gap-8">
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/data-storage.svg" />
          <h3 className="title">React Migration Services</h3>
          <p className="des">
          Migrate your current application’s frontend to the latest version of React and enjoy the benefits of component reusability.

            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/pwa.svg" />
          <h3 className="title">High-performing PWAs</h3>
          <p className="des">
          Build world-class PWAs that boost the conversion rate in whatever segment your business lies.

            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/shopping.svg" />
          <h3 className="title">Reactjs eCommerce Development</h3>
          <p className="des">
          Multiply your eCommerce business with the power of Reactjs and experience an increase in revenue.
            </p>
        </div>

        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/pie-chart.svg" />
          <h3 className="title">Enterprise Web Development</h3>
          <p className="des">
          Fuel your Enterprise business objectives with React architecture and optimize major workflows.

            </p>
        </div>

        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/plugins.svg" />
          <h3 className="title">Reactjs Plugins Development</h3>
          <p className="des">
          Leverage the power of Reactjs to build plugins that seamlessly integrate with your existing web app.


            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/services/webpage.svg" />
          <h3 className="title">Reactjs Dashboard Development</h3>
          <p className="des">
          Use the popular Reactjs ecosystem to build dynamic dashboards that perform and help you visualize the data.

            </p>
        </div>



      </div>
      <div className="px-10 lg:px-0 text-base m-auto max-w-2xl text-gray-600">
        Why do we claim so? Well, we know cross-platform app development at its core. With our team of multi-disciplined talents and the latest technology, we bring your application ideas to life.
          </div>
      <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
    </div>

  </div>
)
const SectionIntegration: FC = () => (

  <div className={s.technicalSection}>
    <div className="lg:mt-24 mt-10 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-1 ">
        <div className=" flex justify-end">
          <div className="lg:w-18/12 px-5">
            <div className="headTitleTopLeft heading-red font-bold text-base uppercase">Case Studies</div>
            <h3 className="text-3xl">Our recent projects built with React</h3>
            <p className="text-base text-gray-600 my-10 mr-10">
    
We developed Kita, a Slack chatbot that aims to build strong 
relationships within distributed and remote teams by sparking communication among teammates. 
<br/> <br />
Kita is a great way to help teams become more efficient. 
Additionally, Kita allows HR departments to receive feedback from their employees.
            </p>
          </div>
        </div>
      </div>
      <div className="md:col-span-1 ">
      <img className="max-w-20 shadow-lg container" src="/pages/reactjs/web_reactjs_demo.png"  />

      </div>
    </div>
  </div>

)
const SectionWhyReact: FC = () => (
  <div className="mt-10 lg:mt-24 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
    <div className="md:col-span-1 ">
      <div className=" flex justify-end">
        <div className="lg:w-11/12 px-5">
          <h3 className="text-4xl">
          React is our tech
          </h3>
          <p className="text-xl text-gray-600 my-10">

            <p>

React is the main technology we use to write front-ends.<br/>
 Many of our projects are in React, we contribute to the open-source community, 
 and give lectures on it, too. 
 <br/><br/>
 With our years of experience, your web app can shine.
             
</p>

          </p>
        </div>
      </div>
    </div>
    <div className="md:col-span-1 lg:pl-20">

      <img src="/pages/reactjs/nodejs-reactjs-mongodb.png" className="container" />
    </div>
  </div>

)
const ReactJs: FC = () => {
  return (
    <main className="">
      <Head>
        <title>ReactJs Development to build innovative experiences</title>
      </Head>
      <div className={s.headBox}>
        <div className={s.headBox_wrap}>
          <h1>ReactJs Development <br /> 
          to build innovative experiences</h1>
          <p>
          Offering a wide-range of ReactJS mobile app and web development services globally.
           </p>
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

export default ReactJs
