export enum UserRole {
    STAFF = 'STAFF',
    ADMIN = 'ADMIN',
}

export enum Permission {
    PRODUCTS_READ = 'products:read',
    PRODUCTS_CREATE = 'products:create',
    PRODUCTS_UPDATE = 'products:update',
    PRODUCTS_DELETE = 'products:delete',

    ORDERS_READ = 'orders:read',
    ORDERS_UPDATE = 'orders:update',

    USERS_READ = 'users:read',
    USERS_UPDATE = 'users:update',
}

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PREPARING = 'PREPARING',
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

export enum ContentType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    HTML = 'HTML',
}