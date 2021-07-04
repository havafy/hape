import { 
    Controller, 
    Post, 
    Body, 
    Res, 
    UseGuards, UseInterceptors, 
    UploadedFile} from "@nestjs/common";
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { FilesService } from "./files.service";
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))   
@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post("api/file")
  public async uploadFile(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if(file === undefined){
      return{
        status: false,
      }
    }
    const res = await this.filesService.uploadPublicFile(file.buffer, file.originalname)

    if(res?.Key){
      const fileUrl = res.Location
      return  {
          name: file.originalname,
          status: 'done',
          url: fileUrl,
          thumbUrl: fileUrl
      }
    }
    return  {
      status: 'fail',
    }

}
   
//   @Post()
//   public async upload(
//     @Res() res,
//     @Body() body: any
//   ): Promise<any> {
//     try {
//      // const res = await this.fileService.upload(body);

//       return res.status(HttpStatus.OK).json({
//         "name": "xxx.png",
//         "status": "done",
//         "url": "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png",
//         "thumbUrl": "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
//     });
//     } catch (err) {
//       return res.status(HttpStatus.BAD_REQUEST).json({
//         message: "Error: Upload failed!",
//         status: 400,
//       });
//     }
//   }
}