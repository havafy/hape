import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})

  name: string;

  @Column({unique: true})
  username: string;

  @Column({
    unique: true
  })
  phone: string;

  @Column({
    unique: true
  })
  email: string;

  @Column({ length: 60 })
  password: string;

  @CreateDateColumn()
  createdAt: string;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: number;
}
