import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceProductCatalog1791383812121 implements MigrationInterface {
    name = 'EnhanceProductCatalog1791383812121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "image_url" TO "portion_size"`);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying(500) NOT NULL, "alt_text" character varying(150), "sort_order" integer NOT NULL DEFAULT '0', "product_id" uuid, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(50) NOT NULL, "color_hex" character varying(7), CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_tags" ("product_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_8ca809b37ff76596b63fe60ac41" PRIMARY KEY ("product_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5b0c6fc53c574299ecc7f9ee22" ON "product_tags"  ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2cd3faf2e129a4c69c05a291e" ON "product_tags"  ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "portion_size"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "portion_size" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "product_tags" ADD CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_f2cd3faf2e129a4c69c05a291e8"`);
        await queryRunner.query(`ALTER TABLE "product_tags" DROP CONSTRAINT "FK_5b0c6fc53c574299ecc7f9ee22e"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_4f166bb8c2bfcef2498d97b4068"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "portion_size"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "portion_size" character varying(500)`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2cd3faf2e129a4c69c05a291e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5b0c6fc53c574299ecc7f9ee22"`);
        await queryRunner.query(`DROP TABLE "product_tags"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME COLUMN "portion_size" TO "image_url"`);
    }

}
