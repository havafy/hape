import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  avatar: string;

  @Column({unique: true})
  username: string;

  @Column({
    unique: true,
    nullable: true
  })
  phone: string;

  @Column({
    unique: true
  })
  email: string;

  @Column()
  email_verify: boolean;

  @Column({ nullable: true})
  verify_key: string;
  
  @Column({ length: 60 })
  password: string;

  @Column({nullable: true})
  google_id: string;

  @Column({nullable: true})
  facebook_id: string;

  @Column({nullable: true})
  apple_id: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: number;
}
