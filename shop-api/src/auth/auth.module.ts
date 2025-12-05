import { Module } from '@nestjs/common';
import { JwtSharedModule } from './jwt-shared.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtSharedModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
