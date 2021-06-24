import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Hire.module.css'
import Head from 'next/head'

const SectionRecentWorks: FC = () => (
  <div className="mt-20">
    <div className="m-auto">
    
    </div>
  </div>

)
const SectionWorkflow: FC = () => (
  <div className="mt-20 py-24 bg-gray-100">
    <div className="max-w-7xl m-auto  px-5">
      <h3 className="max-w-2xl text-3xl text-center m-auto">
      Why Hiring Reactjs developers<br /> through Havafy is risk-free?</h3>
      <p className="max-w-xl m-auto mt-5 text-base text-center">
      Work with remote Reactjs developers as you need them, 
      from full-time dedicated engineering team to on-demand needs.
          </p>
      <ul className="checkedListBig italic m-auto max-w-3xl text-gray-700">
        <li><b>Handles end-to-end hiring & hosting aspects</b> at our premises</li> 
        <li><b>Agile Development Methodology</b> to scale your project quickly and smoothly</li> 
        <li><b>Highest standards of security and IP rights protection</b> with enterprise-grade firewall</li> 
        <li><b>24 x 7 effective communication</b> to make you aware about your project’s progress</li> 
        <li><b>Low employee turnover rate due</b> to effective training and development programmes</li> 
        <li><b>Dedicated Customer Success Manager</b>  solely devoted to handle your project</li> 
        <li><b>Two-week risk-free trial.</b> Full refund when dissatisfied.</li> 
      </ul>
    </div>
  </div>
)
const SectionWhyUs: FC = () => (
  <div className="bg-gray-100 lg:mt-20 lg:py-24 py-20">
    <div className="mx-auto max-w-5xl  text-center">
      <div className="headTitleTop tracking-wider font-semibold  text-3xl lg:text-xl m-auto max-w-2xl text-gray-800">
      Wide-range of <span className="heading-red">Our Developers</span> 
          </div>
      <p className=" px-5 lg:px-0 max-w-3xl text-xl text-gray-700 m-auto">

      
      Our Developers can help you build project from Web to Mobile App, includes CMS website, developing powerful PWAs, 
      custom business applications, e-commerce, and SaaS applications. </p>

      <div className="iconItems px-10 lg:px-0 my-12 md:grid md:grid-cols-3 md:gap-8">
        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/Magento.svg" />
          <h3 className="title">Magento Developers</h3>
          <p className="des">
          We know how to collaborate effectively on Magento, and you can be sure our cooperation will go smoothly.
            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/NodeJS.svg" />
          <h3 className="title">Node Js Developers</h3>
          <p className="des">
          Node.js lets you use JS on the back-end and the front-end, 
          speeding up development and reducing maintenance costs with shared code.

            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/PHP.svg" />
          <h3 className="title">PHP Developers</h3>
          <p className="des">
          We have more than 10 years of experience in PHP frameworks, such as Laravel, Wordpress, Symfony
          We know its tricks and it makes us productive. 
            </p>
        </div>

        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/React.svg" />
          <h3 className="title">React Js Developers</h3>
          <p className="des">
          React is the main technology we use to write front-ends. 
          Many of our projects are in React, with our years of experience, your web app can shine.

            </p>
        </div>

        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/ReactNative.svg" />
          <h3 className="title">React Native Developers</h3>
          <p className="des">
          React Native maximizes code reuse between platforms while keeping the UI native,
           cutting development and maintenance costs in half.

            </p>
        </div>
        <div className="item">
          <img className="max-h-20 inline" src="/pages/TechStacks/Shopify.svg" />
          <h3 className="title">Shopify Developers</h3>
          <p className="des">
       We have 3+ years experience Shopify development, include Shopify Store Setup & Customisation, Shopify Theme Development,
           Migration to Shopify, and Back-end Management services.
            </p>
        </div>



      </div>
      <div className=" px-10 lg:px-0 text-base m-auto max-w-2xl text-gray-600">
        Why do we claim so? Well, we know cross-platform app development at its core. With our team of multi-disciplined talents and the latest technology, we bring your application ideas to life.
          </div>
      <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
    </div>

  </div>
)
const SectionIntegration: FC = () => (

  <div className={s.technicalSection}>
    <div className="mt-24  max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-1 ">
        <div className=" flex justify-end">
          <div className="lg:w-18/12  px-5">
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
      <img className="max-w-20 shadow-lg container" src="/pages/reactjs/web_reactjs_demo.png" />

      </div>
    </div>
  </div>

)
const SectionFeatures : FC = () => (
  <div className="mt-24 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
    <div className="md:col-span-1 ">
      <div className=" flex justify-end">
        <div className="lg:w-11/12 px-5">
          <h3 className="text-4xl">
          Hiring Developers is Easier than Ever!
          </h3>
          <p className="text-xl text-gray-600 my-10">
            <p>
            Hiring Technical talent is hard! Havafy structures and vets highly proactive 
            and motivated developers that work as your team.
            <br/> <br/>
            
             You can bank on our developers to help you ship products faster,
              scale your team, and grow your business.
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
const Hire: FC = () => {
  return (
    <main className="">
      <Head>
        <title>Hire Developers</title>
      </Head>
      <div className={s.headBox}>
        <div className={s.headBox_wrap}>
          <h1>Hire Developers<br />  to build innovative experiences </h1>
          <p>
          We are helps you effortlessly hire top Reactjs
           developers for scalable web development projects.
            Growing brands hire remote React Developers. </p>
        </div>
      </div>
      <SectionFeatures />
      <SectionWorkflow />
      <SectionIntegration />
      <SectionRecentWorks />
      <SectionWhyUs />
    </main>
  )
}

export default Hire
