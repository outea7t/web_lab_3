import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto } from './schemas/auth.schemas';
import { UserPayload } from './types/user-payload.type';
import { User } from '../users/user.model';

interface AuthTokens {
  user: UserPayload;
  accessToken: string;
  refreshToken: string;
  refreshExpiresIn: number; // в секундах
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private buildPayload(user: User): UserPayload {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = this.buildPayload(user);

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET ?? 'access_secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
        ? Number(process.env.JWT_ACCESS_EXPIRES_IN)
        : 900,
    });

    const refreshExpiresIn =
      process.env.JWT_REFRESH_EXPIRES_IN
        ? Number(process.env.JWT_REFRESH_EXPIRES_IN)
        : 60 * 60 * 24 * 7;

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
      expiresIn: refreshExpiresIn,
    });

    return { user: payload, accessToken, refreshToken, refreshExpiresIn };
  }

  async register(dto: RegisterDto): Promise<AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.createUser({
      email: dto.email.toLowerCase(),
      password: hash,
      role: dto.role ?? 'user',

      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender ?? 'na',
      city: dto.city ?? null,
      about: dto.about ?? null,
      marketing: dto.marketing ?? false,
      notify: dto.notify ?? true,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken?: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    try {
      const payload = this.jwtService.verify<UserPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET ?? 'refresh_secret',
      });

      const user = await this.usersService.findById(payload.id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
