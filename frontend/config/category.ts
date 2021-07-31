
const categoryTree: {title: string, value: string}[] = [
   
  ]

export const getName = (category: any) =>{
     
  if(category?.display_name){
    let name = category.display_name
    if(category.parentName.length > 0){
        name = category.parentName.reverse().join(' / ') + ' / ' + name 

    }
    
    return name
  }
  return ''


}
export default categoryTree






