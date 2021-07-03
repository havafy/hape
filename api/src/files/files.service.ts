import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { nanoid } from 'nanoid'
@Injectable()
export class FilesService {
  constructor(
  ) {}

  async uploadPublicFile(dataBuffer: Buffer, fileName: string) {
    const s3 = new S3();
    const DIR = '__WaitingRoom/'
    let Key = DIR + nanoid(6) +'-' + fileName
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
