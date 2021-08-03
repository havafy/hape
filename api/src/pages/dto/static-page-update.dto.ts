import { MaxLength, MinLength , IsOptional} from 'class-validator';

export class StaticPageUpdateDto {
    @IsOptional()
    @MaxLength(200)
    @MinLength(3)

    title: string;
    @IsOptional()
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

    @IsOptional()
    @MaxLength(5000)
    @MinLength(3)
    content: string;

    @IsOptional()
    status: boolean;
}