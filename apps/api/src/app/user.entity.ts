import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Interaction } from './interaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires: Date;

  @Column({ type: 'int', array: true, default: '{}' })
  preferredGenres: number[];

  @OneToMany(() => Interaction, (interaction) => interaction.user)
  interactions: Interaction[];

  @CreateDateColumn()
  createdAt: Date;
}

