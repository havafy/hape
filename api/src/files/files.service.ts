import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { nanoid } from 'nanoid'
const WAITING_ROOM = '__WaitingRoom/'
@Injectable()
export class FilesService {
  constructor(
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, fileName: string) {
    const s3 = new S3();
    let Key = WAITING_ROOM + nanoid(6) +'-' + fileName
    const uploadResult = await s3.upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Body: dataBuffer,
      Key,
      ACL:'public-read'
    })
      .promise();

    // const newFile = this.publicFilesRepository.create({
    //   key: uploadResult.Key,
    //   url: uploadResult.Location
    // });
    // await this.publicFilesRepository.save(newFile);
    return uploadResult;
  }
  async formalizeS3Files(files: string[], keyword=''){
    let updatedUrl =[]
    const now = new Date();
     const folder = now.getFullYear() +'_' + now.getMonth() + '_' + now.getDate()
    const Bucket = process.env.AWS_S3_BUCKET
    const Region = process.env.AWS_REGION
    const s3 = new S3();
    for (const url of files) {
      if(url.includes('https://'+Bucket+ ".s3." + Region)){
          const urlSlipt = url.split(WAITING_ROOM);
          if (urlSlipt.length >= 2) {
              try{
                const fileName = urlSlipt[1]
                const CopySource = Bucket + "/" + WAITING_ROOM + fileName
                const Key = folder + '/' + fileName
                
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
              }catch(e){
                //file not existing
              }

          }else{
            updatedUrl.push(url)
          }
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
