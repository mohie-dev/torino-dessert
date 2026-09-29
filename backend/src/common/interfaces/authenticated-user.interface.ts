import { UserRole, Permission } from '../../utils/enums.js';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    permissions: Permission[];
}