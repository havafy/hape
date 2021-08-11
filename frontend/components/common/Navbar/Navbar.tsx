import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import { Logo, Container } from '@components/ui'
import { SearchInput, UserNav } from '@components/common'
import { Hape } from '@components/icons'
import { Burger as BurgerIcon } from '@components/icons'

import NavbarRoot from './NavbarRoot'
import s from './Navbar.module.css'
import CategoryMenu  from './CategoryMenu'
interface Props {
  darkMode?: boolean;
  hideHeader?: boolean;
}

const Navbar: FC<Props> = ({darkMode, hideHeader}) => (
  <>
  { !hideHeader && <NavbarRoot>
    <Container>
      <div className="siteNavbar relative grid grid-cols-12 justify-between align-center  ">
        <div className="col-span-3 md:col-span-1 items-center pl-2">
          <Link href="/">
            <a className={s.logo} aria-label="Logo">
              <Hape fill="#DB4140" className="w-16 md:w-20" />
            </a>
          </Link>
          </div>
          <div className="col-span-6 hidden md:block">
            <ul className="navMenu mt-3 ml-10 space-x-5">
                {/*<li className="dropdown">
                  <span className={s.link}><BurgerIcon /></span>
                <div className="submenu">
             <i className="header-popover-arrow" style={{'transform': `translate(0px, 0px)`, 'right': `15px`}}></i>
                  <CategoryMenu />
                </div>
              </li>
              
  */}
                
              <li>
                <Link href="/c/Thực-phẩm-và-đồ-uống.200647">
                  <a className={s.link}>Hữu Cơ</a>
                </Link>
              </li>
              <li>
                <Link href="/c/Thực-phẩm-đóng-hộp.200801">
                  <a className={s.link}>Đồ khô & hộp</a>
                </Link>
              </li>

              <li>
                <Link href="/c/Kẹo.200785">
                  <a className={s.link}>Bánh Kẹo & Uống</a>
                </Link>
              </li>
              <li>
                <Link href="/c/Gia-vị-Hương-liệu.200804">
                  <a className={s.link}>Nguyên liệu & gia vị</a>
                </Link>
              </li>
              <li>
                <Link href="/c/Đông-Lạnh.200802">
                  <a className={s.link}>Đông Lạnh</a>
                </Link>
              </li>
            </ul>
          </div>
        
          <div className="col-span-5 md:col-span-2 searchBar">
           <SearchInput />
          </div>

   
          <div className="col-span-4 md:col-span-3 justify-end">
            <div className="justify-end flex-1 space-x-8 ">
              <UserNav />
            </div>

          </div>
      </div> 
    </Container>
  </NavbarRoot>
}</>
)

export default Navbar
