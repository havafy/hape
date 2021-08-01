import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
const sharp = require('sharp')
import axios from 'axios'
import { nanoid } from 'nanoid'
import { fromBuffer } from 'file-type'
const WAITING_ROOM = '__WaitingRoom/'
const MAX_WIDTH = 1024
const MAX_HEIGHT = 1024
@Injectable()
export class FilesService {
  constructor(
  ) {}

  async test(){
    try{
      let i = 17
      while(i < 25){
   
        const{ data } = await axios.get('https://www.hape.vn/api/products/pull?page='+i+'&per_page=50', {
          headers: { Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjI3NzQxMDQ0LCJleHAiOjE2MjkwMzcwNDR9._9d1I0qTUbTHhBHPldPx5m_qIicWr2Rq0jjtEPM6vCE` },
        })
        console.log('----------page: ' + i, data)
        i++
      }
    }catch(error){
      console.log(error)
    }

    return ''

  }
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
  async getBase64(url: string) {
    try{
      const res = await axios.get(encodeURI(url), { responseType: "arraybuffer" });
      if(res.data && await this.isMediaFile(res.data)){
        
        return await sharp(res.data).resize(MAX_WIDTH, MAX_HEIGHT, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 } })
          .toBuffer();
      }
    }catch(err){

    }

    return null
  }
  async isMediaFile(buffer){
    const file = await fromBuffer(buffer)
    if([
      'image/png', 'image/jpeg', 'image/gif', 'video/mpeg', 'image/webp'
    ].includes(file.mime)){
      return true
    }
    return false
  }
  async getExtFile(buffer){
    const file = await fromBuffer(buffer)
    return file.ext
  }
  async uploadPublicFile(dataBuffer: Buffer,fileName: string ) {
    
    const uniqueName = nanoid() + '.' + await this.getExtFile(dataBuffer)
    try {
      if(await this.isMediaFile(dataBuffer)){
      
        const fileResize = await sharp(dataBuffer).resize(MAX_WIDTH, MAX_HEIGHT, {
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
        }).promise();
    
        return uploadResult
      }
        
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
     const folder = "media/" + now.getFullYear() +'_' + now.getMonth() + '_' + now.getDate()
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
          }else{
            // if this is external URL, let download it to our S3
            const dataBuffer = await this.getBase64(url)
            if(dataBuffer !== null){
              const fileName =  nanoid() + '.' + await this.getExtFile(dataBuffer)
              const Key = folder + '/' + (keyword !== '' ? keyword + '-' : '') + fileName
              const uploadResult = await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET,
                Body: dataBuffer,
                Key,
                ACL:'public-read'
              }).promise();
              updatedUrl.push(uploadResult.Location)
            }else{
              console.log('[ERROR] getBase64: ' + url)
            }

          }

          }catch(e){
            //file not existing
            console.log('formalizeS3Files: ', e.message)
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
