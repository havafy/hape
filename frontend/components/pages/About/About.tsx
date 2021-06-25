import { FC, useState, ChangeEvent } from 'react'
import Link from 'next/link'
import s from './About.module.css'
import Head from 'next/head'

const About: FC = () => {

  return (
    <main className="">
      <Head>
        <title>About Havafy - As a full service eCommerce agency.</title>
      </Head>
      <div className={s.headBox}>
        <h1 className="">
          <span className="highlight leading-5">Hi. We’re Havafy,</span><br />
          <span className="highlight leading-5">As a full service eCommerce agency.</span></h1>

      </div>
      <div className="px-5 mx-auto max-w-7xl">


        <div className={s.headTitle}>
          The extended team that is part of your team
        </div>
        <p className={s.introText}>Nearly every organization will need to become a tech company in order to compete tomorrow. Yes, even yours. At Havafy, we are on a mission to help companies develop competitiveness and agility using the software.
           <br /><br />
           Havafy helps companies become innovation leaders by <strong>delivering software teams</strong> on demand. Our teams help you decide the right architecture and processes to follow and oversee the successful delivery of your software projects.
           </p>
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1">
          <img src="/pages/about/why_us.jpeg" className="container" />
        </div>
        <div className="md:col-span-1 pl-10 lg:pl-20 mt-20 ">
          <h3 className="text-4xl">We help you<br />see around corners.</h3>
          <p className="text-xl text-gray-600 my-10 w-9/12">Don’t feel like you’re on an island making decisions in the dark. There’s a lot of things factoring into what makes or breaks an eCommerce website.
              <br /><br />
              With over a decade of experience, let us help you dodge landmines that could cost your business valuable time and money. Don’t be someone’s guinea pig. You deserve better.
                </p>
        </div>
      </div>
      <div className="mt-20 lg:mt-52 md:grid md:grid-cols-2 md:gap-6">
        <div className="md:col-span-1 ">
          <div className=" flex justify-end">
            <div className="lg:w-9/12 mx-10 lg:mx-0">
              <h3 className="text-4xl">We help you<br />see around corners.</h3>
              <p className="text-xl text-gray-600 my-10">Don’t feel like you’re on an island making decisions in the dark. There’s a lot of things factoring into what makes or breaks an eCommerce website.
              <br /><br />
              With over a decade of experience, let us help you dodge landmines that could cost your business valuable time and money. Don’t be someone’s guinea pig. You deserve better.
                </p>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 lg:pl-20">

          <img src="/pages/about/why_us2.jpeg" className="container" />
        </div>
      </div>

      <div className="bg-gray-100 lg:mt-20 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-3xl font-bold m-auto max-w-2xl text-center text-gray-800">
            Each of our values is aligned with what will guide us to achieve our mission
          </div>
          <div className="my-12 md:grid md:grid-cols-3 md:gap-8">
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Mission</h3>
              <p className="text-base text-gray-600">We are purpose-driven people,
              dedicated to serving something beyond ourselves.
              Having mission as a value also allows us
              to continually ground ourselves in why we’re building Havafy.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Do great things, fast</h3>
              <p className="text-base text-gray-600">We commit to being great at the things we do and doing them fast, without sacrificing one for the other.
            </p>
            </div>
            <div className="md:col-span-1 px-12 py-10 bg-white shadow-md">
              <h3 className="font-semibold text-xl mb-3">Mindfulness</h3>
              <p className="text-base text-gray-600">We focus on the present and aim to give ourselves time to reflect and space to integrate what we learn. These practices allow us to collectively learn from and improve in all that we do, and to continually evolve our culture.
            </p>
            </div>
          </div>
          <div className="text-center">
            <Link href="/contact"><a className="button arrow text-xl mt-12 mb-10">Get in touch</a></Link>
          </div>
        </div>

      </div>
    </main>
  )
}

export default About
