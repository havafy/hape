import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProductsService {
    constructor(readonly esService: SearchService) {}

    async findProductss(search: string = '') {
        return await this.esService.search(search);
    }
}
