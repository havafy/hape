import { FC, useEffect, useState } from 'react'
import cn from 'classnames'
import { BiSearch } from 'react-icons/bi'
import s from './SearchInput.module.css'
import { useRouter } from 'next/router'

interface Props {
  className?: string
  id?: string
}

const SearchInput: React.FC = () =>{
  
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
    router.push('/search?keyword=' + keyword)
  }
  return (
    <div className={s.searchInputBox}>
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

export default SearchInput
