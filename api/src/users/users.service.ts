import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/users.entity';
import { IUsers } from './interfaces/users.interface';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
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
      return await this.userRepository.save(userDto);
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

  public async updateProfileUser(id: number, userProfileDto: UserProfileDto): Promise<Users> {
    try {
      const user = await this.userRepository.findOne({id: +id});
      user.name = userProfileDto.name;
      user.email = userProfileDto.email;
      user.username = userProfileDto.username;
      
      return await this.userRepository.save(user);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

}
