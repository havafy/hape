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

    async createIndex() {
        const checkIndex = await this.esService.indices.exists(
            { index: 'test'
        });
        if (checkIndex.statusCode === 404) {
            this.esService.indices.create(
                {
                    index: 'test',
                    body: {
                        settings: {
                            analysis: {
                                analyzer: {
                                    autocomplete_analyzer: {
                                        tokenizer: 'autocomplete',
                                        filter: ['lowercase'],
                                    },
                                    autocomplete_search_analyzer: {
                                        tokenizer: 'keyword',
                                        filter: ['lowercase'],
                                    },
                                },
                                tokenizer: {
                                    autocomplete: {
                                        type: 'edge_ngram',
                                        min_gram: 1,
                                        max_gram: 30,
                                        token_chars: ['letter', 'digit', 'whitespace'],
                                    },
                                },
                            },
                        },
                        mappings: {
                            properties: {
                                title: {
                                    type: 'text',
                                    fields: {
                                        complete: {
                                            type: 'text',
                                            analyzer: 'autocomplete_analyzer',
                                            search_analyzer: 'autocomplete_search_analyzer',
                                        },
                                    },
                                },
                                year: { type: 'integer' },
                                genres: { type: 'nested' },
                                actors: { type: 'nested' },
                            },
                        },
                    },
                },
                (err) => {
                    if (err) {
                        console.error(err);
                    }
                },
            );
            const body = await this.parseAndPrepareData();
            this.esService.bulk(
                {
                    index: 'test',
                    body,
                },
                (err) => {
                    if (err) {
                        console.error(err);
                    }
                },
            );
        }
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
