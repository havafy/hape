import { FC } from 'react'
import Link from 'next/link'
import { Logo, Container } from '@components/ui'
import { Burger, UserNav } from '@components/common'
import { Hape } from '@components/icons'
import NavbarRoot from './NavbarRoot'
import s from './Navbar.module.css'
interface Props {
  darkMode?: boolean 
}
const Navbar: FC<Props> = ({darkMode}) => (
  <NavbarRoot>
    <Container>
      <div className="siteNavbar relative flex flex-row justify-between px-5 py-1 sm:py-1  align-center  ">
        <div className="flex items-center">
          <Link href="/">
            <a className={s.logo} aria-label="Logo">
              <Hape fill="#DB4140" width="80px" />
            </a>
          </Link>

          <ul className="navMenu 2xl:ml-36 xl:ml-30 lg:ml-10 space-x-4  sm:block hidden">
            <li>
              <Link href="/page/about-us">
                <a className={s.link}>About us</a>
              </Link>
            </li>
            <li className="dropdown">
              <Link href="/page/Magento-Development-Services">
                <a className={s.link}>Services</a>
              </Link>
              <div className="submenu">
                <ul>
                <li>
                    <Link href="/page/Magento-Development-Services" >
                      <a className="pale-grey-four">
                        <div className="icon">
                          <img
                            src="/pages/services/magento.png"
                            alt="Magento Development Services"
                          />
                        </div>
                        <div className="title">
                          Magento Development Services
                        </div>
                      </a>
                    </Link>
                  </li>
                  <li>
                  <Link href="/page/Mobile-Application-Development-Services" >
                    <a className="pale-grey-four"   >
                      <div className="icon">
                        <img
                          src="/pages/services/user-interface.svg"
                          alt="Mobile Application Development Services"
                        />
                      </div>
                      <div className="title">
                        Mobile Application Development Services
                      </div>
                    </a></Link>
                  </li>
    
                  <li>
                  <Link href="/page/ReactJs-Development-Services/" >
                    <a
                      className="pale-grey-four"
                    >
                      <div className="icon">
                        <img
                          src="/pages/services/reactjs.png"
                          alt="ReactJs Development Services"
                        />
                      </div>
                      <div className="title">ReactJs Development Services</div>
                    </a></Link>
                  </li>
                  <li>
                  <Link href="/page/Hire-Magento-ReactJs-Developers/" >
                    <a
                      className="pale-grey-four"
                    >
                      <div className="icon">
                        <img
                          src="/pages/services/web-development.svg"
                          alt="Hire Magento/ReactJs Developers"
                        />
                      </div>
                      <div className="title">Hire Magento/ReactJs Developers</div>
                    </a></Link>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <Link href="/page/Hire-Magento-ReactJs-Developers">
                <a className={s.link}>Hire Developers</a>
              </Link>
            </li>
            {/* <li>
              <Link href="/page/demo">
                <a className={s.link}>Demo</a>
              </Link>
            </li> */}
            <li>
              <Link href="/blog">
                <a className={s.link_last}>Blog</a>
              </Link>
            </li>
          </ul>
        </div>

        <div className="sm:flex hidden justify-end flex-1 space-x-8 ">
          <UserNav />
        </div>
        <div className="sm:hidden flex justify-end flex-1 space-x-8 ">
          <Burger />
        </div>
      </div>
    </Container>
  </NavbarRoot>
)

export default Navbar
