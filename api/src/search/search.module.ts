import { Module, OnModuleInit } from '@nestjs/common';
import { SearchService } from './search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
    imports: [
        ElasticsearchModule.registerAsync({
            useFactory: async () => ({
                node: process.env.ES_HOST
            }),
        })
    ],
    providers: [SearchService],
    exports: [SearchService],
})
export class SearchModule implements OnModuleInit {
    constructor(private searchService: SearchService) {}
    onModuleInit() {
        this.searchService.createIndex().then();
    }
}
