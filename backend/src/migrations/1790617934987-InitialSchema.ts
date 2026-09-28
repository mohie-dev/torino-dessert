import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1790617934987 implements MigrationInterface {
    name = 'InitialSchema1790617934987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(150) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "image_url" character varying(500), "is_available" boolean NOT NULL DEFAULT true, "is_archived" boolean NOT NULL DEFAULT false, "category_id" uuid NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid, "product_name" character varying(150) NOT NULL, "unit_price" numeric(10,2) NOT NULL, "quantity" integer NOT NULL, "subtotal" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('CASH', 'CARD')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "order_number" character varying(50) NOT NULL, "customer_id" uuid NOT NULL, "customer_name" character varying(100) NOT NULL, "customer_phone" character varying(20) NOT NULL, "customer_email" character varying(255), "delivery_address" text, "notes" text, "subtotal" numeric(10,2) NOT NULL, "delivery_fee" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'PENDING', "payment_method" "public"."orders_payment_method_enum" NOT NULL, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(255), CONSTRAINT "UQ_88acd889fbe17d0e16cc4bc9174" UNIQUE ("phone"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "social_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "platform" character varying(50) NOT NULL, "url" character varying(500) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "sort_order" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_50d32c67ddd71c09d372b02167f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."site_contents_type_enum" AS ENUM('TEXT', 'IMAGE', 'HTML')`);
        await queryRunner.query(`CREATE TABLE "site_contents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "section" character varying(100) NOT NULL, "content_key" character varying(100) NOT NULL, "type" "public"."site_contents_type_enum" NOT NULL DEFAULT 'TEXT', "value" text NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d599da8b2334a34cf9bde859f40" UNIQUE ("content_key"), CONSTRAINT "PK_9835e5dd7f2c8783ef79e3fab0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "store_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "store_name" character varying(150) NOT NULL, "phone" character varying(20), "whatsapp" character varying(20), "email" character varying(255), "logo_url" character varying(500), "delivery_fee" numeric(10,2) NOT NULL DEFAULT '0', "is_open" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_4da44f346b360f378f1489b6199" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(100) NOT NULL, "description" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE ("code"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."role_permissions_role_enum" AS ENUM('ADMIN', 'STAFF')`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."role_permissions_role_enum" NOT NULL, "permission_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'STAFF')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'STAFF', "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."role_permissions_role_enum"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "store_settings"`);
        await queryRunner.query(`DROP TABLE "site_contents"`);
        await queryRunner.query(`DROP TYPE "public"."site_contents_type_enum"`);
        await queryRunner.query(`DROP TABLE "social_links"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
