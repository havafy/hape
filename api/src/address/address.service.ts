import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import axios from 'axios'
const ES_INDEX_REGION = 'region'

@Injectable()
export class AddressService {
    constructor(readonly esService: SearchService) {}
    
    async get(id: string = '') {

        if(!id ){
            return {}
        }
        
        return  {}
    
    }
    async createData(){

        const existing = await this.esService.checkIndexExisting(ES_INDEX_REGION)
        if(!existing){
           await this.importVietnamRegionData()
           console.log('DONE: importVietnamRegionData')
        }
    }
    async importVietnamRegionData(){


        let { data: { data }} = await axios.get('https://hape.s3.ap-southeast-1.amazonaws.com/Assets/inititalData/cityData.json');

        const records: any = []
        let parentID = null
        for(let region of data){
            records.push( { index: { _index: ES_INDEX_REGION } })
            records.push( {
                id: region.id,
                parentID,
                name: region.name,
                type: region.type
             })
             if(region.sub && region.sub.length){
                for(let regionLevel1 of region.sub){
                    parentID = region.id
                    records.push( { index: { _index: ES_INDEX_REGION } })
                    records.push( {
                        id: regionLevel1.id,
                        parentID,
                        name: regionLevel1.name,
                        type: regionLevel1.type
                    })
                    if(regionLevel1.sub && regionLevel1.sub.length){
                        for(let regionLevel2 of regionLevel1.sub){
                            parentID = regionLevel1.id
                            records.push( { index: { _index: ES_INDEX_REGION } })
                            records.push( {
                                id: regionLevel2.id,
                                parentID,
                                name: regionLevel2.name,
                                type: regionLevel2.type
                            })
                        }
                     }
                }
             }
        }
    
        
        const {  body: {items} } = await this.esService.createByBulk(
            ES_INDEX_REGION, records
            )
     }

}
