import { Module, OnModuleInit } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { SearchModule } from '../search/search.module';
import { FilesService } from "../files/files.service";
@Module({
    imports: [SearchModule],
    providers: [PagesService, FilesService],
    controllers: [PagesController],
})
export class PagesModule {}