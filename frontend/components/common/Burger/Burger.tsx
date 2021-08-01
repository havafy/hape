import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { Burger as BurgerIcon } from '@components/icons'
import { Hape } from '@components/icons'
import s from './Burger.module.css'
import { Drawer, Collapse } from 'antd';
const { Panel } = Collapse;
const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;
interface Props {
  className?: string
}
const Burger: FC<Props> = ({ className }) => {
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const handleClick = (url: string) => {
    router.replace(url)
    setVisible(false)
  }
  return (
    <div className="burgerMenu">
      <div className="flex cursor-pointer pt-1" onClick={(e: any) => setVisible(true)} >
        <BurgerIcon fill="#333" width="26" height="26" />


      </div>
      <Drawer className="burgerMenuDrawer"
        title="Basic Drawer"
        placement={'left'}
        width={'85%'}
        closable={false}
        onClose={e => setVisible(false)}
        visible={visible}
      >
        <Hape fill={"#DB4140"} width={'120px'} onClick={() => handleClick('/')} />

        <div className={s.menuBox}>
          <div className={s.menuItems}>
            <a onClick={() => handleClick('/page/about-us')}>About us</a>
          </div>
          <Collapse defaultActiveKey={['1']} ghost>
            <Panel className={'menuDropdown'} header="Services" key="1">
              <div className={s.menuSubItems}>
                <a onClick={() => handleClick('/page/Magento-Development-Services')}>Magento Development</a>
              </div>
              <div className={s.menuSubItems}>
                <a onClick={() => handleClick('/page/Mobile-Application-Development-Services')}>Mobile Application Development </a>
              </div>
              <div className={s.menuSubItems}>
                <a onClick={() => handleClick('/page/ReactJs-Development-Services')}>ReactJs Development</a>
              </div>
            </Panel>
          </Collapse>
          <div className={s.menuItems}>
            <a onClick={() => handleClick('/page/Hire-Magento-ReactJs-Developers')}>Hire Developers</a>
          </div>

          <div className={s.menuItems}>
            <a onClick={() => handleClick('/blog')}>Blog</a>
          </div>

          <div className={s.menuItems}>
            <a onClick={() => handleClick('/contact')}>Contact</a>
          </div>
        </div>

        <div className="mt-10 text-right flex">
          <span className="mr-3">
            <a href="https://www.havafy.vn" >
              <img src="/assets/country/VN.svg" width="25px" />
            </a></span>
          <span className="font-semibolb">
            <a href="https://www.havafy.vn" >
              Tiếng Việt - VN</a>
          </span>
        </div>

      </Drawer>
    </div>
  )
}

export default Burger
