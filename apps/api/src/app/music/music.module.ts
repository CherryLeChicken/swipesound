import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { Interaction } from '../interaction.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Interaction])],
  controllers: [MusicController],
  providers: [MusicService],
  exports: [MusicService],
})
export class MusicModule {}

