import { Permission, UserRole } from "../../../utils/enums.js";


export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.STAFF]: [
        Permission.PRODUCTS_READ,
        Permission.PRODUCTS_CREATE,
        Permission.PRODUCTS_UPDATE,

        Permission.ORDERS_READ,
        Permission.ORDERS_UPDATE,
    ],

    [UserRole.ADMIN]: Object.values(Permission),
};