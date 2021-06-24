import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './Magento.module.css'

import Head from 'next/head'
const Magento: FC = () => {
  return (
    <main className="">
            <Head>
        <title> Magento Development Transform and Grow Your Business</title>
      </Head>
      <div className={s.headBox}>
        <div className={s.headBox_wrap}>
          <h1>
            Magento Development<br />
    Transform and Grow Your Business
    </h1>
          <p>
            Join 230+ tech leaders who have built applications
            with our custom software development company.
            Engage product design and development experts.
    </p>
        </div>
      </div>
      <div className="mt-24 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1 ">
          <div className=" flex justify-end">
            <div className="lg:w-11/12 px-5">
              <h3 className="text-4xl">Custom Tailored Solutions<br /> to Meet Your Goals</h3>
              <p className="text-xl text-gray-600 my-10">

                <p>Havafy provides tailored solution packages to help you meet your eCommerce goals.
                Whether it’s just to make sure your Magento website is running property,
                or if you have aggressive goals to hit, Havafy can help.</p>

              </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 lg:pl-20">

          <img src="/pages/services/magento_workflow.png" className="container" />
        </div>
      </div>

      <div className="mt-20 lg:py-24 bg-gray-100">
        <div className="max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
          <div className="md:col-span-1 lg:mb-10 lg:mb-0">
            <img src="/pages/services/magento_demo.png" className="container"  />
          </div>
          <div className="md:col-span-1 lg:pl-10">

            <div className=" flex justify-end">
              <div className="lg:w-11/12 px-5 lg:px-0 py-10">
                <h3 className="text-4xl">Development & Support</h3>
                <p className="text-base text-gray-600 mt-10">
                  <p className="my-5">Havafy provides custom-tailored solutions to help.
                  Whether it’s just about ensuring your Magento website is running properly,
                of if you have aggressive goals to hit, Havafy can help.</p>
                  <ul className="checkedList">
                    <li>Security & Patch Updates</li>
                    <li>Custom Module Development</li>
                    <li>24/7 Emergency Support</li>
                    <li>Performance/Speed</li>
                    <li>Bug fixes & Site Updates</li>
                    <li>Integrations (ERP, PIM, Market Places, Marketing Automation)</li>
                    <li>Compliance Implementation (PCI, ADA, GDPR, Tax)</li>
                    <li>Campaign Support</li>
                    <li>Testing Plans</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 lg:mt-25 max-w-7xl m-auto md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1 ">
          <div className=" flex justify-end">
            <div className="lg:w-18/12 px-5">
              <h3 className="text-4xl">Research, Usability, & Design</h3>
              <p className="text-base text-gray-600 my-10">

                <p className="mb-5 lg:mr-20">Not sure what’s helping or hindering the success of your Magento store?
                Find out exactly what’s stopping you from selling more on your Magento site.
                Our UX and research services
                   allows you to identify where customers are struggling on your site and how to improve them.</p>
                <ul className="checkedList">
                  <li>Customer Experience Strategy</li>
                  <li>A/B Testing</li>
                  <li>User Testing</li>
                  <li>Search Optimization</li>
                  <li>Merchandising</li>
                  <li>Content Strategy</li>
                  <li>Mobile First Strategy</li>
                </ul>


              </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 ">
          <img src="/pages/about/developers-timeline.png" className="container"/>

        </div>
      </div>


      <div className="bg-gray-100 mt-20 py-24">
        <div className="mx-auto max-w-5xl  text-center">
          <div className="headTitleTop tracking-wider font-semibold text-xl m-auto max-w-2xl text-gray-800">
            WHY PARTNER WITH HAVAFY?
          </div>
          <p className="max-w-lg text-3xl m-auto">
            We don’t just see the big picture - we <span className="heading-red font-bold">plan, create, test</span>, and show you different ways
            of looking at the picture.</p>

          <div className="my-12 md:grid md:grid-cols-3 md:gap-8">
            <div className="md:col-span-1 px-12 py-10">
              <img className="max-h-20 inline" src="/pages/services/development/web-traffic.svg" />
              <h3 className="text-xl mt-5 mb-3 text-gray-600">DATA-DRIVEN APPROACH</h3>
              <p className="text-base italic text-gray-500">A strategic approach that is rooted in your data.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10">
            <img className="max-h-20 inline" src="/pages/services/development/experience.svg" />
              <h3 className=" text-xl mt-5 mb-3 text-gray-600">MOST <br/>EXPERIENCED</h3>
              <p className="text-base italic text-gray-500">10+ Magento certified eCommerce experts.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10">
            <img className="max-h-20 inline" src="/pages/services/development/customer-service.svg" />
              <h3 className="text-xl mt-5 mb-3 text-gray-600">EXTENSION OF YOUR TEAM</h3>
              <p className="text-base italic text-gray-500">A team readily available to assist you 24/7.
            </p>
            </div>
          </div>
          <div className="text-base m-auto max-w-2xl text-gray-600">
          We know a pretty website alone can’t be the sole revenue driver. 
          That’s why through our Magento eCommerce services you discover opportunities
           for growth that you never knew existed. Why should you believe us? 
           Because we are the most experienced Magento consultants,
           having launched more M2 websites on this continent than any other agency. 
           It’s as simple as that
          </div>
          <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
        </div>

      </div>
    </main>
  )
}

export default Magento
