import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";

@Injectable()
export class HomePageService {
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
/*

          'thucpham-saykho': '200796',
            'thuc-pham-dong-hop': '200801',
            'thuc-pham-dong-lanh': '200802',
            'gia-vi': '200804',
            'nguyen-lieu-lam-bep': '200814',
            'nha-cua-doi-song': '201237',
            'bep-phong-an': '201237',
            'sua-do-uong': '200838',
            'banh-keo-chocolate': '200785',*/
        blocks.push(await this.getBlockByCategory('200796', "T"))

        blocks.push(await this.getBlockByCategory('200801', "Đồ đống hộp & Đậu"))

        blocks.push(await this.getBlockByCategory('200802', "Thực phẩm đông lạnh"))

        blocks.push(await this.getBlockByCategory('200804', "Gia vị & Nguyên liệu"))

        blocks.push(await this.getBlockByCategory('200814', "Làm bánh & Phụ gia"))
        blocks.push(await this.getBlockByCategory('201237', "Nhà cửa & Đời sống"))
        blocks.push(await this.getBlockByCategory('200838', "Sữa & Nước ngọt"))
        blocks.push(await this.getBlockByCategory('200785', "Bánh ngọt & Kẹo"))

        return {blocks}
    }
    async getBlockByCategory(categories: string, title = ''){
        let  must = [ 
            {match: { categories }},
            {match: { status: true }}
        ]
         return { 
            type: 'productSlide',
            title,
            categories,
            data: await this.productsService.getByMultiFields({must})
        }
    }
}
