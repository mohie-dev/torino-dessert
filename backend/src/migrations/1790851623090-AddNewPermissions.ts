import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewPermissions1790851623090 implements MigrationInterface {
    name = 'AddNewPermissions1790851623090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum" ADD VALUE 'users:manage'`);
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum" ADD VALUE 'settings:manage'`);
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum" ADD VALUE 'reports:read'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_permissions_enum_old" AS ENUM('dashboard:read', 'categories:read', 'categories:create', 'categories:update', 'categories:delete', 'products:read', 'products:create', 'products:update', 'products:delete', 'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'customers:read', 'customers:create', 'customers:update', 'customers:delete', 'users:read', 'users:create', 'users:update', 'users:delete', 'roles:manage')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "permissions" TYPE "public"."roles_permissions_enum_old"[] USING "permissions"::"text"::"public"."roles_permissions_enum_old"[]`);
        await queryRunner.query(`DROP TYPE "public"."roles_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum_old" RENAME TO "roles_permissions_enum"`);
    }

}
