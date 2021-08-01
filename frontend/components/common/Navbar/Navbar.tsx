import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import { Logo, Container } from '@components/ui'
import { Burger, UserNav } from '@components/common'
import { Hape } from '@components/icons'
import { Burger as BurgerIcon } from '@components/icons'
import { BiSearch } from 'react-icons/bi'
import NavbarRoot from './NavbarRoot'
import s from './Navbar.module.css'
import CategoryMenu  from './CategoryMenu'
interface Props {
  darkMode?: boolean;
  hideHeader?: boolean;
}

const SearchBar: React.FC = () =>{
  
    const router = useRouter() 
    const { k } = router.query
    const [ keyword, setKeyword ] = useState<string>()
    const handleSearchChange = (e: any) => {
      setKeyword(e.target.value)
  
    }
    const handleKeyPress = (e: any) => {
      if(e.key === 'Enter'){
        gotoSearchPage()
      }
    }
    const gotoSearchPage = () => {
      router.push('/search?k=' +keyword)
    }
    return (
      <div className={s.searchBarBox}>
        <div className="flex">
          <div className="flex-grow">
            <input type="text" 
            placeholder="Tìm sản phẩm" 
            value={keyword? keyword : k}
            className={s.searchInput} 
            onKeyPress={handleKeyPress}
            onChange={e=>handleSearchChange(e)} />
          </div>     
          <div className="flex-none w-10">
            <button type="button" onClick={gotoSearchPage}><BiSearch /></button></div>
        </div>
      </div>
    )
}

const Navbar: FC<Props> = ({darkMode, hideHeader}) => (
  <>
  { !hideHeader && <NavbarRoot>
    <Container>
      <div className="siteNavbar relative grid grid-cols-12 justify-between align-center  ">
        <div className="col-span-1 items-center">
          <Link href="/">
            <a className={s.logo} aria-label="Logo">
              <Hape fill="#DB4140" width="80px" />
            </a>
          </Link>
          </div>
          <div className="col-span-6">
            <ul className="navMenu mt-3 ml-10 space-x-5 block">
                {/*<li className="dropdown">
                  <span className={s.link}><BurgerIcon /></span>
                <div className="submenu">
             <i className="header-popover-arrow" style={{'transform': `translate(0px, 0px)`, 'right': `15px`}}></i>
                  <CategoryMenu />
                </div>
              </li>
              
                        'thucpham-saykho': '200796',
            'thuc-pham-dong-hop': '200801',
            'thuc-pham-dong-lanh': '200802',
            'gia-vi': '200804',
            'nguyen-lieu-lam-bep': '200814',
            'nha-cua-doi-song': '201237',
            'bep-phong-an': '201237',
            'sua-do-uong': '200838',
            'banh-keo-chocolate': '200785',
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
        
          <div className="col-span-3 searchBar">
           <SearchBar />
          </div>

   
          <div className="col-span-2">
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
}</>
)

export default Navbar
