export enum UserRole {
    STAFF = 'STAFF',
    ADMIN = 'ADMIN',
}

export enum Permission {
    // 1. Dashboard & Statistics
    DASHBOARD_READ = 'dashboard:read',

    // 2. Categories
    CATEGORIES_READ = 'categories:read',
    CATEGORIES_CREATE = 'categories:create',
    CATEGORIES_UPDATE = 'categories:update',
    CATEGORIES_DELETE = 'categories:delete',

    // 3. Products
    PRODUCTS_READ = 'products:read',
    PRODUCTS_CREATE = 'products:create',
    PRODUCTS_UPDATE = 'products:update',
    PRODUCTS_DELETE = 'products:delete',

    // 4. Orders
    ORDERS_READ = 'orders:read',
    ORDERS_CREATE = 'orders:create',
    ORDERS_UPDATE = 'orders:update',
    ORDERS_DELETE = 'orders:delete',

    // 5. Customers 
    CUSTOMERS_READ = 'customers:read',
    CUSTOMERS_CREATE = 'customers:create',
    CUSTOMERS_UPDATE = 'customers:update',
    CUSTOMERS_DELETE = 'customers:delete',

    // 6. Users & Roles 
    USERS_READ = 'users:read',
    USERS_CREATE = 'users:create',
    USERS_UPDATE = 'users:update',
    USERS_DELETE = 'users:delete',
    ROLES_MANAGE = 'roles:manage',
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