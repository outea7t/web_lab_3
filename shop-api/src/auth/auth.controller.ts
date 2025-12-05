import { Body, Controller, Post, Res, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { loginSchema, registerSchema, LoginDto, RegisterDto } from './schemas/auth.schemas';
import { Response, Request } from 'express';

class AuthResponseSwaggerDto {
  readonly accessToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string, maxAgeSeconds: number) {
    res.cookie('refreshToken', token, {
      httpOnly: true,
      secure: false, // в проде true + HTTPS
      sameSite: 'lax',
      path: '/auth',
      maxAge: maxAgeSeconds * 1000,
    });
  }

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiOkResponse({ type: AuthResponseSwaggerDto })
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, refreshExpiresIn } =
      await this.authService.register(body);

    this.setRefreshCookie(res, refreshToken, refreshExpiresIn);

    return { user, accessToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Логин пользователя' })
  @ApiOkResponse({ type: AuthResponseSwaggerDto })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, refreshExpiresIn } =
      await this.authService.login(body);

    this.setRefreshCookie(res, refreshToken, refreshExpiresIn);

    return { user, accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access токена по refresh cookie' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    const { user, accessToken, refreshToken: newRefresh, refreshExpiresIn } =
      await this.authService.refreshTokens(refreshToken);

    this.setRefreshCookie(res, newRefresh, refreshExpiresIn);

    return { user, accessToken };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход пользователя (очистка refresh cookie)' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/auth',
    });

    return { success: true };
  }
}
