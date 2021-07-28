import { MaxLength, MinLength , IsOptional} from 'class-validator';

export class StaticPageDto {

    @MaxLength(200)
    @MinLength(3)
    title: string;

    @MaxLength(200)
    @MinLength(3)
    slug: string;

    @MaxLength(200)
    @MinLength(3)
    seo_title: string;

    @MaxLength(300)
    @MinLength(3)
    seo_description: string;


    @MaxLength(1000)
    @MinLength(3)
    content: string;

    @IsOptional()
    status: boolean;
}