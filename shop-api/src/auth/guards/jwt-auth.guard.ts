import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserPayload } from '../types/user-payload.type';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const authHeader: string | undefined = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException({ message: 'User is not authorized' });
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new UnauthorizedException({ message: 'User is not authorized' });
      }

      const payload = this.jwtService.verify<UserPayload>(token);
      req.user = payload;
      req.userId = payload.id;

      return true;
    } catch (e) {
      throw new UnauthorizedException({ message: `User is not authorized: ${e}` });
    }
  }
}
