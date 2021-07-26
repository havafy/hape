import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { AddressDto  } from './dto/address.dto';
import { AddressActionDto  } from './dto/address-action.dto';
import axios from 'axios'
const ES_INDEX_REGION = 'region'
const ES_INDEX_ADDRESS = 'addresses'
@Injectable()
export class AddressService {
    constructor(readonly esService: SearchService) {}
    
    async getSummary(id: string ) {

        try {
            const checking = await this.esService.findById(ES_INDEX_ADDRESS, id )
            if(checking.found){
                return {
                    ...checking._source, 
                    regionFull: await this.getFullNameRegion(checking._source)
                }
       
            }

        }catch (err) {
          
        }
        return {
        }
    
    }
    async getByUserID(userID: string,  size: number, from: number) {
        const { body: { 
            hits: { 
                total, 
                hits 
            } } } = await this.esService.findBySingleField(
                ES_INDEX_ADDRESS, 
                { userID }, size, from, 
                [{"createdAt": "desc"}])
        const count = total.value
        let addresses = []
        if(count){
            for(let region of hits){
                addresses.push({
                    id: region._id,
                    ...region._source,
                    regionFull: await this.getFullNameRegion(region._source)
                 })
            }
        }
        return {
            count,
            size,
            from,
            addresses
        }
    }
    async getFullNameRegion(address: AddressDto) {
      
        return await this.getRegionName(address.ward) + ', '
                + await this.getRegionName(address.district) + ', '
                +await this.getRegionName(address.province)

        
    }
    async getRegionName(id: string) {

        const { body:
            { hits: { 
                hits, 
                total 
            }}} = await this.esService.findBySingleField( ES_INDEX_REGION, {id})
            const count = total.value
            if(count){
                return hits[0]._source.name
            }
        return ''
    }
    async remove(userID: number, id: string) {
        try {
            const checking = await this.esService.findById(ES_INDEX_ADDRESS, id )
            if(checking.found){
                if(checking._source.userID !== userID ){
                    return {
                        status: false,
                        message: "Permission is denied.",
                    }
                }
                const res = await this.esService.delete(ES_INDEX_ADDRESS, id )
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
            index: ES_INDEX_ADDRESS, type: '_doc', 
            body: {
                "query": { "match": { "userID": userID } },
                "script": { "inline": "ctx._source.default = false"}
            }})


    }

    async update(userID: number, addressDto: AddressDto) {
        try{    
            const addressID = addressDto.id
            const checking =  await this.esService.findById(ES_INDEX_ADDRESS, addressDto.id);
            const address = checking._source
            if(address.userID !== userID ){
                return {
                    status: false,
                    message: "Permission is denied.",
                }
            }
            const checkWard = await this.getRegionName(addressDto.ward)
            if(checkWard === ''){
                return {
                    status: false,
                    message: "An error occurred on Ward Number.",
                }
            }
            if(addressDto.default){
                await this.removeDefaultAnother(userID)
            }
            const now = new Date();
            addressDto.updatedAt = now.toISOString()

            await this.esService.update(ES_INDEX_ADDRESS, addressID ,addressDto)
            const updated =  await this.esService.findById(ES_INDEX_ADDRESS, addressID);
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

    async action(userID: number, addressActionDto: AddressActionDto) {
        try{    
            const addressID = addressActionDto.id
            const checking =  await this.esService.findById(ES_INDEX_ADDRESS, addressID);
            const address = checking._source
            if(address.userID !== userID ){
                return {
                    status: false,
                    message: "Permission is denied.",
                }
            }
           if(addressActionDto.action === 'setIsDefault'){
                await this.removeDefaultAnother(userID)
                await this.esService.update(ES_INDEX_ADDRESS, addressID , { default: true })
                const updated =  await this.esService.findById(ES_INDEX_ADDRESS, addressID);
                return {
                    address: { ...updated._source },
                    status: true
                }
           }
        }catch (err){
            console.log(err)
        }
        return {
            address: null,
            status: false,
        }
    }
    async create(userID: number, addressDto: AddressDto) {
        try {
            const checkWard = await this.getRegionName(addressDto.ward)
            if(checkWard === ''){
                return {
                    status: false,
                    message: "An error occurred on Ward Number.",
                }
            }
            const now = new Date();
            const createdAt = now.toISOString()
            if(addressDto.default){
                await this.removeDefaultAnother(userID)
            }
            const record: any = [
                { index: { _index: ES_INDEX_ADDRESS } },  {
                ...addressDto,
                userID,
                updatedAt: createdAt,
                createdAt
            }]

            const {  body: {items} } = await this.esService.createByBulk(ES_INDEX_ADDRESS, record);
            const addressID = items[0].index._id
            const { _source } =  await this.esService.findById(ES_INDEX_ADDRESS, addressID);
            return {
                address: { ..._source, id: addressID},
                status: true,
            }
        }catch (err){
            return {
                address: null,
                status: false,
            }
        }
        
    }
    async getByParent(parentID: string | null ) {
        const { body:
            { hits: { 
                hits, 
                total 
            }}} = await this.esService.findBySingleField(
                ES_INDEX_REGION, 
                {parentID: parentID},
                50, 0
            )
        const count = total.value
        let regions: any[] = []
        if(count){
            regions = hits.map((item: any) => {
                return{
                    id: item._id,
                    ...item._source
                    }
            })
        }
        return {
            count: total.value,
            regions
        }
    }
    async createAddressIndex(){
        const existing = await this.esService.checkIndexExisting(ES_INDEX_ADDRESS)
        if(!existing){
            this.esService.createIndex(ES_INDEX_ADDRESS, { mappings: { 
                properties: {  name: { type: 'text'  }, createdAt: { type: 'date' },  }  
            } })
        }
    }
    async createRegionIndex(){

        const existing = await this.esService.checkIndexExisting(ES_INDEX_REGION)
        if(!existing){
           await this.importVietnamRegionData()
           console.log('DONE: importVietnamRegionData')
        }
    }
    async importVietnamRegionData(){
        let { data: { data }} = await axios.get('https://hape.s3.ap-southeast-1.amazonaws.com/Assets/inititalData/cityData.json');

        const records: any = []
        let parentID: string
        for(let region of data){
            parentID = 'VN'
            records.push( { index: { _index: ES_INDEX_REGION } })
            records.push( {
                id: region.id,
                parentID,
                name: region.name.replace('Tỉnh ', '').replace('Thành phố ', ''),
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
        
         await this.esService.createByBulk(ES_INDEX_REGION, records ,'')
     }

}
