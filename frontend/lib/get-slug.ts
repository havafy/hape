// Remove trailing and leading slash, usually included in nodes
// returned by the BigCommerce API
import * as cleanTextUtils from 'clean-text-utils';
import { trimString } from './product'
const getSlug = (path: string) => {
     path = path.replace(/^\/|\/$/g, '')
          .trim()
          .replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '')
          .replace(/ /g, '').replace(/_/g, '')
          .replace(/-/g, '')
          .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
          .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
          .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
          .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
          .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
          .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/’/g, '')
    return cleanTextUtils.strip.nonASCII(path)
 }
export const hideEmail = function(text: any) {
  return text.replace(/(.{2})(.*)(?=@)/,
    function(gp1: any, gp2: any, gp3:any) { 
      for(let i = 0; i < gp3.length; i++) { 
        gp2+= "*"; 
      } return gp2; 
    });
};
export const phoneFormat = function(phone:string) {

  //remove space
  phone = phone.replace(' ','')

  // remove pre number if have
  const pre = '(+84)'
  phone = phone.replace(pre,'')

  //limit phone length max 11 chars
  phone = trimString(phone, 11)
  //remove 0 on begin if it have
  if(phone.charAt(0) === '0'){
    phone = phone.substring(1)
  } 
  return pre + phone.replace(/\D/g,'')
};
    
export const hideText = function(text: string) {
    return '****' + text.slice(-4)
};
export default getSlug
