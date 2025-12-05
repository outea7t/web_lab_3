import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_ACCESS_SECRET ?? 'access_secret',
        signOptions: {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
            ? Number(process.env.JWT_ACCESS_EXPIRES_IN)
            : 900, // 15 минут
        },
      }),
    }),
  ],
  exports: [JwtModule], 
})
export class JwtSharedModule {}
