import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostEntity } from './posts/entities/post.entity';
import { AuthModule } from './auth/auth.module';
import { UserEntity } from './auth/entities/user-entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
// import { ConfigService } from '@nestjs/config';
// console.log('Loading environment variables...', ConfigService.get);
// const {
//   DATABASE_TYPE,
//   DATABASE_HOST,
//   DATABASE_PORT,
//   DATABASE_USERNAME,
//   DATABASE_PASSWORD,
//   DATABASE_NAME,
// } = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 5,
      },
    ]),
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute
      max: 100, // Maximum number of items in cache
    }),
    // NOTE: Initially used static configuration, but now using ConfigService for dynamic loading
    // TypeOrmModule.forRoot({
    //   type: DATABASE_TYPE as 'mysql' | 'postgres' | 'sqlite',
    //   host: DATABASE_HOST,
    //   port: +DATABASE_PORT!,
    //   username: DATABASE_USERNAME,
    //   password: DATABASE_PASSWORD,
    //   database: DATABASE_NAME,
    //   entities: [PostEntity, UserEntity],
    //   synchronize: true,
    // }),
    // NOTE: Now using to load environment variables dynamically using ConfigService and .env file
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('DATABASE_TYPE') as
          | 'mysql'
          | 'postgres'
          | 'sqlite',
        host: configService.get<string>('DATABASE_HOST'),
        port: Number(configService.get<string>('DATABASE_PORT')),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [PostEntity, UserEntity],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
