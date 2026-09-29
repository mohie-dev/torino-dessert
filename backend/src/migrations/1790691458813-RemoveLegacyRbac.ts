import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyRbac1790XXXXXXXXX implements MigrationInterface {
    name = 'RemoveLegacyRbac1790XXXXXXXXX';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        throw new Error(
            'RemoveLegacyRbac is irreversible because the legacy RBAC tables were intentionally removed.',
        );
    }
}