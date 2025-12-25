import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Interaction } from './interaction.entity';
import { User } from './user.entity';
import { MusicModule } from './music/music.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Used in production
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'swipesound_user',
      password: process.env.DATABASE_PASSWORD || 'swipesound_password',
      database: process.env.DATABASE_NAME || 'swipesound',
      entities: [Interaction, User],
      synchronize: true, // Only for development!
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false, // Required for Supabase/Render
    }),
    TypeOrmModule.forFeature([Interaction, User]),
    MusicModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
