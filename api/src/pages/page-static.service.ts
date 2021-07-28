import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { ProductsService } from "../products/products.service";
import { StaticPageDto } from "./dto/static-page.dto"
const ES_INDEX_PAGE = 'pages'
        
@Injectable()
export class StaticPageService {
    constructor(readonly esService: SearchService,
        readonly productsService: ProductsService) {}
    
    async get(slug: string) {
        const check = await this.getBySlug(slug)
        if(check === null) return { status: 500, message: 'Page is existing.' }
        return { page: check, status: 200}
    }
    
    async create(userID: string, staticPageDto: StaticPageDto) {
        //check is admin user
        if(!process.env.ADMIN_ID.split(',').includes(String(userID))) return {userID, status: 500 }

        try {
            const check = await this.getBySlug(staticPageDto.slug)
            if(check !== null) return { status: 500, message: 'Page is existing.' }
            const now = new Date();
            const createdAt = now.toISOString()

            const record: any = [
                { index: { _index: ES_INDEX_PAGE } },  {
                ...staticPageDto,
                userID,
                updatedAt: createdAt,
                createdAt
            }]

            const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_PAGE, record);
            const id = items[0].index._id
            const { _source } =  await this.esService.findById(ES_INDEX_PAGE, id);
            return {
                page: { ..._source, id},
                status: true,
            }
        }catch (err){
            return {
                page: null,
                status: false,
            }
        }
        
    }
    async getBySlug(slug: string) {

        const { body:
            { hits: { 
                hits, 
                total 
            }}} = await this.esService.findBySingleField( ES_INDEX_PAGE, { slug })
            const count = total.value
            if(count){
                return { ...hits[0]._source, id: hits[0]._id}
            }
        return null
    }
    async createIndex(){
        const existing = await this.esService.checkIndexExisting(ES_INDEX_PAGE)
        if(!existing){
            this.esService.createIndex(ES_INDEX_PAGE, { mappings: { 
                properties: {  title: { type: 'text'  }, createdAt: { type: 'date' },  }  
            } })
        }
    }
}
