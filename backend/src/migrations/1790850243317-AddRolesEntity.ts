import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesEntity1790850243317 implements MigrationInterface {
    name = 'AddRolesEntity1790850243317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "role_id"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_id_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_permissions_enum" AS ENUM('dashboard:read', 'categories:read', 'categories:create', 'categories:update', 'categories:delete', 'products:read', 'products:create', 'products:update', 'products:delete', 'orders:read', 'orders:create', 'orders:update', 'orders:delete', 'customers:read', 'customers:create', 'customers:update', 'customers:delete', 'users:read', 'users:create', 'users:update', 'users:delete', 'roles:manage')`);
        await queryRunner.query(`CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "permissions" "public"."roles_permissions_enum" array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role_id" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role_id" "public"."users_role_id_enum" NOT NULL DEFAULT 'STAFF'`);
        await queryRunner.query(`DROP TABLE "roles"`);
        await queryRunner.query(`DROP TYPE "public"."roles_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_id_enum" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role_id" TO "role"`);
    }

}
