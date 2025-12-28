import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { SwipeType } from '@swipesound/shared-types';
import { User } from './user.entity';

@Entity('interactions')
export class Interaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  songId: number;

  @Column({ type: 'varchar', nullable: true })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  artistName: string;

  @Column({ type: 'varchar', nullable: true })
  albumArt: string;

  @Column({ type: 'varchar', nullable: true })
  previewUrl: string;

  @Column({ type: 'int', nullable: true })
  genreId: number;

  @Column({
    type: 'enum',
    enum: SwipeType,
  })
  type: SwipeType;

  @Column({ type: 'varchar', nullable: true })
  sessionId: string;

  @ManyToOne(() => User, (user) => user.interactions, { nullable: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}

