import { FC, useEffect, useState } from 'react'
import Link from 'next/link'
import s from './StaticPage.module.css'
import { allowedTags } from '@lib/product'
import axios from 'axios'


const StaticPage: FC<{pid: string}> = ({pid}) => {
  const [pageContent, setPageContent] = useState<string | null>('')
  console.log('pid:', pid)
  useEffect(() => {
    pullPageContent()
  }, [pid])

  const pullPageContent = async ()=>{
    try{
      let { data: { page, status } } = await axios.get('/pages/' + pid)
      if(status === 200){
        setPageContent(page)
        return
      }

    }catch(err){

    }
    setPageContent(null)
  }

  return (
    <main className="mt-16">
        <div className="mx-auto max-w-7xl">
      <div className="md:grid md:grid-cols-2 md:gap-6">
          <div className="md:col-span-2">
          {pageContent !== null && <div>
            <div className='product-description'  
              dangerouslySetInnerHTML={{ __html: allowedTags(pageContent) }} />
    
            </div> }
          </div>
      </div>
      </div>

    </main>
  )
}

export default StaticPage
