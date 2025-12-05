import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtSharedModule } from '../auth/jwt-shared.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtSharedModule, 
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
