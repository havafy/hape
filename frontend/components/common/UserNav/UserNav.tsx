import { FC } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import s from './UserNav.module.css'
interface Props {
  className?: string
}
const UserNav: FC<Props> = ({ className }) => {

  return (
    <nav className={cn(s.root, className)}>
      <div className={s.mainContainer}>
        <Link href='/contact'><a className="button arrow">Contact Us</a></Link>
      </div>
    </nav>
  )
}

export default UserNav
