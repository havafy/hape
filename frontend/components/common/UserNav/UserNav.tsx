import { FC } from 'react'
import dynamic from 'next/dynamic'
import cn from 'classnames'
import s from './UserNav.module.css'
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
      </div>
    </nav>
  )
}

export default UserNav
