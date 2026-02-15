import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) =>
  (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor ? descriptor.value : target);
    return descriptor || target;
  };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
