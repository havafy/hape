import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
const moviesJson = [{
    "title": "After Dark in Central Park",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Boarding School Girls' Pajama Parade",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Buffalo Bill's Wild West Parad",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Caught",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Clowns Spinning Hats",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Capture of Boer Battery by British",
    "year": 1900,
    "cast": [],
    "genres": ["Short", "Documentary"]
}, {
    "title": "The Enchanted Drawing",
    "year": 1900,
    "cast": [],
    "genres": []
}, {
    "title": "Feeding Sea Lions",
    "year": 1900,
    "cast": ["Paul Boyton"],
    "genres": []
}, {
    "title": "How to Make a Fat Wife Out of Two Lean Ones",
    "year": 1900,
    "cast": [],
    "genres": ["Comedy"]
}]

interface MoviesJsonResponse {
    title: string;
    year: number;
    cast: string[];
    genres: string[];
}

@Injectable()
export class SearchService {
    constructor(private readonly esService: ElasticsearchService) {}

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
    async createByBulk(index: string, body: any){
        
        return await this.esService.bulk({ index, body })
    }

    async update(index: string,  id: string, body: any){
        try{
            console.log(body)
            return await this.esService.update({
                index, type: '_doc', id,
                body: {
                    doc: {
                    ...body 
                    }
                }
            })
           
        }catch(err){
            console.log(err)
        }
        return false

    }
    async checkExisting(index: string, field: string, fieldValue: string): Promise<boolean> {
        try {
            const query = {}
            query[field]= fieldValue
            const { body: { hits: { total: { value } } }} = await this.findByFields(index, query);
            return value > 0 ? true : false
        }catch (err){
            console.log(err)
        }
        return true
    }
    async findByFields(index: string, queryMatch: any) {
        const reqParams = {
            index,
            body: {
                query: {
                    match: {
                        ...queryMatch
                    }
                  }
                  
            }
        }
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
            id
          })
        return res
    }
    
    async search(search: string) {
        let results = [];
        const { body } = await this.esService.search({
            index: 'test',
            body: {
                size: 12,
                query: {
                    match: {
                        'title.complete': {
                            query: search,
                        },
                    },
                },
            },
        });
        const hits = body.hits.hits;
        hits.map(item => {
            results.push(item._source);
        });

        return { results, total: body.hits.total.value };
    }

    async parseAndPrepareData() {
        let body = [];
        const listMovies: MoviesJsonResponse[] = moviesJson;
        listMovies.map((item, index) => {
            let actorsData = [];
            item.cast.map(actor => {
                const splited = actor.split(' ');
                actorsData.push({ firstName: splited[0], lastName: splited[1] });
            });

            body.push(
                { index: { _index: 'test', _id: index } },
                {
                    title: item.title,
                    year: item.year,
                    genres: item.genres.map(genre => ({ genre })),
                    actors: actorsData,
                },
            );
        });
        return body;
    }
}
