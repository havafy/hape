import { MaxLength, MinLength , IsOptional} from 'class-validator';

export class StaticPageDto {

    @MaxLength(200)
    @MinLength(3)
    title: string;

    @MaxLength(200)
    @MinLength(3)
    slug: string;

    @IsOptional()
    @MaxLength(200)
    @MinLength(3)
    seo_title: string;

    @IsOptional()
    @MaxLength(300)
    @MinLength(3)
    seo_description: string;


    @MaxLength(50000)
    @MinLength(3)
    content: string;

    @IsOptional()
    status: boolean;
}