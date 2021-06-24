import { FC } from 'react'
import Link from 'next/link'
import s from './Home.module.css'
import { TechStacks } from '@components/common'
import { useAuth } from '@context/AuthContext';
const HomeContent: FC = () => {
  const { user, login, logout, userName } = useAuth();

  return (
  <main className="pt-20 sm:mt-20 md:pt-32">
        <div className="bg-gray-400">
                <h1>Hello: {userName}</h1>
                    <h2>User: {user ? "login" : "logout"}</h2>
                    <div>
                        <button onClick={login}>Login</button>
                        <button onClick={logout}>Logout</button>
                    </div>
                </div>

    <div className="mx-auto max-w-7xl">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-2">
          <div className="px-4 sm:px-0">
            <TextIntro />
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-1">
          <img src="/pages/home/dff3d7.png" />
        </div>
      </div>
    </div>
    <TrustClients />
    <OneSection />
    <TechStacks />
    <ThirdSection />
    <WhyChoose />
    <ContactBox />
  </main>
)
}

const ContactBox: FC = () => (
<div className="px-5">
  <div className="bg-white lg:text-right text-center shadow-xl rounded-lg mx-auto max-w-7xl px-7 py-7 mb-16 mt-0 lg:mt-24   md:grid md:grid-cols-10 md:gap-6">
    <div className="col-span-6">
      <div className="py-2 sm:px-0 text-2xl align-middle">
        Do more of the marketing work you love. Let us help you get started.
        </div>
    </div>
    <div className="col-span-4 pt-10 lg:pt-2">
      
      <Link href="/contact"><a className="text-xl button arrow font-bold inline">
      Let’s work together
            </a></Link>
    </div>
  </div>
  </div>

)
const WhyChoose: FC = () => (
  <div className=" mx-auto max-w-4xl m-16 px-7 py-7">
    <div className="justify-center text-center">
      <h4 className="text-sm font-semibold text-gray-500 tracking-wider mb-3">Always growing and committed to quality</h4>
      <h3 className="text-5xl tracking-tight font-medium text-gray-900 sm:text-3xl mb-10">
        <span className="block xl:inline">Why choose <span className="h-highlight">Havafy</span></span>

      </h3>
      <p className="mt-4 text-gray-700 text-lg">
        We understand that every business has a unique requirement and thus provide
        you custom eCommerce development solutions that cater to your specific business needs.
          Our services bring value to your business irrespective of the size of your company.<br />
          We ensure that your website is built with a well-thought-out strategy and a robust technology
          stack with a user-friendly UI that offers an exceptional digital experience to your customers.
        </p>

    </div>
  </div>

)
const OneSection: FC = () => (
  <section className="mt-16 px-5 py-20 relative bg-gray-100">
    <div className="mx-auto max-w-7xl pt-18 md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <img src="/pages/home/sections/web_demo.png" className="container sm:max-w-xl" />
        </div>
      </div>
      <div className="mt-28 md:col-span-1">
        <h4 className="text-sm text-gray-500 tracking-wider mb-1">Magento Development</h4>
        <h3 className="text-4xl tracking-tight font-medium text-gray-900 sm:text-3xl md:text-4xl">
          <span className="block xl:inline">Transform and Grow Your Business</span>

        </h3>
        <p className="mt-3 text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
        Havafy provides tailored solution packages to help you meet your eCommerce goals. Whether it’s just to make sure your Magento website is running property, or if you have aggressive goals to hit, Havafy can help.
                    </p>
                    <Link href="/page/Magento-Development-Services">
  <a className="mt-8 font-bold button arrow">More detail</a>
</Link>
      </div>
    </div>
  </section>
)

const ThirdSection: FC = () => (
  <section className="mt-16 px-5 py-16 relative bg-gray-100">
    <div className="mx-auto max-w-7xl sm:pt-10 pt-0 md:grid md:grid-cols-2 md:gap-6">
      <div className="md:col-span-1">
        <div className="sm:py-28 py-8">
          <h4 className="text-sm text-gray-500 tracking-wider mb-1">Mobile Development</h4>
          <h3 className="text-4xl tracking-tight font-medium text-gray-900 sm:text-3xl md:text-4xl">
            <span className="block xl:inline">Build innovative experiences</span>
            

          </h3>
          <p className="mt-3 text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
          In a mobile-first world, customers and workers want more ways to engage with your brand. Build apps to meet their needs, faster
                      </p>
        </div>
      </div>
      <div className="mt-5 md:mt-0 md:col-span-1">
        <img src="/pages/home/sections/app_demo.png" className="container sm:max-w-xl" />
      </div>
    </div>
 
  </section>
)
const TrustClients: FC = () => (
  <div className="px-5 mx-auto max-w-7xl mb-16 mt-32 sm:text-center lg:text-left">
    <h3 className="text-2xl tracking-tight font-light text-gray-900 sm:text-3xl md:text-2xl">
      <span className="block xl:inline">See why more than a 100 clients trust Havafy</span>
    </h3>
    <p className="mt-3 grid gap-4 grid-cols-3 lg:grid-cols-6">
      <img src="/pages/home/client1.png" className="w-24 mr-24 mt-5" />
      <img src="/pages/home/client2.png" className="w-24 mr-24 mt-5" />
      <img src="/pages/home/client3.png" className="w-24 mr-24 mt-5" />
      <img src="/pages/home/client4.png" className="w-24 mr-24 mt-5" />
      <img src="/pages/home/client5.png" className="w-24 mr-24 mt-5" />
    </p>
  </div>
)
const TextIntro: FC = () => (
  <div className="text-center lg:text-left px-5">
    <h1 className="text-4xl tracking-tight font-semibold text-gray-900 sm:text-5xl md:text-5xl">
      Hi. We’re Havafy,<br />
As a full service  <span className="heading-red">eCommerce agency.</span>
    </h1>
    <p className="mt-3 text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
      Changing Ecommerce Landscape Worldwide with Our
      Unparalleled Ecommerce Domain Expertise.
  </p>
    <div className="mt-10">
      <div>
        <Link href="/contact">
          <a className="button font-bold arrow">
          Let’s work together
      </a></Link>
      </div>
    </div>
  </div>
)

export default HomeContent
