import { Injectable } from '@nestjs/common';
import { url } from 'inspector';
import { SearchService } from '../search/search.service';
import { FilesService } from "../files/files.service";

@Injectable()
export class PagesService {
    constructor(readonly esService: SearchService,
        readonly filesService: FilesService) {}
    
}
