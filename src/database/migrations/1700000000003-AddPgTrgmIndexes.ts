import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPgTrgmIndexes1700000000003 implements MigrationInterface {
  name = 'AddPgTrgmIndexes1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryRunner.query(`
      CREATE INDEX idx_instruments_ticker_trgm
      ON instruments
      USING gin (ticker gin_trgm_ops);
    `);
    await queryRunner.query(`
      CREATE INDEX idx_instruments_name_trgm
      ON instruments
      USING gin (name gin_trgm_ops);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_instruments_name_trgm;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_instruments_ticker_trgm;`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm;`);
  }
}