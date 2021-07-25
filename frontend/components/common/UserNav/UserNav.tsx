import { FC } from 'react'
import dynamic from 'next/dynamic'
import cn from 'classnames'
import s from './UserNav.module.css'
import { CartBox } from '@components/common'

interface Props {
  className?: string
}
const UserNav: FC<Props> = ({ className }) => {
  const AuthMenu = dynamic(() => import('./AuthMenu'), { ssr: false })

  return (
    <nav className={cn(s.root, className)}>
      <div className={s.mainContainer}>
     
      {typeof window !== 'undefined' && (
          <AuthMenu />
        )}
         <CartBox />
      </div>
    </nav>
  )
}

export default UserNav
