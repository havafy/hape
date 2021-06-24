import { FC } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import getSlug from '@lib/get-slug'
import { Github, Facebook, Linkedin, Hape } from '@components/icons'
import { Logo, Container } from '@components/ui'
import { I18nWidget } from '@components/common'
import s from './Footer.module.css'

const Footer: FC = () => (

  <footer className={s.footer}>
    <Container>
      <div className="px-5 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-24 pb-20 transition-colors duration-150">
        <div className="col-span-3 lg:col-span-3">
          <Link href="/">
            <a className="flex flex-initial items-center">
              <span className="rounded-full mr-2">
                <Hape width="110px" fill="#fff" />
              </span>
            </a>
          </Link>

          <div className="mt-10 flex items-start ">
            <div className="iconSocial flex space-x-6 items-center h-10">
              <a
                aria-label="Havafy Fanpage"
                href="https://www.facebook.com/Havafy-104721788477037/"
                target="_blank"
                className={s.menu}
              >
                <Facebook fill="#999" />
              </a>
              <a
                aria-label="Havafy's Linkedin"
                href="https://www.linkedin.com/company/74118757"
                target="_blank"
                className={s.menu}
              >
                <Linkedin fill="#999" />
              </a>
              <a
                aria-label="Github Repository"
                href="https://github.com/havafy"
                target="_blank"
                className={s.menu}
              >
                <Github fill="#999" />
              </a>

            </div>
          </div>
          <div className="mt-10 text-right flex">
            <span className="mr-3">
              <a href="https://www.havafy.vn" >
                <img src="/assets/country/VN.svg" width="25px" />
              </a></span>
            <span className="font-semibolb text-white">
              <a href="https://www.havafy.vn" >
                Tiếng Việt - VN</a>
            </span>
          </div>

        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">
            <li className={s.menu}>
              <Link href="/">
                <a >
                  About Us
                </a>
              </Link>
            </li>
            <li className={s.menu}>
              <Link href="/contact">
                <a>
                  Contact
                </a>
              </Link>
            </li>
            <li className={s.menu}>
              <Link href="/page/demo">
                <a>
                  Demo
                </a>
              </Link>
            </li>
            <li className={s.menu}>
              <Link href="/page/Hire-Dedicated-Developers">
                <a>
                  Hire Developers
                </a>
              </Link>
            </li>

          </ul>
        </div>
        <div className="col-span-1 lg:col-span-2">
          <ul className="flex flex-initial flex-col md:flex-1">

            <li className={s.menu}>
              <Link href="/page/Mobile-Application-Development-Services">
                <a>
                  Mobile Development
                </a>
              </Link>
            </li>
            <li className={s.menu}>
              <Link href="/page/Magento-Development-Services">
                <a>
                  Magento Development
                </a>
              </Link>
            </li>
            <li className={s.menu}>
              <Link href="/page/ReactJs-Development-Services/">
                <a>
                  ReactJs Development
                </a>
              </Link>
            </li>

          </ul>
        </div>
        <div className="col-span-1 lg:col-span-1">

        </div>
        <div className="col-span-3 lg:col-span-4 lg:justify-end text-gray-600">

          <h3 className="text-sm text-white uppercase font-bold tracking-wide mb-4">Let's keep in touch!</h3>
          <div className="md:grid md:grid-cols-3 md:gap-2">
            <div className="md:col-span-2">
              <input placeholder="Enter your email address" type="email"
                className="border-blueGray-600 px-3 py-3 text-base shadow w-full placeholder-blueGray-200 text-blueGray-700 relative bg-white rounded-md outline-none focus:ring focus:ring-lightBlue-500 focus:ring-1 focus:border-lightBlue-500 border border-solid transition duration-200 "
              />
            </div>
            <div className="mt-5 md:mt-0 md:col-span-1">
              <button
                className="inline-block shadow flex items-center justify-center px-4 py-3 border border-transparent font-semibold rounded-md text-white bg-yellow-600 hover:bg-yellow-700 md:py-3 text-base md:px-5 text-white">Sign in</button>
            </div>
          </div>
          <div className="mt-3 tracking-wide text-sm text-gray-400">
            Join our newsletter to know all the ecommerce trends. <br />
            Please note that your consent is voluntary and you are under no obligation to opt-in.
            <br />

          </div>
        </div>
      </div>

    </Container>
    <div className={s.copyright}>
      <div>
        <span>&copy; 2021 Havafy, Inc. All rights reserved.</span>
      </div>

    </div>
  </footer>
)

export default Footer
