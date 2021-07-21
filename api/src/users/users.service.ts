import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, Not} from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { IUsers } from './interfaces/users.interface';
import { SearchService } from '../search/search.service';
import { ShopService } from '../shop/shop.service';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UserProfileDto } from './dto/user-profile.dto';
import * as cleanTextUtils from 'clean-text-utils';

const ES_INDEX_USER = 'users'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    readonly esService: SearchService,
    readonly shopService: ShopService
  ) {}
  public async findByUsername(username: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        username: username,
      },
    });

    return user;
  }
  public async findByEmail(email: string): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    return user;
  }

  async createOnES(user: any) {
    try {

        const now = new Date();
        const createdAt = now.toISOString()
        const userID = user.id
        delete user.id
        const record: any = [
            { index: { _index: ES_INDEX_USER } },  {
            ...user,
            userID,
            updatedAt: createdAt,
            createdAt
        }]
      await this.esService.createByBulk(ES_INDEX_USER, record);
      await this.shopService.create({userID, shopName: user.username})
    }catch (err){
      console.log('user create: ', err)
    }
    
  }
  async updateOnES(user: any) {
    try {

      const now = new Date();
      user.updatedAt = now.toISOString()
      const userOnES = await this.getUserOnES(user.id)
      await this.esService.update(ES_INDEX_USER, userOnES.id , user)


    }catch (err){
      if(err.meta?.statusCode == 404){
        this.createOnES(user)
      }
    }
    
  }
  async getUserOnES(userID: string){
        const { body: { 
            hits: { 
                total,
                hits 
            } } } = await this.esService.findBySingleField(ES_INDEX_USER, { userID })
        const count = total.value
        if(count){
          return { ...hits[0]._source, id: hits[0]._id}
        }
      return
  }

  public async findOne(where: object): Promise<Users> {
    const user = await this.userRepository.findOne({
      where
    })
    return user;
  }
  public async findById(userId: number): Promise<Users> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }
  public async getUniqueUserName(keyword: string): Promise<string> {
    let username = keyword.toLowerCase().replace(' ', '')
    let count = 0
    let checkUsername = username
    while(count < 100){
      const user = await this.findByUsername(checkUsername)
      if(!user){
        return checkUsername
      }
      checkUsername = username + Math.floor(Math.random() * 1000)
      count++
    }
    return Math.random().toString(36).substring(8);
  }
  public async create(userDto: any): Promise<IUsers> {
    try {
      const user = await this.userRepository.save(userDto);
      await this.createOnES(user)
      return user
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
  public async saveByField(id: number, fields: { }): Promise<Users> {
    const user = {
      id,
      ...fields
    }

    return await this.userRepository.save(user);
  }
  public async updateByEmail(email: string): Promise<Users> {
    try {
      const user = await this.userRepository.findOne({ email: email });
      user.password = bcrypt.hashSync(
        Math.random()
          .toString(36)
          .slice(-8),
        8,
      );
      
      return await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  public async updateByPassword(
    id: number,
    password: string,
  ): Promise<Users> {
    try {
      const user = await this.userRepository.findOne({ id: id });
      user.password = bcrypt.hashSync(password, 8);

      return await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }

  }

  public async updateProfileUser(id: number, userProfileDto: UserProfileDto){
    try {
      const user = await this.userRepository.findOne({id});

      user.name = userProfileDto.name;
      const userID = id.toString()
      if(userProfileDto.email !== user.email){
        const email = userProfileDto.email;
        const existing = await this.userRepository.findOne({
          email,
            id:Not(id)
        })
        if(existing ){
          return {
            message: "Email is existing.",
            statusCode: 404
          }
        }
        user.email = email
      }
      if(userProfileDto.username !== user.username){
        const username = this.getSlug(userProfileDto.username);
        const existing = await this.userRepository.findOne({
          username,
            id:Not(id)
        })
        if(existing ){
          return {
            message: "Username is existing.",
            statusCode: 404
          }
        }
        user.username = userProfileDto.username;
      }
   
      if(userProfileDto.phone !== user.phone){
        const phone = this.getSlug(userProfileDto.phone);
        const existing = await this.userRepository.findOne({
          phone,
            id:Not(id)
        })
        if(existing ){
          return {
            message: "Phone is existing.",
            statusCode: 404
          }
        }
        user.phone = userProfileDto.phone;
      }
      if(userProfileDto.shopName){
        const shopName = this.getSlug(userProfileDto.shopName)

        const existing = await this.shopService.checkShopName(userID, shopName)
        if(existing){
          return {
            message: "Shop name is existing.",
            statusCode: 404
          }
        }
        await this.shopService.updateByUser({userID, shopName})
      }
    
      const userUpdated =  await this.userRepository.save(user);
 
      await this.updateOnES(userUpdated)
      const shop = await this.shopService.getByUserID(userID)
      return {
        user: userUpdated,
        shop,
        statusCode: 200
      }

    } catch (err) {
      console.log(err)
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

 public getSlug (path: string){
    if(path === undefined) return
    path = path.replace(/^\/|\/$/g, '')
          .trim()
          .replace(/[&\/\\#”“!@$`’;,+()$~%.'':*^?<>{}]/g, '')
          .replace(/ /g, '').replace(/_/g, '')
          .replace(/-/g, '')
          .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
          .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
          .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
          .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
          .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
          .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
          .replace(/đ/g, 'd')
          .replace(/’/g, '')
      return cleanTextUtils.strip.nonASCII(path)
  }

}
