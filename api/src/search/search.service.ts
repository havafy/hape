import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
    constructor(private readonly esService: ElasticsearchService) {}

    async updateByQuery(query: any) {
        try{  
            return await this.esService.updateByQuery(query)
        }catch(err){
            console.log(err)
        }
    }
    async createIndex(index, body) {
        const checkIndex = await this.esService.indices.exists({ index  });
        if (checkIndex?.statusCode && checkIndex.statusCode === 404) {
           const res = await this.esService.indices.create({
                    index,
                    body: {
                       ...body
                    }  })
            return res
        }
    }
    async checkIndexExisting(index: string){
        const checkIndex = await this.esService.indices.exists({ index  });
        if (checkIndex?.statusCode && checkIndex.statusCode === 200) {
            return true;
        }
        return false;
    }
    async createByBulk(index: string, body: any, refresh = 'wait_for'){
        const insert = { index, body }
         // waiting for indexing before return
        if(refresh !== ''){
            insert['refresh'] = refresh
        }
        return await this.esService.bulk(insert)
    }

    async update(index: string,  id: string, body: any, refresh: string =  'wait_for'){
        delete body.id

        try{
            const insert = {
                index, type: '_doc', id,
                body: { doc: { ...body} }
            }
             // waiting for indexing before return
            if(refresh !== ''){
                insert['refresh'] = refresh
            }
            return await this.esService.update(insert)
           
        }catch(err){
            console.log(err)
        }
        return false

    }
    async checkExisting(index: string, field: string, fieldValue: string): Promise<boolean> {
        try {
            const query = {}
            query[field]= fieldValue
            const { body: { hits: { total: { value } } }} = await this.findBySingleField(index, query);
            return value > 0 ? true : false
        }catch (err){
            console.log(err)
        }
        return true
    }
    async findBySingleField(index: string, queryMatch: any, size = 30, from = 0, sort = []) {
        const reqParams = {index, body: { size,  from }}
        if(queryMatch){
            reqParams.body['query'] = {  match: { ...queryMatch } }
        }
        if(sort.length){
            reqParams.body['sort'] = sort
        }
        const res = await this.esService.search(reqParams)
        return res
    }
    async findByMultiFields({index, must, must_not = null, size = 30, from = 0, sort = [],  _source = null}) {
        const reqParams = {
            index,
            body: {
                size,
                from,
                query: { bool: { must }  }
            }      
        }
        if(sort.length){
            reqParams.body['sort'] = sort
        }
        if(must_not){
            reqParams.body.query.bool['must_not'] = must_not
        }
        if(Array.isArray(_source)){
            reqParams.body['_source'] = _source
        }
        // console.log(JSON.stringify(reqParams))
        const res = await this.esService.search(reqParams)
        return res
    }
    async findById(index: string, id: string) {
        const { body } = await this.esService.get({
            index,
            id
          })
        return body;
    }
    async delete(index: string, id: string) {
        const res = await this.esService.delete({
            index,
            id,
            refresh: 'wait_for', 
          })
        return res
    }
    
    async search(index: string, body: any) {
        /*
        body: {
            size: 12,
            query: {
                match: {
                    'title.complete': {
                        query: search,
                    },
                },
            } }*/
        return await this.esService.search({index, body});
    }
    makeID (length: number = 10)  {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
}
