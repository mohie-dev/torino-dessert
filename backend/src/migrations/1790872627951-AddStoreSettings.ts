import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreSettings1790872627951 implements MigrationInterface {
    name = 'AddStoreSettings1790872627951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_settings" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "store_settings" DROP COLUMN "logo_url"`);
        await queryRunner.query(`ALTER TABLE "store_settings" ADD "facebook_url" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "store_settings" ADD "instagram_url" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "store_settings" ALTER COLUMN "store_name" SET DEFAULT 'Torino Dessert'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "store_settings" ALTER COLUMN "store_name" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "store_settings" DROP COLUMN "instagram_url"`);
        await queryRunner.query(`ALTER TABLE "store_settings" DROP COLUMN "facebook_url"`);
        await queryRunner.query(`ALTER TABLE "store_settings" ADD "logo_url" character varying(500)`);
        await queryRunner.query(`ALTER TABLE "store_settings" ADD "email" character varying(255)`);
    }

}
