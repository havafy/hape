import { FC, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router' 
import s from './CategoryMenu.module.css'
import category, { default as categoryTree } from '@config/category'
const CategoryMenu: React.FC = () =>{
    const router = useRouter() 
    return (
      <div className={s.categoryMenu}>
          
        <div className="grid grid-flow-col grid-cols-3 grid-rows-6 gap-6">

            {categoryTree.map(((category, key)=>(

                <div className={s.menuItem} key={key}>
                    <Link href={'/c/' + category.value} >
                        <a>{category.title}</a>
                   </Link>
                </div>
            )))}

        </div>
      </div>
    )
}
export default CategoryMenu