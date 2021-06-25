import { Injectable } from '@nestjs/common';
import axios from 'axios'

@Injectable()
export class RecaptchaService {
  constructor( ) {}

  public async validate(token: string): Promise<boolean> {
    const secret = process.env.RECAPTCHA_SECRET
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=`+ secret +`&response=` +token;

    const { data } = await axios.post(url)
    return data?.success
  }


}