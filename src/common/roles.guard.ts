import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private refl: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const required = this.refl.getAllAndOverride<string[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.includes(user?.role);
  }
}