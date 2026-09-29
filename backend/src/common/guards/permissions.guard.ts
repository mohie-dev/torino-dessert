import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import { Permission } from '../../utils/enums.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.permissions) {
            throw new ForbiddenException('Access denied. No permissions found.');
        }

        const hasPermission = requiredPermissions.every((permission) =>
            user.permissions.includes(permission),
        );

        if (!hasPermission) {
            throw new ForbiddenException('You do not have the required permissions to perform this action');
        }

        return true;
    }
}