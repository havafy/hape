import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { ShopDto  } from './dto/shop.dto';
import axios from 'axios'
const ES_INDEX_SHOP = 'shops'

@Injectable()
export class ShopService {
    constructor(readonly esService: SearchService) {}
    
    async get(id: string = '') {

        if(!id ){
            return {}
        }
        
        return  {}
    
    }
    
    async remove(userID: number, id: string) {
        try {
            const checking = await this.esService.findById(ES_INDEX_SHOP, id )
            if(checking.found){
                if(checking._source.userID !== userID ){
                    return {
                        status: false,
                        message: "Permission is denied.",
                    }
                }
                const res = await this.esService.delete(ES_INDEX_SHOP, id )
                if(res.body.result === 'deleted'){
                    return {
                        status: true
                    }
                }
       
            }

        }catch (err) {
          
        }
        return {
            status: false,
            message: "This is not found.",
        }
    }
    async removeDefaultAnother(userID: number) {

       await this.esService.updateByQuery({
            index: ES_INDEX_SHOP, type: '_doc', 
            body: {
                "query": { "match": { "userID": userID } },
                "script": { "inline": "ctx._source.default = false"}
            }})


    }

    async update(userID: number, addressDto: ShopDto) {
        try{    
            const addressID = addressDto.id
            const checking =  await this.esService.findById(ES_INDEX_SHOP, addressDto.id);
            const address = checking._source
            if(address.userID !== userID ){
                return {
                    status: false,
                    message: "Permission is denied.",
                }
            }
            if(addressDto.default){
                await this.removeDefaultAnother(userID)
            }
            const now = new Date();
            addressDto.updatedAt = now.toISOString()

            await this.esService.update(ES_INDEX_SHOP, addressID ,addressDto)
            const updated =  await this.esService.findById(ES_INDEX_SHOP, addressID);
            return {
                address: { ...updated._source },
                status: true
            }
    
        }catch (err){
            console.log(err)
        }
        return {
            address: null,
            status: false,
        }
    }

    async create(shop:any) {
        try {

            const now = new Date();
            const createdAt = now.toISOString()

            const record: any = [
                { index: { _index: ES_INDEX_SHOP } },  {
                ...shop,
                updatedAt: createdAt,
                createdAt
            }]

            const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_SHOP, record);
            const shopID = items[0].index._id
            const { _source } =  await this.esService.findById(ES_INDEX_SHOP, shopID);
            return {
                shop: { ..._source, id: shopID},
                status: true,
            }
        }catch (err){
            console.log('shop create: ', err)
            return {
                shop: null,
                status: false,
            }
        }
        
    }
    async getByUserID(userID: string){
        const { body: { 
            hits: { 
                total,
                hits 
            } } } = await this.esService.findBySingleField(ES_INDEX_SHOP, { userID })
        const count = total.value
        if(count){
          return { ...hits[0]._source, id: hits[0]._id}
        }
      return
  }

}
