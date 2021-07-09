import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class PageHomeService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async getContent(search: string = '') {
        let blocks = []
        
        // Collect the main banner 
        const bannerUrl = 'https://'+process.env.AWS_CLOUDFRONT+'/Assets/HomePage/';
        blocks.push({
            type: 'MainBanners',
            data:{
                bannerBig:{
                    link: '/',
                    src: bannerUrl+'h1.gif',
                },
                banner1:{
                    link: '/',
                    src: bannerUrl+'b1.png',
                },
                banner2:{
                    link: '/',
                    src: bannerUrl+'b2.png',
                }, 
                banner3:{
                    link: '/',
                    src: bannerUrl+'b3.png',
                }, 
                banner4:{
                    link: '/',
                    src: bannerUrl+'b4.png',
                }, 
            }
        })

        blocks.push(await this.getBlockByCategory('Thuc-Pham-Do-Uong', "Thực Phẩm & Đồ Uống"))

        blocks.push(await this.getBlockByCategory('Nha-cua-Doi-song', "Nhà cửa & Đời sống"))

        blocks.push(await this.getBlockByCategory('Voucher-Dich-Vu'))

        blocks.push(await this.getBlockByCategory('Thoi-Trang-Nam'))

        blocks.push(await this.getBlockByCategory('Thoi-Trang-Nu'))


        return {blocks}
    }
    async getBlockByCategory(category: string, title = ''){
        let  match = [ 
            {match: { category }},
            {match: { status: true }}
        ]
         return { 
            type: 'productSlide',
            title,
            category,
            data: await this.productsService.getByMultiFields(match)
        }
    }
}
