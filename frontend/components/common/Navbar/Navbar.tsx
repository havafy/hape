import { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import { Logo, Container } from '@components/ui'
import { Burger, UserNav } from '@components/common'
import { Hape } from '@components/icons'
import { Burger as BurgerIcon } from '@components/icons'
import NavbarRoot from './NavbarRoot'
import s from './Navbar.module.css'
interface Props {
  darkMode?: boolean 
}

import { Input, AutoComplete } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const renderTitle = (title: string) => (
  <span>
    {title}
    <a
      style={{ float: 'right' }}
      href="/search?q=antd"
      target="_blank"
      rel="noopener noreferrer"
    >
      more
    </a>
  </span>
);

const renderItem = (title: string) => ({
  value: title,
  label: (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      {title}

    </div>
  ),
});

const options = [
  {
    label: renderTitle('Libraries'),
    options: [renderItem('AntDesign'), renderItem('AntDesign UI')],
  },
  {
    label: renderTitle('Solutions'),
    options: [renderItem('AntDesign UI FAQ'), renderItem('AntDesign FAQ')],
  },
  {
    label: renderTitle('Articles'),
    options: [renderItem('AntDesign design language')],
  },
];

const SearchBarComplete: React.FC = () =>{
const router = useRouter() 
const handleSearch = (value: string) => {
  router.push('/search?k='+value)
}
return (
  <AutoComplete
    dropdownClassName="certain-category-search-dropdown"
    dropdownMatchSelectWidth={300}
    style={{ width: 300 }}
    options={options}
    onSearch={handleSearch}
  >
    <Input.Search size="large" placeholder="Tìm sản phẩm" />
  </AutoComplete>
)
}
const Navbar: FC<Props> = ({darkMode}) => (
  <NavbarRoot>
    <Container>
      <div className="siteNavbar relative grid grid-cols-12 justify-between px-5  align-center  ">
        <div className="col-span-1 items-center">
          <Link href="/">
            <a className={s.logo} aria-label="Logo">
              <Hape fill="#DB4140" width="80px" />
            </a>
          </Link>
          </div>
          <div className="col-span-5">
            <ul className="navMenu mt-4 ml-10 space-x-4 block">
            <li className="dropdown">
                <Link href="/page/Magento-Development-Services">
                  <a className={s.link}><BurgerIcon /></a>
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
                <Link href="/page/about-us">
                  <a className={s.link}>Khuyến Mãi</a>
                </Link>
              </li>
  
              <li>
                <Link href="/page/about-us">
                  <a className={s.link}>Mã giảm giá</a>
                </Link>
              </li>
              <li>
                <Link href="/page/about-us">
                  <a className={s.link}>Bán Chạy</a>
                </Link>
              </li>
              <li>
                <Link href="/page/Hire-Magento-ReactJs-Developers">
                  <a className={s.link}>Dọn kho</a>
                </Link>
              </li>

            </ul>
          </div>
        
          <div className="col-span-3 searchBar">
           <SearchBarComplete />
          </div>

   
          <div className="col-span-3">
            <div className="sm:flex hidden justify-end flex-1 space-x-8 ">
              <UserNav />
            </div>
            <div className="sm:hidden flex justify-end flex-1 space-x-8 ">
              <Burger />
            </div>
          </div>
      </div>
    </Container>
  </NavbarRoot>
)

export default Navbar
