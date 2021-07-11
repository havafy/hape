import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const sharp = require('sharp')
import { nanoid } from 'nanoid'
const WAITING_ROOM = '__WaitingRoom/'
@Injectable()
export class FilesService {
  constructor(
  ) {}


  // remove file by array
  async removeFromS3(  files: string[]) {
    const s3 = new S3();
    for (const url of files) {
      // let remove this file
      const urlSlipt = url.split('.amazonaws.com/');
      if (urlSlipt.length >= 2) {
          const Key = urlSlipt[1]
         
          // call SDK to delete file 
          await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key,
          }).promise();
      }
 
    }
  
  }
  // check on current files, if any file is not existing, let remove it
  async cleanUnusedFiles(reqFiles: string[], curFiles: string[]) {
    const s3 = new S3();
    for (const url of curFiles) {
      if(!reqFiles.includes(url)){
        // let remove this file
        const urlSlipt = url.split('.amazonaws.com/');
        if (urlSlipt.length >= 2) {
            const Key = urlSlipt[1]
            // call SDK to delete file 
            await s3.deleteObject({
              Bucket: process.env.AWS_S3_BUCKET,
              Key,
            }).promise();
        }
      }
     
    }
  
  }
  async uploadPublicFile(dataBuffer: Buffer,fileName: string ) {
    
    const uniqueName = nanoid(6) + '-' +fileName
    const pathResize = UPLOAD_DIR + uniqueName

    try {

        const fileResize = await sharp(dataBuffer).resize(1024, 1024, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 1 } })
                    .toBuffer();
        const s3 = new S3();
        let Key = WAITING_ROOM + uniqueName
        const uploadResult = await s3.upload({
          Bucket: process.env.AWS_S3_BUCKET,
          Body: fileResize,
          Key,
          ACL:'public-read'
        })
          .promise();
    
        return uploadResult
        
    }catch (err) {
      console.log(err)
    }
    return
  }
  isValidateS3URL(url: string): boolean {
    const Bucket = process.env.AWS_S3_BUCKET
    const Region = process.env.AWS_REGION
    return url.includes('https://'+Bucket+ ".s3." + Region)
  }
  async formalizeS3Files(files: string[], keyword=''){

    if(!files){
      return
    }

    let updatedUrl =[]
    const now = new Date();
     const folder = now.getFullYear() +'_' + now.getMonth() + '_' + now.getDate()
    const Bucket = process.env.AWS_S3_BUCKET
    const s3 = new S3();
    for (const url of files) {
        try{
          //make sure that URL from the our S3.
          if(this.isValidateS3URL(url)){
              const urlSlipt = url.split(WAITING_ROOM);
              if (urlSlipt.length >= 2) {
                    const fileName = urlSlipt[1]
                    const CopySource = Bucket + "/" + WAITING_ROOM + fileName
                    const Key = folder + '/' + keyword + '-'+ fileName
                    
                    // begin copy file
                    await s3.copyObject({
                        Bucket: process.env.AWS_S3_BUCKET,
                        CopySource,  // old file Key
                        Key, // new file Key
                        ACL:'public-read'
                    }).promise();

                    // delete the old file
                    await s3.deleteObject({
                      Bucket: process.env.AWS_S3_BUCKET,
                      Key: WAITING_ROOM + fileName,
                    }).promise();
                    updatedUrl.push(urlSlipt[0]+ Key)
              

              }else{
                updatedUrl.push(url)
              }
          }

          }catch(e){
            //file not existing
          }

      }
      return updatedUrl
}
  async deletePublicFile(Key: string) {
    const s3 = new S3();
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET,
      Key
    }).promise();
  }

//   async deletePublicFileWithQueryRunner(fileId: number, queryRunner: QueryRunner) {
//     const file = await queryRunner.manager.findOne(PublicFile, { id: fileId });
//     const s3 = new S3();
//     await s3.deleteObject({
//       Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
//       Key: file.key,
//     }).promise();
//     await queryRunner.manager.delete(PublicFile, fileId);
//   }
}
